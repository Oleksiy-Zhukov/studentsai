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
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
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
    created_at: datetime


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
    
    @validator('title')
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Title cannot be empty')
        if len(v) > 500:
            raise ValueError('Title cannot exceed 500 characters')
        return v.strip()
    
    @validator('content')
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Content cannot be empty')
        return v.strip()


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseSchema):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    
    @validator('title')
    def validate_title(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError('Title cannot be empty')
            if len(v) > 500:
                raise ValueError('Title cannot exceed 500 characters')
            return v.strip()
        return v
    
    @validator('content')
    def validate_content(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError('Content cannot be empty')
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


class NoteListResponse(BaseSchema):
    notes: List[NoteResponse]
    total: int
    page: int
    per_page: int


# Flashcard schemas
class FlashcardBase(BaseSchema):
    question: str
    answer: str
    
    @validator('question', 'answer')
    def validate_text(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Question and answer cannot be empty')
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
    
    @validator('content')
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Content cannot be empty')
        if len(v) > 50000:  # Reasonable limit for AI processing
            raise ValueError('Content too long for processing')
        return v.strip()


class SummarizeResponse(BaseSchema):
    summary: str
    word_count: int
    original_length: int


class GenerateFlashcardsRequest(BaseSchema):
    content: str
    count: Optional[int] = 5
    
    @validator('content')
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Content cannot be empty')
        return v.strip()
    
    @validator('count')
    def validate_count(cls, v):
        if v < 1 or v > 20:
            raise ValueError('Count must be between 1 and 20')
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


# Error schemas
class ErrorResponse(BaseSchema):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


# Success schemas
class SuccessResponse(BaseSchema):
    message: str
    data: Optional[dict] = None

