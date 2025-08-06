"""
Database models for the Smart Study Flow feature.
Defines the schema for users, knowledge nodes, connections, and study sessions.
"""

from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class User(Base):
    """User model for authentication and profile management."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    subscription_tier = Column(String(20), default="free")
    study_preferences = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    knowledge_nodes = relationship(
        "KnowledgeNode", back_populates="user", cascade="all, delete-orphan"
    )
    study_sessions = relationship(
        "StudySession", back_populates="user", cascade="all, delete-orphan"
    )
    learning_paths = relationship(
        "LearningPath", back_populates="user", cascade="all, delete-orphan"
    )


class KnowledgeNode(Base):
    """Enhanced knowledge node model representing individual notes/concepts."""

    __tablename__ = "knowledge_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Basic Properties
    title = Column(String(255), nullable=False)
    content = Column(Text)
    summary = Column(Text)  # AI-generated TL;DR

    # Classification & Difficulty
    difficulty_level = Column(
        String(20), default="beginner"
    )  # beginner, intermediate, advanced
    difficulty_score = Column(
        Float, default=1.0
    )  # 1-5 scale based on quiz accuracy, time to understand
    ai_rating = Column(Float, default=0.5)  # AI confidence in content quality (0-1)

    # Organization & Discovery
    tags = Column(ARRAY(String), default=[])
    keywords = Column(ARRAY(String), default=[])  # For AI and search linkage
    source_links = Column(ARRAY(String), default=[])  # External URLs or doc refs

    # Metadata
    created_by = Column(String(20), default="user")  # user/AI
    last_reviewed = Column(DateTime)
    review_count = Column(Integer, default=0)
    mastery_level = Column(Float, default=0.0)  # 0-1 based on study sessions

    # AI & Analytics
    node_metadata = Column(JSON, default={})  # embeddings, semantic data, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="knowledge_nodes")
    source_connections = relationship(
        "KnowledgeConnection",
        foreign_keys="KnowledgeConnection.source_node_id",
        cascade="all, delete-orphan",
    )
    target_connections = relationship(
        "KnowledgeConnection",
        foreign_keys="KnowledgeConnection.target_node_id",
        cascade="all, delete-orphan",
    )
    study_sessions = relationship(
        "StudySession", back_populates="node", cascade="all, delete-orphan"
    )


class KnowledgeConnection(Base):
    """Enhanced connection model representing relationships between knowledge nodes."""

    __tablename__ = "knowledge_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_node_id = Column(
        UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False
    )
    target_node_id = Column(
        UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False
    )

    # Connection Properties
    relationship_type = Column(
        String(50), default="related"
    )  # manual, AI-suggested, prerequisite, related, derives_from, example_of, requires
    weight = Column(
        Float, default=1.0
    )  # Strength of link (0-1, AI confidence, semantic similarity)
    strength = Column(
        Integer, default=1
    )  # Legacy 1-10 scale for backward compatibility

    # Creation & Management
    user_created = Column(Boolean, default=False)  # Whether user explicitly added it
    ai_confidence = Column(Float, default=0.0)  # AI confidence in this connection (0-1)
    connection_tags = Column(ARRAY(String), default=[])  # e.g., logic, math, history

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime)  # When this connection was last traversed
    usage_count = Column(Integer, default=0)  # How many times this connection was used

    # AI & Analytics
    connection_metadata = Column(
        JSON, default={}
    )  # semantic similarity, embeddings, etc.


class StudySession(Base):
    """Enhanced study session model for tracking learning progress."""

    __tablename__ = "study_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    node_id = Column(
        UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False
    )

    # Session Metrics
    session_duration = Column(Integer)  # in minutes
    mastery_level = Column(Integer, default=0)  # 0-100
    accuracy_score = Column(Float, default=0.0)  # Quiz/assessment accuracy
    time_to_complete = Column(Integer)  # Time taken to complete exercises

    # Session Data
    session_data = Column(JSON, default={})  # Detailed session analytics
    completed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="study_sessions")
    node = relationship("KnowledgeNode", back_populates="study_sessions")


class LearningPath(Base):
    """Learning path model for AI-driven study sequences."""

    __tablename__ = "learning_paths"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    steps = Column(JSON, nullable=False)  # Array of step objects
    current_step = Column(Integer, default=0)
    progress = Column(Float, default=0.0)  # 0.0 to 1.0
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="learning_paths")


class AISuggestion(Base):
    """Model for tracking AI-generated suggestions and their user feedback."""

    __tablename__ = "ai_suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Suggestion Details
    suggestion_type = Column(
        String(50), nullable=False
    )  # connection, keyword, summary, quiz, study_plan
    source_node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"))
    target_node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"))

    # Content
    suggestion_content = Column(JSON, nullable=False)  # The actual suggestion data
    ai_confidence = Column(Float, default=0.0)  # AI confidence in this suggestion

    # User Feedback
    user_feedback = Column(String(20))  # accepted, rejected, modified, pending
    feedback_notes = Column(Text)  # User's reason for feedback

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime)

    # Relationships
    user = relationship("User")
    source_node = relationship("KnowledgeNode", foreign_keys=[source_node_id])
    target_node = relationship("KnowledgeNode", foreign_keys=[target_node_id])
