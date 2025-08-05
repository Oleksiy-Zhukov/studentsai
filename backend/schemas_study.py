"""
Pydantic schemas for the Smart Study Flow feature.
Defines request and response models for API validation.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    subscription_tier: str
    study_preferences: Dict[str, Any]
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Knowledge Node schemas
class KnowledgeNodeBase(BaseModel):
    title: str
    content: Optional[str] = None
    difficulty_level: str = "beginner"
    tags: List[str] = []

class KnowledgeNodeCreate(KnowledgeNodeBase):
    pass

class KnowledgeNodeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    difficulty_level: Optional[str] = None
    tags: Optional[List[str]] = None

class KnowledgeNodeResponse(KnowledgeNodeBase):
    id: UUID
    user_id: UUID
    node_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Connection schemas
class KnowledgeConnectionBase(BaseModel):
    source_node_id: UUID
    target_node_id: UUID
    relationship_type: str = "related"
    strength: int = 1

class KnowledgeConnectionCreate(KnowledgeConnectionBase):
    pass

class KnowledgeConnectionResponse(KnowledgeConnectionBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# Study Session schemas
class StudySessionBase(BaseModel):
    node_id: UUID
    session_duration: Optional[int] = None
    mastery_level: int = 0
    session_data: Dict[str, Any] = {}

class StudySessionCreate(StudySessionBase):
    pass

class StudySessionResponse(StudySessionBase):
    id: UUID
    user_id: UUID
    completed_at: datetime
    
    class Config:
        from_attributes = True

# Learning Path schemas
class LearningPathStep(BaseModel):
    id: str
    node_id: UUID
    title: str
    estimated_time: int  # in minutes
    prerequisites: List[str] = []
    difficulty: str = "beginner"

class LearningPathBase(BaseModel):
    title: str
    description: Optional[str] = None
    steps: List[LearningPathStep]

class LearningPathCreate(LearningPathBase):
    pass

class LearningPathUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[LearningPathStep]] = None
    current_step: Optional[int] = None
    progress: Optional[float] = None
    is_active: Optional[bool] = None

class LearningPathResponse(LearningPathBase):
    id: UUID
    user_id: UUID
    current_step: int
    progress: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Graph schemas
class GraphNode(BaseModel):
    id: str
    title: str
    difficulty: str
    difficulty_score: Optional[float] = None
    ai_rating: Optional[float] = None
    tags: List[str] = []
    keywords: List[str] = []
    mastery_level: Optional[float] = None
    review_count: Optional[int] = None
    created_at: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None

class GraphLink(BaseModel):
    source: str
    target: str
    type: str = "related"
    weight: float = 0.5
    ai_confidence: Optional[float] = None
    connection_tags: List[str] = []
    metadata: Dict[str, Any] = {}

class GraphData(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]

# Progress schemas
class ProgressStats(BaseModel):
    total_notes: int
    total_study_time: int  # in minutes
    average_mastery: float
    study_streak: int

class StudyRecommendation(BaseModel):
    type: str  # "review", "continue", "new"
    node_id: Optional[UUID] = None
    title: str
    description: str
    priority: str  # "high", "medium", "low" 