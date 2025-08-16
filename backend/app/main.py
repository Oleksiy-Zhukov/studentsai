"""
StudentsAI MVP - FastAPI Backend Application
"""

import uuid
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Request, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
from sqlalchemy import text as sql_text

from .config import ALLOWED_ORIGINS, DEBUG, HOST, PORT
from .database import (
    get_db,
    create_tables,
    get_notes_by_user,
    get_note_by_id,
    create_note,
    update_note,
    delete_note,
    get_flashcards_by_note,
    create_flashcard,
    set_note_tags,
    create_note_link,
    delete_note_link,
    get_backlinks,
    get_notes_by_titles,
    replace_manual_links_for_note,
    get_links_for_user_notes,
    get_similarities_for_notes,
    record_event,
    get_recent_events,
    get_totals,
    get_activity_counts,
    compute_streaks,
    ActivityDaily,
    get_user_by_id,
    get_user_by_username,
    get_user_by_email,
    update_user_profile,
)
from .schemas import (
    UserCreate,
    UserLogin,
    Token,
    NoteCreate,
    NoteUpdate,
    NoteResponse,
    NoteListResponse,
    FlashcardResponse,
    SummarizeRequest,
    SummarizeResponse,
    GenerateFlashcardsRequest,
    GenerateFlashcardsResponse,
    GraphResponse,
    SuccessResponse,
    GraphNode,
    NoteConnection,
    BacklinkResponse,
    KeywordsSuggestResponse,
    UpdateTagsRequest,
    ProfileSummaryResponse,
    ActivityResponse,
    ActivityDayCount,
    EventItem,
    EventIngestRequest,
    UserResponse,
    UserProfileUpdate,
    UsernameCheck,
    SettingsAppearance,
    SettingsGraph,
    SettingsAI,
    SettingsStudyFlow,
    SettingsAdvanced,
)
from .auth import (
    authenticate_user,
    register_user,
    get_current_user_id,
    create_access_token,
    verify_password,
    get_password_hash,
)
from .rate_limiter import check_rate_limit, check_ai_rate_limit, check_auth_rate_limit
from .ai_service import (
    summarize_content,
    generate_flashcards_from_content,
    calculate_note_similarities,
    ai_service,
)
import re
import shutil
import datetime

# Create FastAPI app
app = FastAPI(
    title="StudentsAI MVP API",
    description="AI-powered study assistant API",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if DEBUG else ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Serve uploaded files (development convenience)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if DEBUG else None,
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "StudentsAI MVP API"}


# Authentication endpoints
@app.post("/auth/register", response_model=Token)
async def register(
    user_data: UserCreate, request: Request, db: Session = Depends(get_db)
):
    """Register a new user"""
    await check_auth_rate_limit(request)

    try:
        user = register_user(db, user_data)
        access_token = create_access_token(data={"sub": user.email})

        return Token(
            access_token=access_token,
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "created_at": user.created_at,
            },
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Login user"""
    await check_auth_rate_limit(request)

    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"sub": user.email})

    return Token(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "created_at": user.created_at,
        },
    )


# Note endpoints
@app.get("/notes", response_model=NoteListResponse)
async def get_notes(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get user's notes"""
    await check_rate_limit(request, str(user_id))

    notes = get_notes_by_user(db, user_id, skip, limit)

    return NoteListResponse(
        notes=[
            NoteResponse(
                id=note.id,
                title=note.title,
                content=note.content,
                summary=note.summary,
                created_at=note.created_at,
                updated_at=note.updated_at,
                tags=note.tags or [],
            )
            for note in notes
        ],
        total=len(notes),
        page=skip // limit + 1,
        per_page=limit,
    )


