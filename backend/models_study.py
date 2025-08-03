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
    """Knowledge node model representing individual notes/concepts."""

    __tablename__ = "knowledge_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    difficulty_level = Column(String(20), default="beginner")
    tags = Column(ARRAY(String), default=[])
    node_metadata = Column(JSON, default={})
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
    """Connection model representing relationships between knowledge nodes."""

    __tablename__ = "knowledge_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_node_id = Column(
        UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False
    )
    target_node_id = Column(
        UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False
    )
    relationship_type = Column(String(50), default="related")
    strength = Column(Integer, default=1)  # 1-10 scale
    created_at = Column(DateTime, default=datetime.utcnow)


class StudySession(Base):
    """Study session model for tracking learning progress."""

    __tablename__ = "study_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    node_id = Column(
        UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False
    )
    session_duration = Column(Integer)  # in minutes
    mastery_level = Column(Integer, default=0)  # 0-100
    session_data = Column(JSON, default={})
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
