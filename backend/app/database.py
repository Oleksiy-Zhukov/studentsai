"""
Database configuration and models for StudentsAI MVP
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Text,
    DateTime,
    Integer,
    ForeignKey,
    or_,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.sql import func

from .config import DATABASE_URL

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
            # Add tags column if missing (PostgreSQL)
            conn.execute(Text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[]"))
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


def create_user(db: Session, email: str, password_hash: str) -> User:
    """Create new user"""
    user = User(email=email, password_hash=password_hash)
    db.add(user)
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

    note.updated_at = datetime.utcnow()
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
