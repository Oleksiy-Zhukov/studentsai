"""
Pydantic schemas for API request/response validation
"""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator


# Base schemas
class BaseSchema(BaseModel):
    """Base schema with common configuration"""

    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseSchema):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    username: Optional[str] = None

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @validator("username")
    def validate_username(cls, v):
        if v is not None:
            if len(v.strip()) < 3:
                raise ValueError("Username must be at least 3 characters long")
            if len(v.strip()) > 50:
                raise ValueError("Username cannot exceed 50 characters")
            if not v.strip().replace("_", "").replace("-", "").isalnum():
                raise ValueError(
                    "Username can only contain letters, numbers, underscores, and hyphens"
                )
            return v.strip()
        return v


class UserLogin(BaseSchema):
    email: EmailStr
    password: str


class User(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class UserResponse(BaseSchema):
    id: uuid.UUID
    email: str
    username: str
    created_at: datetime


class UserProfileUpdate(BaseSchema):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

    @validator("username")
    def validate_username(cls, v):
        if v is not None:
            if len(v.strip()) < 3:
                raise ValueError("Username must be at least 3 characters long")
            if len(v.strip()) > 50:
                raise ValueError("Username cannot exceed 50 characters")
            if not v.strip().replace("_", "").replace("-", "").isalnum():
                raise ValueError(
                    "Username can only contain letters, numbers, underscores, and hyphens"
                )
            return v.strip()
        return v

    @validator("new_password")
    def validate_new_password(cls, v):
        if v is not None:
            if len(v) < 8:
                raise ValueError("Password must be at least 8 characters long")
        return v


class UsernameCheck(BaseSchema):
    username: str
    available: bool


class SettingsAppearance(BaseSchema):
    theme: str = "dark"  # "light", "dark", "system"
    font_size: str = "medium"  # "small", "medium", "large"
    layout_density: str = "comfortable"  # "compact", "dense", "comfortable"


class SettingsGraph(BaseSchema):
    edge_thickness_scale: float = 1.0
    node_spacing: float = 1.0
    show_backlinks: bool = True
    physics_enabled: bool = True
    clustering_strength: float = 0.5


class SettingsAI(BaseSchema):
    use_openai: bool = True
    daily_request_limit: int = 100
    enable_caching: bool = True


class SettingsStudyFlow(BaseSchema):
    quiz_enabled: bool = True
    flashcard_auto_review: bool = True
    linked_notes_suggestions: bool = True


class SettingsAdvanced(BaseSchema):
    data_export_enabled: bool = True
    analytics_enabled: bool = True


class UserSettings(BaseSchema):
    appearance: SettingsAppearance
    graph: SettingsGraph
    ai: SettingsAI
    study_flow: SettingsStudyFlow
    advanced: SettingsAdvanced


# Authentication schemas
class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseSchema):
    email: Optional[str] = None


# Note schemas
class NoteBase(BaseSchema):
    title: str
    content: str

    @validator("title")
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Title cannot be empty")
        if len(v) > 500:
            raise ValueError("Title cannot exceed 500 characters")
        return v.strip()

    @validator("content")
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Content cannot be empty")
        return v.strip()


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseSchema):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None

    @validator("title")
    def validate_title(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError("Title cannot be empty")
            if len(v) > 500:
                raise ValueError("Title cannot exceed 500 characters")
            return v.strip()
        return v

    @validator("content")
    def validate_content(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError("Content cannot be empty")
            return v.strip()
        return v


class Note(NoteBase):
    id: uuid.UUID
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user_id: uuid.UUID


class NoteResponse(BaseSchema):
    id: uuid.UUID
    title: str
    content: str
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    tags: Optional[List[str]] = []


class NoteListResponse(BaseSchema):
    notes: List[NoteResponse]
    total: int
    page: int
    per_page: int


# Flashcard schemas
class FlashcardBase(BaseSchema):
    question: str
    answer: str

    @validator("question", "answer")
    def validate_text(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Question and answer cannot be empty")
        return v.strip()


class FlashcardCreate(FlashcardBase):
    pass


class Flashcard(FlashcardBase):
    id: uuid.UUID
    difficulty: int
    last_reviewed: Optional[datetime] = None
    next_review: Optional[datetime] = None
    created_at: datetime
    note_id: uuid.UUID


class FlashcardResponse(BaseSchema):
    id: uuid.UUID
    question: str
    answer: str
    difficulty: int
    last_reviewed: Optional[datetime] = None
    created_at: datetime


# AI service schemas
class SummarizeRequest(BaseSchema):
    content: str

    @validator("content")
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Content cannot be empty")
        if len(v) > 50000:  # Reasonable limit for AI processing
            raise ValueError("Content too long for processing")
        return v.strip()


class SummarizeResponse(BaseSchema):
    summary: str
    word_count: int
    original_length: int


class GenerateFlashcardsRequest(BaseSchema):
    content: str
    count: Optional[int] = 5

    @validator("content")
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Content cannot be empty")
        return v.strip()

    @validator("count")
    def validate_count(cls, v):
        if v < 1 or v > 20:
            raise ValueError("Count must be between 1 and 20")
        return v


class GeneratedFlashcard(BaseSchema):
    question: str
    answer: str


class GenerateFlashcardsResponse(BaseSchema):
    flashcards: List[GeneratedFlashcard]
    count: int


# Graph schemas
class NoteConnection(BaseSchema):
    source_id: uuid.UUID
    target_id: uuid.UUID
    similarity: float
    connection_type: str = "similarity"


class GraphNode(BaseSchema):
    id: uuid.UUID
    title: str
    content_preview: str
    created_at: datetime
    word_count: int


class GraphResponse(BaseSchema):
    nodes: List[GraphNode]
    connections: List[NoteConnection]
    total_nodes: int


# Backlink schemas
class BacklinkResponse(BaseSchema):
    note_id: uuid.UUID
    title: str
    excerpt: Optional[str] = None
    created_at: datetime


class KeywordsSuggestResponse(BaseSchema):
    note_id: uuid.UUID
    keywords: List[str]


class UpdateTagsRequest(BaseSchema):
    tags: List[str]


# Error schemas
class ErrorResponse(BaseSchema):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


# Success schemas
class SuccessResponse(BaseSchema):
    message: str
    data: Optional[dict] = None


# Events / Profile schemas
class EventType(str):
    NOTE_CREATED = "NOTE_CREATED"
    NOTE_REVIEWED = "NOTE_REVIEWED"
    FLASHCARD_CREATED = "FLASHCARD_CREATED"
    FLASHCARD_REVIEWED = "FLASHCARD_REVIEWED"


class EventItem(BaseSchema):
    id: uuid.UUID
    event_type: str
    occurred_at: datetime
    target_id: Optional[uuid.UUID] = None
    metadata: Optional[dict] = None


class ProfileSummaryResponse(BaseSchema):
    notes_created: int
    notes_reviewed: int
    flashcards_created: int
    flashcards_reviewed: int
    current_streak: int
    best_streak: int
    activity_7d: int
    activity_30d: int


class ActivityDayCount(BaseSchema):
    date: str  # YYYY-MM-DD (UTC)
    count: int
    top_type: Optional[str] = None


class ActivityResponse(BaseSchema):
    from_date: str
    to_date: str
    kind: str
    days: List[ActivityDayCount]


class EventIngestRequest(BaseSchema):
    event_type: str
    target_id: Optional[uuid.UUID] = None
    occurred_at: Optional[datetime] = None
    metadata: Optional[dict] = None
