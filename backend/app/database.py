"""
Database configuration and models for StudentsAI MVP
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Text,
    DateTime,
    Date,
    Integer,
    ForeignKey,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.sql import func
from sqlalchemy import text as sql_text

from .config import DATABASE_URL

REVIEW_TYPES = {"NOTE_REVIEWED", "FLASHCARD_REVIEWED"}

# Database engine and session
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Database models
class User(Base):
    """User model for authentication"""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")


class Note(Base):
    """Note model for storing user notes"""

    __tablename__ = "notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    # Tags for keywords
    tags = Column(ARRAY(String), nullable=True, default=list)

    # Foreign key
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="notes")
    flashcards = relationship(
        "Flashcard", back_populates="note", cascade="all, delete-orphan"
    )


class NoteLink(Base):
    """Explicit links between notes (manual or AI-suggested)."""

    __tablename__ = "note_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_note_id = Column(
        UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False, index=True
    )
    to_note_id = Column(
        UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False, index=True
    )
    link_type = Column(String(50), nullable=False, default="manual")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NoteSimilarity(Base):
    """Stores similarity scores between pairs of notes to drive edge styling.

    The pair is stored as (note_a_id, note_b_id) with note_a_id < note_b_id to ensure uniqueness.
    """

    __tablename__ = "note_similarities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    note_a_id = Column(
        UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False, index=True
    )
    note_b_id = Column(
        UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False, index=True
    )
    similarity = Column(
        Integer, nullable=False
    )  # store as int 0..1000 (similarity*1000) for stability
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Event(Base):
    """User activity events used for stats and heatmaps.

    All timestamps are stored in UTC (timezone-aware) and all aggregation uses UTC day boundaries.
    """

    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    event_type = Column(String(50), nullable=False, index=True)
    occurred_at = Column(
        DateTime(timezone=True), nullable=False, index=True, server_default=func.now()
    )
    target_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    event_metadata = Column("metadata", JSON, nullable=True)


class Flashcard(Base):
    """Flashcard model for spaced repetition"""

    __tablename__ = "flashcards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    difficulty = Column(Integer, default=1)  # 1-5 scale
    last_reviewed = Column(DateTime(timezone=True), nullable=True)
    next_review = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Foreign key
    note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False)

    # Relationships
    note = relationship("Note", back_populates="flashcards")


class ActivityDaily(Base):
    """Pre-aggregated daily activity counts for efficient profile queries.

    Primary key: (user_id, day, kind)
    kind in {"all", "notes", "flashcards"}
    """

    __tablename__ = "activity_daily"

    user_id = Column(UUID(as_uuid=True), primary_key=True)
    day = Column(Date, primary_key=True)
    kind = Column(String(16), primary_key=True)
    count = Column(Integer, nullable=False, default=0)


# Database dependency
def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Database initialization
def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    # Ensure new columns exist in dev without full migration
    try:
        with engine.connect() as conn:
            # Add username column if missing (PostgreSQL)
            conn.execute(
                sql_text(
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)"
                )
            )
            # Add tags column if missing (PostgreSQL)
            conn.execute(
                sql_text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[]")
            )
            # Create events table if missing (dev convenience; use Alembic in prod)
            conn.execute(
                sql_text(
                    """
                CREATE TABLE IF NOT EXISTS events (
                  id UUID PRIMARY KEY,
                  user_id UUID NOT NULL,
                  event_type VARCHAR(50) NOT NULL,
                  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                  target_id UUID NULL,
                  metadata JSON NULL
                );
                CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
                CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
                CREATE INDEX IF NOT EXISTS idx_events_occurred ON events(occurred_at);
                """
                )
            )
            # Similarities table (dev convenience)
            conn.execute(
                sql_text(
                    """
                    CREATE TABLE IF NOT EXISTS note_similarities (
                      id UUID PRIMARY KEY,
                      note_a_id UUID NOT NULL,
                      note_b_id UUID NOT NULL,
                      similarity INTEGER NOT NULL,
                      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    CREATE INDEX IF NOT EXISTS idx_sim_a ON note_similarities(note_a_id);
                    CREATE INDEX IF NOT EXISTS idx_sim_b ON note_similarities(note_b_id);
                    """
                )
            )
            # Activity daily aggregate (dev convenience)
            conn.execute(
                sql_text(
                    """
                    CREATE TABLE IF NOT EXISTS activity_daily (
                      user_id UUID NOT NULL,
                      day DATE NOT NULL,
                      kind VARCHAR(16) NOT NULL,
                      count INTEGER NOT NULL DEFAULT 0,
                      PRIMARY KEY(user_id, day, kind)
                    );
                    """
                )
            )
            # Helpful composite indexes for events queries
            conn.execute(
                Text(
                    """
                    CREATE INDEX IF NOT EXISTS idx_events_user_day ON events(user_id, occurred_at DESC);
                    CREATE INDEX IF NOT EXISTS idx_events_user_type_day ON events(user_id, event_type, occurred_at DESC);
                    """
                )
            )
            conn.commit()
    except Exception:
        # Best-effort; ignore if not supported or already present
        pass


def drop_tables():
    """Drop all database tables (for testing)"""
    Base.metadata.drop_all(bind=engine)


# Database utilities
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session, email: str, password_hash: str, username: str = None
) -> User:
    """Create new user"""
    if username is None:
        # Generate a unique username if none provided
        import uuid

        base_username = f"user_{str(uuid.uuid4())[:8]}"
        username = base_username
        counter = 1
        while get_user_by_username(db, username):
            username = f"{base_username}_{counter}"
            counter += 1

    user = User(email=email, username=username, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def update_user_profile(db: Session, user_id: uuid.UUID, **kwargs) -> Optional[User]:
    """Update user profile fields"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    for field, value in kwargs.items():
        if hasattr(user, field):
            setattr(user, field, value)

    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def get_notes_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100):
    """Get notes for a user"""
    return (
        db.query(Note).filter(Note.user_id == user_id).offset(skip).limit(limit).all()
    )