@app.post("/notes", response_model=NoteResponse)
async def create_new_note(
    note_data: NoteCreate,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create a new note"""
    await check_rate_limit(request, str(user_id))

    note = create_note(db, note_data.title, note_data.content, user_id)
    try:
        record_event(db, user_id, "NOTE_CREATED", target_id=note.id)
    except Exception:
        pass

    return NoteResponse(
        id=note.id,
        title=note.title,
        content=note.content,
        summary=note.summary,
        created_at=note.created_at,
        updated_at=note.updated_at,
        tags=note.tags or [],
    )


@app.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: uuid.UUID,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a specific note"""
    await check_rate_limit(request, str(user_id))

    note = get_note_by_id(db, note_id, user_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    return NoteResponse(
        id=note.id,
        title=note.title,
        content=note.content,
        summary=note.summary,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@app.put("/notes/{note_id}", response_model=NoteResponse)
async def update_existing_note(
    note_id: uuid.UUID,
    note_data: NoteUpdate,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update a note"""
    await check_rate_limit(request, str(user_id))

    note = get_note_by_id(db, note_id, user_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    updated_note = update_note(
        db,
        note,
        title=note_data.title,
        content=note_data.content,
        summary=note_data.summary,
    )

    # Parse manual wiki-links [[Title]] and update note_links
    try:
        content_to_parse = updated_note.content or ""
        titles = re.findall(r"\[\[([^\]]+)\]\]", content_to_parse)
        titles = [t.strip() for t in titles if t.strip()]
        targets = get_notes_by_titles(db, user_id, titles)
        replace_manual_links_for_note(
            db, user_id, updated_note.id, [n.id for n in targets]
        )
    except Exception:
        pass

    return NoteResponse(
        id=updated_note.id,
        title=updated_note.title,
        content=updated_note.content,
        summary=updated_note.summary,
        created_at=updated_note.created_at,
        updated_at=updated_note.updated_at,
        tags=updated_note.tags or [],
    )


@app.put("/notes/{note_id}/tags", response_model=NoteResponse)
async def update_note_tags(
    note_id: uuid.UUID,
    request_data: UpdateTagsRequest,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    note = get_note_by_id(db, note_id, user_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    updated = set_note_tags(db, note, request_data.tags)
    return NoteResponse(
        id=updated.id,
        title=updated.title,
        content=updated.content,
        summary=updated.summary,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
        tags=updated.tags or [],
    )


@app.post("/notes/{note_id}/links", response_model=SuccessResponse)
async def create_manual_link(
    note_id: uuid.UUID,
    target_note_id: uuid.UUID,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    # Ensure both notes belong to user
    source = get_note_by_id(db, note_id, user_id)
    target = get_note_by_id(db, target_note_id, user_id)
    if not source or not target:
        raise HTTPException(status_code=404, detail="Note not found")
    create_note_link(
        db, from_note_id=note_id, to_note_id=target_note_id, link_type="manual"
    )
    return SuccessResponse(message="Link created")


@app.delete("/notes/{note_id}/links/{target_note_id}", response_model=SuccessResponse)
async def delete_manual_link(
    note_id: uuid.UUID,
    target_note_id: uuid.UUID,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    # Ensure both notes belong to user
    source = get_note_by_id(db, note_id, user_id)
    target = get_note_by_id(db, target_note_id, user_id)
    if not source or not target:
        raise HTTPException(status_code=404, detail="Note not found")
    delete_note_link(db, from_note_id=note_id, to_note_id=target_note_id)
    return SuccessResponse(message="Link deleted")


@app.get("/notes/{note_id}/backlinks", response_model=List[BacklinkResponse])
async def fetch_backlinks(
    note_id: uuid.UUID,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    # Verify note exists
    note = get_note_by_id(db, note_id, user_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    linked_notes = get_backlinks(db, note_id)
    return [
        BacklinkResponse(
            note_id=n.id,
            title=n.title,
            excerpt=(n.content[:120] + "...") if len(n.content) > 120 else n.content,
            created_at=n.created_at,
        )
        for n in linked_notes
    ]


@app.delete("/notes/{note_id}")
async def delete_existing_note(
    note_id: uuid.UUID,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a note"""
    await check_rate_limit(request, str(user_id))

    note = get_note_by_id(db, note_id, user_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    delete_note(db, note)

    return SuccessResponse(message="Note deleted successfully")


# AI endpoints
@app.post("/ai/summarize", response_model=SummarizeResponse)
async def summarize_text(
    request_data: SummarizeRequest,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Generate summary of text content"""
    await check_ai_rate_limit(request, str(user_id))

    try:
        summary = await summarize_content(request_data.content)

        return SummarizeResponse(
            summary=summary,
            word_count=len(summary.split()),
            original_length=len(request_data.content),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}",
        )


@app.post("/ai/flashcards", response_model=GenerateFlashcardsResponse)
async def generate_flashcards(
    request_data: GenerateFlashcardsRequest,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Generate flashcards from content"""
    await check_ai_rate_limit(request, str(user_id))

    try:
        flashcards = await generate_flashcards_from_content(
            request_data.content, request_data.count
        )

        return GenerateFlashcardsResponse(flashcards=flashcards, count=len(flashcards))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate flashcards: {str(e)}",
        )


@app.post("/notes/{note_id}/summarize", response_model=NoteResponse)
async def summarize_note(
    note_id: uuid.UUID,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Generate summary for a specific note"""
    await check_ai_rate_limit(request, str(user_id))

    note = get_note_by_id(db, note_id, user_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    try:
        summary = await summarize_content(note.content)
        updated_note = update_note(db, note, summary=summary)
        try:
            record_event(db, user_id, "NOTE_REVIEWED", target_id=note.id)
        except Exception:
            pass

        return NoteResponse(
            id=updated_note.id,
            title=updated_note.title,
            content=updated_note.content,
            summary=updated_note.summary,
            created_at=updated_note.created_at,
            updated_at=updated_note.updated_at,
            tags=updated_note.tags or [],
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}",
        )


# Flashcard endpoints
@app.get("/notes/{note_id}/flashcards", response_model=List[FlashcardResponse])
async def get_note_flashcards(
    note_id: uuid.UUID,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get flashcards for a note"""
    await check_rate_limit(request, str(user_id))

    note = get_note_by_id(db, note_id, user_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    flashcards = get_flashcards_by_note(db, note_id)
    try:
        record_event(db, user_id, "NOTE_REVIEWED", target_id=note_id)
    except Exception:
        pass

    return [
        FlashcardResponse(
            id=flashcard.id,
            question=flashcard.question,
            answer=flashcard.answer,
            difficulty=flashcard.difficulty,
            last_reviewed=flashcard.last_reviewed,
            created_at=flashcard.created_at,
        )
        for flashcard in flashcards
    ]


@app.post(
    "/notes/{note_id}/flashcards/generate", response_model=List[FlashcardResponse]
)
async def generate_note_flashcards(
    note_id: uuid.UUID,
    count: int = 5,
    request: Request = None,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Generate and save flashcards for a note"""
    await check_ai_rate_limit(request, str(user_id))

    note = get_note_by_id(db, note_id, user_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )

    try:
        generated_flashcards = await generate_flashcards_from_content(
            note.content, count
        )

        saved_flashcards = []
        for flashcard_data in generated_flashcards:
            flashcard = create_flashcard(
                db, flashcard_data.question, flashcard_data.answer, note_id
            )
            try:
                record_event(db, user_id, "FLASHCARD_CREATED", target_id=flashcard.id)
            except Exception:
                pass
            saved_flashcards.append(
                FlashcardResponse(
                    id=flashcard.id,
                    question=flashcard.question,
                    answer=flashcard.answer,
                    difficulty=flashcard.difficulty,
                    last_reviewed=flashcard.last_reviewed,
                    created_at=flashcard.created_at,
                )
            )

        return saved_flashcards

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate flashcards: {str(e)}",
        )


# Graph endpoints
@app.get("/graph", response_model=GraphResponse)
async def get_notes_graph(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get graph visualization of notes"""
    await check_rate_limit(request, str(user_id))

    notes = get_notes_by_user(db, user_id)

    if len(notes) < 2:
        return GraphResponse(
            nodes=[
                GraphNode(
                    id=note.id,
                    title=note.title,
                    content_preview=note.content[:200] + "..."
                    if len(note.content) > 200
                    else note.content,
                    created_at=note.created_at,
                    word_count=len(note.content.split()),
                )
                for note in notes
            ],
            connections=[],
            total_nodes=len(notes),
        )

    # Prepare notes data for similarity calculation
    notes_data = [
        {"id": note.id, "title": note.title, "content": note.content} for note in notes
    ]

    # Calculate connections
    connections = calculate_note_similarities(notes_data)

    # Create graph nodes
    nodes = [
        GraphNode(
            id=note.id,
            title=note.title,
            content_preview=note.content[:200] + "..."
            if len(note.content) > 200
            else note.content,
            created_at=note.created_at,
            word_count=len(note.content.split()),
        )
        for note in notes
    ]

    # Create graph connections
    graph_connections = [
        NoteConnection(
            source_id=conn["source_id"],
            target_id=conn["target_id"],
            similarity=conn["similarity"],
            connection_type=conn["connection_type"],
        )
        for conn in connections
    ]

    # Merge manual links
    links = get_links_for_user_notes(db, [n.id for n in notes])
    for link_row in links:
        graph_connections.append(
            NoteConnection(
                source_id=link_row.from_note_id,
                target_id=link_row.to_note_id,
                similarity=1.0,
                connection_type="manual",
            )
        )

    # Merge stored similarities (authoritative values for edge thickness)
    sims = get_similarities_for_notes(db, [n.id for n in notes])
    for s in sims:
        graph_connections.append(
            NoteConnection(
                source_id=s.note_a_id,
                target_id=s.note_b_id,
                similarity=float(s.similarity) / 1000.0,
                connection_type="similarity",
            )
        )

    return GraphResponse(
        nodes=nodes, connections=graph_connections, total_nodes=len(notes)
    )


# Keyword suggestion endpoint (local, cheap)
@app.get("/notes/{note_id}/keywords", response_model=KeywordsSuggestResponse)
async def suggest_keywords(
    note_id: uuid.UUID,
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    note = get_note_by_id(db, note_id, user_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    word_count = len((note.content or "").split())
    max_keywords = 8 if word_count < 400 else 12 if word_count < 1200 else 18
    keywords = ai_service.extract_keywords(note.content, max_keywords=max_keywords)
    return KeywordsSuggestResponse(note_id=note.id, keywords=keywords)


# Profile/Events endpoints
@app.get("/api/profile/summary", response_model=ProfileSummaryResponse)
async def profile_summary(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    totals = get_totals(db, user_id)
    current_streak, best_streak = compute_streaks(db, user_id)

    # activity windows
    now = datetime.datetime.now(datetime.timezone.utc)
    d7 = now - datetime.timedelta(days=7)
    d30 = now - datetime.timedelta(days=30)
    a7_rows = get_activity_counts(db, user_id, d7, now, kind="all")
    a30_rows = get_activity_counts(db, user_id, d30, now, kind="all")

    return ProfileSummaryResponse(
        notes_created=totals["notes_created"],
        notes_reviewed=totals["notes_reviewed"],
        flashcards_created=totals["flashcards_created"],
        flashcards_reviewed=totals["flashcards_reviewed"],
        current_streak=current_streak,
        best_streak=best_streak,
        activity_7d=sum(r[1] for r in a7_rows),
        activity_30d=sum(r[1] for r in a30_rows),
    )


@app.get("/api/profile/activity", response_model=ActivityResponse)
async def profile_activity(
    from_date: str,
    to_date: str,
    kind: str = "all",
    request: Request = None,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    # Parse dates as UTC-midnight boundaries
    start = datetime.datetime.fromisoformat(from_date).replace(
        tzinfo=datetime.timezone.utc
    )
    end_inclusive = datetime.datetime.fromisoformat(to_date).replace(
        tzinfo=datetime.timezone.utc
    )
    end = end_inclusive + datetime.timedelta(days=1)  # make exclusive upper bound
    # Try to use daily aggregates first; fall back to on-the-fly if missing
    agg_rows = (
        db.query(ActivityDaily.day, ActivityDaily.count)
        .filter(
            ActivityDaily.user_id == user_id,
            ActivityDaily.day >= start.date(),
            ActivityDaily.day <= end_inclusive.date(),
            ActivityDaily.kind == kind,
        )
        .order_by(ActivityDaily.day)
        .all()
    )
    if agg_rows:
        rows = [(d, c, None) for (d, c) in agg_rows]
    else:
        rows = get_activity_counts(db, user_id, start, end, kind=kind)

    # Materialize day list for continuity
    days_out: list[ActivityDayCount] = []
    cursor = start.date()
    while cursor <= end_inclusive.date():
        # find row for cursor
        found = next((r for r in rows if r[0].date() == cursor), None)
        if found:
            days_out.append(
                ActivityDayCount(
                    date=str(cursor),
                    count=int(found[1]),
                    top_type=(str(found[2]) if len(found) > 2 and found[2] else None),
                )
            )
        else:
            days_out.append(ActivityDayCount(date=str(cursor), count=0, top_type=None))
        cursor = cursor + datetime.timedelta(days=1)

    return ActivityResponse(
        from_date=from_date, to_date=to_date, kind=kind, days=days_out
    )


@app.get("/api/profile/recent", response_model=List[EventItem])
async def profile_recent(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    events = get_recent_events(db, user_id, limit=10)
    return [
        EventItem(
            id=e.id,
            event_type=e.event_type,
            occurred_at=e.occurred_at,
            target_id=e.target_id,
            metadata=getattr(e, "event_metadata", None),
        )
        for e in events
    ]


@app.post("/api/profile/export")
async def profile_export(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    # Collect user notes and flashcards
    notes = get_notes_by_user(db, user_id)
    out = {
        "notes": [
            {
                "id": str(n.id),
                "title": n.title,
                "content": n.content,
                "summary": n.summary,
                "tags": n.tags,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in notes
        ],
        "flashcards": [],
    }
    for n in notes:
        fcs = get_flashcards_by_note(db, n.id)
        for f in fcs:
            out["flashcards"].append(
                {
                    "id": str(f.id),
                    "note_id": str(n.id),
                    "question": f.question,
                    "answer": f.answer,
                    "difficulty": f.difficulty,
                    "last_reviewed": f.last_reviewed.isoformat()
                    if f.last_reviewed
                    else None,
                    "created_at": f.created_at.isoformat() if f.created_at else None,
                }
            )

    return out


@app.post("/api/events", response_model=SuccessResponse)
async def ingest_event(
    request: Request,
    body: EventIngestRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    await check_rate_limit(request, str(user_id))
    try:
        record_event(
            db,
            user_id=user_id,
            event_type=body.event_type,
            target_id=body.target_id,
            metadata=body.metadata,
            occurred_at=body.occurred_at,
        )
        return SuccessResponse(message="Event recorded")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to record event: {e}")


@app.post("/api/profile/aggregate", response_model=SuccessResponse)
async def profile_aggregate(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Compute daily aggregates for the authenticated user over all time.
    Dev-friendly: safe to run repeatedly (upserts).
    """
    await check_rate_limit(request, str(user_id))
    # Use raw SQL for concise upsert aggregates
    for kind, filter_clause in (
        ("all", ""),
        ("notes", "AND event_type IN ('NOTE_CREATED','NOTE_REVIEWED')"),
        ("flashcards", "AND event_type IN ('FLASHCARD_CREATED','FLASHCARD_REVIEWED')"),
    ):
        stmt = sql_text(
            """
            INSERT INTO activity_daily (user_id, day, kind, count)
            SELECT :uid AS user_id,
                   DATE(occurred_at AT TIME ZONE 'UTC') AS day,
                   :kind AS kind,
                   COUNT(*) AS count
            FROM events
            WHERE user_id = :uid
            {filter_clause}
            GROUP BY DATE(occurred_at AT TIME ZONE 'UTC')
            ON CONFLICT (user_id, day, kind)
            DO UPDATE SET count = EXCLUDED.count;
            """.format(filter_clause=filter_clause)
        )
        db.execute(stmt, {"uid": str(user_id), "kind": kind})
    db.commit()
    return SuccessResponse(message="Aggregates updated")


# Image upload endpoint for pasted images (separate from static mount)
@app.post("/upload/image")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    await check_rate_limit(request, str(user_id))
    try:
        # Basic validation
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, detail="Only image uploads are allowed"
            )

        ext = os.path.splitext(file.filename or "")[1].lower() or ".png"
        safe_ext = ext if ext in [".png", ".jpg", ".jpeg", ".gif", ".webp"] else ".png"
        ts = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        filename = f"{user_id}-{ts}{safe_ext}"
        dest_path = os.path.join(UPLOAD_DIR, filename)
        with open(dest_path, "wb") as out:
            shutil.copyfileobj(file.file, out)
        url_path = f"/uploads/{filename}"
        absolute_url = str(request.base_url).rstrip("/") + url_path
        return {
            "url": absolute_url,
            "filename": filename,
            "content_type": file.content_type,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# Settings endpoints
@app.get("/api/settings/profile", response_model=UserResponse)
async def get_profile_settings(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get current user profile information"""
    await check_rate_limit(request, str(user_id))
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.patch("/api/settings/profile", response_model=UserResponse)
async def update_profile_settings(
    request: Request,
    profile_update: UserProfileUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update user profile settings"""
    await check_rate_limit(request, str(user_id))

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if username is being changed and if it's available
    if profile_update.username and profile_update.username != user.username:
        existing_user = get_user_by_username(db, profile_update.username)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(status_code=400, detail="Username already taken")

    # Check if email is being changed and if it's available
    if profile_update.email and profile_update.email != user.email:
        existing_user = get_user_by_email(db, profile_update.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(status_code=400, detail="Email already taken")

    # Update password if provided
    if profile_update.new_password:
        if not profile_update.current_password:
            raise HTTPException(
                status_code=400, detail="Current password required to change password"
            )

        # Verify current password
        if not verify_password(profile_update.current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        # Hash new password
        hashed = get_password_hash(profile_update.new_password)

    # Prepare update data
    update_data = {}
    if profile_update.username:
        update_data["username"] = profile_update.username
    if profile_update.email:
        update_data["email"] = profile_update.email
    if profile_update.new_password:
        update_data["password_hash"] = hashed

    # Update user
    updated_user = update_user_profile(db, user_id, **update_data)
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update profile")

    return updated_user


@app.get("/api/settings/username/check/{username}", response_model=UsernameCheck)
async def check_username_availability(
    request: Request,
    username: str,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Check if a username is available"""
    await check_rate_limit(request, str(user_id))

    # Check if username is valid
    try:
        UserProfileUpdate(username=username)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check if username is available
    existing_user = get_user_by_username(db, username)
    available = existing_user is None or existing_user.id == user_id

    return UsernameCheck(username=username, available=available)


@app.get("/api/settings/appearance", response_model=SettingsAppearance)
async def get_appearance_settings(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Get user appearance settings (placeholder - return defaults for now)"""
    await check_rate_limit(request, str(user_id))
    return SettingsAppearance()


@app.patch("/api/settings/appearance", response_model=SettingsAppearance)
async def update_appearance_settings(
    request: Request,
    settings: SettingsAppearance,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Update user appearance settings (placeholder - save to database later)"""
    await check_rate_limit(request, str(user_id))
    # TODO: Save to database
    return settings


@app.get("/api/settings/graph", response_model=SettingsGraph)
async def get_graph_settings(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Get user graph view settings (placeholder - return defaults for now)"""
    await check_rate_limit(request, str(user_id))
    return SettingsGraph()


@app.patch("/api/settings/graph", response_model=SettingsGraph)
async def update_graph_settings(
    request: Request,
    settings: SettingsGraph,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Update user graph view settings (placeholder - save to database later)"""
    await check_rate_limit(request, str(user_id))
    # TODO: Save to database
    return settings


@app.get("/api/settings/ai", response_model=SettingsAI)
async def get_ai_settings(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Get user AI feature settings (placeholder - return defaults for now)"""
    await check_rate_limit(request, str(user_id))
    return SettingsAI()


@app.patch("/api/settings/ai", response_model=SettingsAI)
async def update_ai_settings(
    request: Request,
    settings: SettingsAI,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Update user AI feature settings (placeholder - save to database later)"""
    return settings


@app.get("/api/settings/studyflow", response_model=SettingsStudyFlow)
async def get_studyflow_settings(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Get user study flow settings (placeholder - return defaults for now)"""
    await check_rate_limit(request, str(user_id))
    return SettingsStudyFlow()


@app.patch("/api/settings/studyflow", response_model=SettingsStudyFlow)
async def update_studyflow_settings(
    request: Request,
    settings: SettingsStudyFlow,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Update user study flow settings (placeholder - save to database later)"""
    await check_rate_limit(request, str(user_id))
    # TODO: Save to database
    return settings


@app.get("/api/settings/advanced", response_model=SettingsAdvanced)
async def get_advanced_settings(
    request: Request,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Get user advanced settings (placeholder - return defaults for now)"""
    await check_rate_limit(request, str(user_id))
    return SettingsAdvanced()


@app.patch("/api/settings/advanced", response_model=SettingsAdvanced)
async def update_advanced_settings(
    request: Request,
    settings: SettingsAdvanced,
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    """Update user advanced settings (placeholder - save to database later)"""
    await check_rate_limit(request, str(user_id))
    # TODO: Save to database
    return settings


# Run the application
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=DEBUG)
