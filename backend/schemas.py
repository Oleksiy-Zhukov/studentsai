"""
Pydantic schemas for StudentsAI API.
Defines request and response models for all endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID


# Base schemas
class BaseResponse(BaseModel):
    """Base response model."""

    success: bool = True
    message: Optional[str] = None


# User schemas
class UserBase(BaseModel):
    email: str
    username: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    subscription_tier: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Convert UUID to string
        if hasattr(obj, "id"):
            obj.id = str(obj.id)
        return super().from_orm(obj)


# Knowledge Node schemas
class KnowledgeNodeBase(BaseModel):
    title: str
    content: Optional[str] = None
    tags: Optional[List[str]] = []
    difficulty_level: Optional[str] = "beginner"


class KnowledgeNodeCreate(KnowledgeNodeBase):
    pass


class KnowledgeNodeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    difficulty_level: Optional[str] = None
    summary: Optional[str] = None


class KnowledgeNodeResponse(KnowledgeNodeBase):
    id: str
    user_id: str
    summary: Optional[str] = None
    difficulty_score: float = 1.0
    ai_rating: float = 0.5
    keywords: List[str] = []
    source_links: List[str] = []
    created_by: str = "user"
    last_reviewed: Optional[datetime] = None
    review_count: int = 0
    mastery_level: float = 0.0
    node_metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Convert UUIDs to strings
        if hasattr(obj, "id"):
            obj.id = str(obj.id)
        if hasattr(obj, "user_id"):
            obj.user_id = str(obj.user_id)
        return super().from_orm(obj)


# Connection schemas
class KnowledgeConnectionBase(BaseModel):
    source_node_id: str
    target_node_id: str
    relationship_type: str = "related"
    weight: float = 1.0
    strength: int = 1


class KnowledgeConnectionCreate(KnowledgeConnectionBase):
    pass


class KnowledgeConnectionResponse(KnowledgeConnectionBase):
    id: str
    user_created: bool = False
    ai_confidence: float = 0.0
    connection_tags: List[str] = []
    created_at: datetime
    last_used: Optional[datetime] = None
    usage_count: int = 0
    connection_metadata: Dict[str, Any] = {}

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Convert UUIDs to strings
        if hasattr(obj, "id"):
            obj.id = str(obj.id)
        if hasattr(obj, "source_node_id"):
            obj.source_node_id = str(obj.source_node_id)
        if hasattr(obj, "target_node_id"):
            obj.target_node_id = str(obj.target_node_id)
        return super().from_orm(obj)


# Study Session schemas
class StudySessionBase(BaseModel):
    node_id: str
    session_duration: Optional[int] = None
    mastery_level: int = 0
    accuracy_score: float = 0.0
    time_to_complete: Optional[int] = None


class StudySessionCreate(StudySessionBase):
    pass


class StudySessionResponse(StudySessionBase):
    id: str
    user_id: str
    session_data: Dict[str, Any] = {}
    completed_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Convert UUIDs to strings
        if hasattr(obj, "id"):
            obj.id = str(obj.id)
        if hasattr(obj, "user_id"):
            obj.user_id = str(obj.user_id)
        if hasattr(obj, "node_id"):
            obj.node_id = str(obj.node_id)
        return super().from_orm(obj)


# Learning Path schemas
class LearningPathBase(BaseModel):
    title: str
    description: Optional[str] = None
    steps: List[Dict[str, Any]]


class LearningPathCreate(LearningPathBase):
    pass


class LearningPathUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[Dict[str, Any]]] = None
    current_step: Optional[int] = None
    progress: Optional[float] = None
    is_active: Optional[bool] = None


class LearningPathResponse(LearningPathBase):
    id: str
    user_id: str
    current_step: int = 0
    progress: float = 0.0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Convert UUIDs to strings
        if hasattr(obj, "id"):
            obj.id = str(obj.id)
        if hasattr(obj, "user_id"):
            obj.user_id = str(obj.user_id)
        return super().from_orm(obj)


# Graph schemas
class GraphNode(BaseModel):
    id: str
    title: str
    content: Optional[str] = None
    difficulty_level: Optional[str] = "beginner"
    difficulty_score: float
    ai_rating: float
    tags: List[str]
    keywords: List[str]
    mastery_level: float
    review_count: int
    created_at: datetime


class GraphConnection(BaseModel):
    id: str
    source: str
    target: str
    relationship_type: str
    weight: float
    strength: int
    ai_confidence: float
    connection_tags: List[str]


class GraphData(BaseModel):
    nodes: List[GraphNode]
    connections: List[GraphConnection]
    total_nodes: int
    total_connections: int


# Progress schemas
class ProgressStats(BaseModel):
    total_notes: int
    total_sessions: int
    total_study_time: int  # in minutes
    average_mastery: float
    study_streak: int
    last_study_date: Optional[datetime] = None
    weekly_progress: Dict[str, int] = {}  # date -> minutes studied


# Recommendation schemas
class StudyRecommendation(BaseModel):
    node_id: str
    title: str
    reason: str
    priority: float  # 0-1, higher is more important
    estimated_time: int  # in minutes
    difficulty_level: str


# AI Response schemas
class AISuggestion(BaseModel):
    type: str  # summary, quiz, study_plan, connections
    content: Dict[str, Any]
    confidence: float = 0.0
    metadata: Optional[Dict[str, Any]] = None


class AIAnalysis(BaseModel):
    difficulty_level: str
    complexity_score: float
    ai_rating: float
    keywords: List[str]
    suggested_tags: List[str]
    potential_connections: List[Dict[str, Any]]
    summary: Optional[str] = None
    quiz_questions: Optional[List[Dict[str, Any]]] = None
    study_plan: Optional[str] = None


# Error schemas
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
