"""
Pydantic schemas for API request/response validation
"""

import uuid
from datetime import datetime, date
from typing import List, Optional, Dict, Any
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
    password: Optional[str] = None  # Made optional for OAuth users
    username: Optional[str] = None

    @validator("password")
    def validate_password(cls, v):
        if v is not None and len(v) < 8:
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


class GoogleOAuthRequest(BaseSchema):
    """Schema for Google OAuth callback"""

    code: str


class UserLogin(BaseSchema):
    email: EmailStr
    password: str


class User(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    verified: bool = False  # NEW: Email verification status
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    verified: bool = False  # NEW: Email verification status
    has_password: bool = True
    plan: str = "free"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GoogleOAuthResponse(BaseSchema):
    """Schema for Google OAuth response"""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


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


# Password reset schemas
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @validator("new_password")
    def validate_new_password_len(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


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
    flashcard_type: str = "single_note"  # "single_note" or "contextual"
    context_notes: Optional[List[uuid.UUID]] = None

    @validator("question", "answer")
    def validate_text(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Question and answer cannot be empty")
        return v.strip()

    @validator("flashcard_type")
    def validate_flashcard_type(cls, v):
        if v not in ["single_note", "contextual"]:
            raise ValueError("Flashcard type must be 'single_note' or 'contextual'")
        return v


class FlashcardCreate(FlashcardBase):
    pass


class Flashcard(FlashcardBase):
    id: uuid.UUID
    difficulty: int
    last_reviewed: Optional[datetime] = None
    next_review: Optional[datetime] = None
    created_at: datetime
    note_id: uuid.UUID
    user_id: uuid.UUID
    tags: Optional[List[str]] = []
    review_count: int = 0
    mastery_level: int = 0
    last_performance: Optional[int] = None
    user_answer_history: Optional[Dict[str, Any]] = None


class FlashcardResponse(BaseSchema):
    id: uuid.UUID
    question: str
    answer: str
    difficulty: int
    last_reviewed: Optional[datetime] = None
    created_at: datetime
    flashcard_type: str
    context_notes: Optional[List[uuid.UUID]] = None
    tags: Optional[List[str]] = []
    review_count: int
    mastery_level: int
    last_performance: Optional[int] = None


class FlashcardReview(BaseSchema):
    flashcard_id: uuid.UUID
    user_answer: str
    performance_score: Optional[int] = None  # 0-100 score


class FlashcardReviewResponse(BaseSchema):
    flashcard_id: uuid.UUID
    performance_score: int
    feedback: str
    mastery_level: int
    next_review_date: Optional[datetime] = None
    tags_updated: List[str] = []


# New schemas for enhanced flashcard system
class FlashcardSRSData(BaseSchema):
    flashcard_id: uuid.UUID
    efactor: float  # E-Factor (2.5, 3.0, etc.)
    interval_days: int
    due_date: date
    repetitions: int
    next_review_date: date


class FlashcardSetInfo(BaseSchema):
    id: uuid.UUID
    mode: str  # 'single' or 'context'
    seed_note_id: uuid.UUID
    neighbor_note_ids: Optional[List[uuid.UUID]] = []
    created_at: datetime
    flashcard_count: int


class FlashcardDetailedReview(BaseSchema):
    flashcard_id: uuid.UUID
    typed_answer: str
    quality_rating: Optional[int] = None  # 0-5 rating for manual override


class FlashcardReviewResult(BaseSchema):
    flashcard_id: uuid.UUID
    ai_score: int  # 0-100 score from LLM
    verdict: str  # 'correct', 'partial', 'incorrect'
    feedback: str
    missing_points: List[str]
    confidence: int  # 0-100 confidence from LLM
    next_review_date: date
    srs_data: FlashcardSRSData
    tags_updated: List[str] = []


class FlashcardGenerationRequest(BaseSchema):
    mode: str  # 'single' or 'context'
    note_id: uuid.UUID
    count: Optional[int] = 5
    neighbors: Optional[int] = 5
    token_cap: Optional[int] = 2500


class FlashcardGenerationResponse(BaseSchema):
    flashcard_set_id: uuid.UUID
    cards: List[FlashcardResponse]
    context_notes: Optional[List[uuid.UUID]] = []
    total_tokens_used: Optional[int] = None


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
    NOTE_UPDATED = "NOTE_UPDATED"
    FLASHCARD_CREATED = "FLASHCARD_CREATED"
    FLASHCARD_REVIEWED = "FLASHCARD_REVIEWED"
    FLASHCARD_UPDATED = "FLASHCARD_UPDATED"
    FLASHCARD_TAGGED = "FLASHCARD_TAGGED"


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


# NEW: Email verification schemas
class EmailVerificationRequest(BaseModel):
    email: str


class EmailVerificationResponse(BaseModel):
    message: str
    email: str


class VerifyEmailToken(BaseModel):
    token: str


class VerificationResponse(BaseModel):
    message: str
    verified: bool
    access_token: Optional[str] = None


class EmailChangeRequest(BaseModel):
    new_email: str