def get_notes_by_titles(
    db: Session, user_id: uuid.UUID, titles: list[str]
) -> list[Note]:
    """Get notes for a user by exact titles."""
    if not titles:
        return []
    return (
        db.query(Note)
        .filter(Note.user_id == user_id)
        .filter(Note.title.in_(titles))
        .all()
    )


def get_note_by_id(
    db: Session, note_id: uuid.UUID, user_id: uuid.UUID
) -> Optional[Note]:
    """Get note by ID for a specific user"""
    return db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()


def create_note(db: Session, title: str, content: str, user_id: uuid.UUID) -> Note:
    """Create new note"""
    note = Note(title=title, content=content, user_id=user_id)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(
    db: Session, note: Note, title: str = None, content: str = None, summary: str = None
) -> Note:
    """Update existing note"""
    if title is not None:
        note.title = title
    if content is not None:
        note.content = content
    if summary is not None:
        note.summary = summary
    # Tags update handled via separate helper to avoid accidental wipes

    note.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note: Note):
    """Delete note"""
    db.delete(note)
    db.commit()


def get_flashcards_by_note(db: Session, note_id: uuid.UUID):
    """Get flashcards for a note"""
    return db.query(Flashcard).filter(Flashcard.note_id == note_id).all()


def create_flashcard(
    db: Session, question: str, answer: str, note_id: uuid.UUID
) -> Flashcard:
    """Create new flashcard"""
    flashcard = Flashcard(question=question, answer=answer, note_id=note_id)
    db.add(flashcard)
    db.commit()
    db.refresh(flashcard)
    return flashcard


# Event utilities
def record_event(
    db: Session,
    user_id: uuid.UUID,
    event_type: str,
    target_id: Optional[uuid.UUID] = None,
    metadata: Optional[Dict[str, Any]] = None,
    occurred_at: Optional[datetime] = None,
):
    from .database import Event  # local import to avoid circular in type hints

    ts = occurred_at or datetime.now(timezone.utc)
    event = Event(
        user_id=user_id,
        event_type=event_type,
        occurred_at=ts,
        target_id=target_id,
        metadata=metadata or {},
    )
    db.add(event)
    db.commit()
    return event


def get_recent_events(db: Session, user_id: uuid.UUID, limit: int = 10):
    return (
        db.query(Event)
        .filter(Event.user_id == user_id)
        .order_by(Event.occurred_at.desc())
        .limit(limit)
        .all()
    )


def get_totals(db: Session, user_id: uuid.UUID):
    from sqlalchemy import func as _func
    from .database import Event

    totals = (
        db.query(Event.event_type, _func.count())
        .filter(Event.user_id == user_id)
        .group_by(Event.event_type)
        .all()
    )
    as_map = {k: v for k, v in totals}
    return {
        "notes_created": int(as_map.get("NOTE_CREATED", 0)),
        "notes_reviewed": int(as_map.get("NOTE_REVIEWED", 0)),
        "flashcards_created": int(as_map.get("FLASHCARD_CREATED", 0)),
        "flashcards_reviewed": int(as_map.get("FLASHCARD_REVIEWED", 0)),
    }


