"""
StudentsAI MVP - FastAPI Backend Application
"""

import uuid
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

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
    ErrorResponse,
    SuccessResponse,
    GraphNode,
    NoteConnection,
    BacklinkResponse,
    KeywordsSuggestResponse,
    UpdateTagsRequest,
)
from .auth import (
    authenticate_user,
    register_user,
    get_current_user,
    get_current_user_id,
    create_access_token,
)
from .rate_limiter import check_rate_limit, check_ai_rate_limit, check_auth_rate_limit
from .ai_service import (
    summarize_content,
    generate_flashcards_from_content,
    calculate_note_similarities,
    ai_service,
)
import re

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
            user={"id": user.id, "email": user.email, "created_at": user.created_at},
        )
    except HTTPException:
        raise
    except Exception as e:
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
        user={"id": user.id, "email": user.email, "created_at": user.created_at},
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
    for l in links:
        graph_connections.append(
            NoteConnection(
                source_id=l.from_note_id,
                target_id=l.to_note_id,
                similarity=1.0,
                connection_type="manual",
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


# Run the application
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=DEBUG)