def get_activity_counts(
    db: Session,
    user_id: uuid.UUID,
    from_date_utc: datetime,
    to_date_utc: datetime,
    kind: str = "all",
):
    from sqlalchemy import func as _func
    from .database import Event

    q = db.query(
        _func.date_trunc("day", Event.occurred_at).label("day"),
        _func.count().label("count"),
        _func.mode().within_group(Event.event_type).label("top_type"),
    ).filter(
        Event.user_id == user_id,
        Event.occurred_at >= from_date_utc,
        Event.occurred_at < to_date_utc,
    )

    if kind == "notes":
        q = q.filter(Event.event_type.in_(["NOTE_CREATED", "NOTE_REVIEWED"]))
    elif kind == "flashcards":
        q = q.filter(Event.event_type.in_(["FLASHCARD_CREATED", "FLASHCARD_REVIEWED"]))

    rows = q.group_by("day").order_by("day").all()
    return rows


def compute_streaks(db: Session, user_id: uuid.UUID):
    from sqlalchemy import func as _func
    from .database import Event

    rows = (
        db.query(_func.date_trunc("day", Event.occurred_at).label("day"), _func.count())
        .filter(
            Event.user_id == user_id,
            Event.event_type.in_(["NOTE_REVIEWED", "FLASHCARD_REVIEWED"]),
        )
        .group_by("day")
        .order_by("day")
        .all()
    )
    # Compute current and best streak in Python using UTC days
    days = [r[0].date() for r in rows]
    if not days:
        return 0, 0
    days_set = set(days)
    from datetime import timedelta

    today = datetime.utcnow().date()
    # current streak
    cur = 0
    d = today
    while d in days_set:
        cur += 1
        d -= timedelta(days=1)
    # best streak
    best = 0
    start = min(days_set)
    d = start
    run = 0
    while d <= today:
        if d in days_set:
            run += 1
            best = max(best, run)
        else:
            run = 0
        d += timedelta(days=1)
    return cur, best


# Backlinks and tags helpers
def set_note_tags(db: Session, note: Note, tags: list[str]) -> Note:
    note.tags = tags
    note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(note)
    return note


def create_note_link(
    db: Session,
    from_note_id: uuid.UUID,
    to_note_id: uuid.UUID,
    link_type: str = "manual",
) -> NoteLink:
    link = NoteLink(
        from_note_id=from_note_id, to_note_id=to_note_id, link_type=link_type
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def delete_note_link(
    db: Session, from_note_id: uuid.UUID, to_note_id: uuid.UUID
) -> None:
    db.query(NoteLink).filter(
        NoteLink.from_note_id == from_note_id, NoteLink.to_note_id == to_note_id
    ).delete()
    db.commit()


def get_backlinks(db: Session, note_id: uuid.UUID) -> list[Note]:
    # Notes that link to this note
    from_links = db.query(NoteLink).filter(NoteLink.to_note_id == note_id).all()
    from_ids = [link_to_note.from_note_id for link_to_note in from_links]
    if not from_ids:
        return []
    return db.query(Note).filter(Note.id.in_(from_ids)).all()


def replace_manual_links_for_note(
    db: Session,
    user_id: uuid.UUID,
    from_note_id: uuid.UUID,
    to_note_ids: list[uuid.UUID],
) -> None:
    """Replace manual links for a note with provided targets."""
    # delete existing manual links from this note
    db.query(NoteLink).filter(NoteLink.from_note_id == from_note_id).delete()
    # insert new ones
    for tid in to_note_ids:
        if tid == from_note_id:
            continue
        link = NoteLink(from_note_id=from_note_id, to_note_id=tid, link_type="manual")
        db.add(link)
    db.commit()


def get_links_for_user_notes(db: Session, note_ids: list[uuid.UUID]) -> list[NoteLink]:
    if not note_ids:
        return []
    return db.query(NoteLink).filter(NoteLink.from_note_id.in_(note_ids)).all()


def upsert_note_similarity(
    db: Session,
    note_a_id: uuid.UUID,
    note_b_id: uuid.UUID,
    similarity_float: float,
):
    """Store similarity scaled to 0..1000. Order ids to keep uniqueness."""
    from .database import NoteSimilarity

    a, b = (
        (note_a_id, note_b_id)
        if str(note_a_id) < str(note_b_id)
        else (note_b_id, note_a_id)
    )
    scaled = int(max(0.0, min(1.0, similarity_float)) * 1000)
    row = (
        db.query(NoteSimilarity)
        .filter(NoteSimilarity.note_a_id == a, NoteSimilarity.note_b_id == b)
        .first()
    )
    if row:
        row.similarity = scaled
    else:
        row = NoteSimilarity(note_a_id=a, note_b_id=b, similarity=scaled)
        db.add(row)
    db.commit()
    return row


def get_similarities_for_notes(db: Session, note_ids: list[uuid.UUID]):
    from .database import NoteSimilarity

    if not note_ids:
        return []
    return (
        db.query(NoteSimilarity)
        .filter(
            NoteSimilarity.note_a_id.in_(note_ids)
            | NoteSimilarity.note_b_id.in_(note_ids)
        )
        .all()
    )
