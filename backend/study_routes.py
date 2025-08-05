"""
Main API routes for the Smart Study Flow feature.
Handles knowledge nodes, connections, study sessions, and learning paths.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID

from database_study import get_db
from models_study import (
    User,
    KnowledgeNode,
    KnowledgeConnection,
    StudySession,
    LearningPath,
)
from auth_study import get_current_user, create_access_token
from ai_note_service import AINoteService
from schemas_study import (
    KnowledgeNodeCreate,
    KnowledgeNodeUpdate,
    KnowledgeNodeResponse,
    KnowledgeConnectionCreate,
    KnowledgeConnectionResponse,
    StudySessionCreate,
    StudySessionResponse,
    LearningPathCreate,
    LearningPathUpdate,
    LearningPathResponse,
    GraphData,
    ProgressStats,
    StudyRecommendation,
)

router = APIRouter(prefix="/study", tags=["Study Flow"])

# Initialize AI services
ai_note_service = AINoteService()


# Token refresh endpoint
@router.post("/refresh-token")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh the JWT token."""
    access_token = create_access_token(data={"sub": str(current_user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


# Knowledge Nodes
@router.post("/notes", response_model=KnowledgeNodeResponse)
async def create_note(
    note_data: KnowledgeNodeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new knowledge node with AI processing."""
    # Process note content with AI
    ai_analysis = ai_note_service.process_note_content(
        note_data.content or "", note_data.title
    )

    # Create note with AI-enhanced data
    note = KnowledgeNode(
        user_id=current_user.id,
        title=note_data.title,
        content=note_data.content,
        difficulty_level=ai_analysis["difficulty_level"],
        difficulty_score=ai_analysis["complexity_score"],
        ai_rating=ai_analysis["ai_rating"],
        tags=note_data.tags or ai_analysis["suggested_tags"],
        keywords=ai_analysis["keywords"],
        node_metadata={
            "ai_analysis": ai_analysis,
            "potential_connections": ai_analysis["potential_connections"],
        },
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    # Generate connection suggestions
    all_notes = (
        db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id).all()
    )
    connection_suggestions = ai_note_service.suggest_connections(note, all_notes, db)

    # Store suggestions in metadata for frontend
    note.node_metadata["connection_suggestions"] = connection_suggestions
    db.commit()

    return KnowledgeNodeResponse.from_orm(note)


@router.post("/notes/{note_id}/suggestions")
async def get_note_suggestions(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get AI suggestions for a note (connections, keywords, etc.)."""
    note = (
        db.query(KnowledgeNode)
        .filter(KnowledgeNode.id == note_id, KnowledgeNode.user_id == current_user.id)
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # Get all notes for connection suggestions
    all_notes = (
        db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id).all()
    )
    connection_suggestions = ai_note_service.suggest_connections(note, all_notes, db)

    # Generate quiz questions
    quiz_questions = ai_note_service.generate_quiz_questions(note)

    # Generate summary
    summary = ai_note_service.generate_summary(note)

    return {
        "connection_suggestions": connection_suggestions,
        "quiz_questions": quiz_questions,
        "summary": summary,
        "ai_analysis": note.node_metadata.get("ai_analysis", {}),
    }


@router.post("/notes/{note_id}/connections")
async def create_ai_connections(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create AI-suggested connections for a note."""
    note = (
        db.query(KnowledgeNode)
        .filter(KnowledgeNode.id == note_id, KnowledgeNode.user_id == current_user.id)
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # Get all notes and generate connections
    all_notes = (
        db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id).all()
    )
    suggestions = ai_note_service.suggest_connections(note, all_notes, db)

    created_connections = []
    for suggestion in suggestions[:5]:  # Create top 5 connections
        # Check if connection already exists
        existing = (
            db.query(KnowledgeConnection)
            .filter(
                KnowledgeConnection.source_node_id == suggestion["source_node_id"],
                KnowledgeConnection.target_node_id == suggestion["target_node_id"],
            )
            .first()
        )

        if not existing:
            connection = KnowledgeConnection(
                source_node_id=suggestion["source_node_id"],
                target_node_id=suggestion["target_node_id"],
                relationship_type=suggestion["relationship_type"],
                weight=suggestion["weight"],
                ai_confidence=suggestion["ai_confidence"],
                connection_tags=suggestion["connection_tags"],
                connection_metadata={
                    "reason": suggestion["reason"],
                    "ai_generated": True,
                },
            )
            db.add(connection)
            created_connections.append(connection)

    db.commit()

    return {
        "message": f"Created {len(created_connections)} AI connections",
        "connections": [
            KnowledgeConnectionResponse.from_orm(conn) for conn in created_connections
        ],
    }


@router.get("/notes", response_model=List[KnowledgeNodeResponse])
async def get_notes(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get all notes for the current user."""
    notes = (
        db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id).all()
    )
    return [KnowledgeNodeResponse.from_orm(note) for note in notes]


@router.get("/notes/{note_id}", response_model=KnowledgeNodeResponse)
async def get_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific note by ID."""
    note = (
        db.query(KnowledgeNode)
        .filter(KnowledgeNode.id == note_id, KnowledgeNode.user_id == current_user.id)
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    return KnowledgeNodeResponse.from_orm(note)


@router.put("/notes/{note_id}", response_model=KnowledgeNodeResponse)
async def update_note(
    note_id: UUID,
    note_data: KnowledgeNodeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a note."""
    note = (
        db.query(KnowledgeNode)
        .filter(KnowledgeNode.id == note_id, KnowledgeNode.user_id == current_user.id)
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # Update fields
    if note_data.title is not None:
        note.title = note_data.title
    if note_data.content is not None:
        note.content = note_data.content
    if note_data.difficulty_level is not None:
        note.difficulty_level = note_data.difficulty_level
    if note_data.tags is not None:
        note.tags = note_data.tags

    db.commit()
    db.refresh(note)

    return KnowledgeNodeResponse.from_orm(note)


@router.delete("/notes/{note_id}")
async def delete_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a note."""
    note = (
        db.query(KnowledgeNode)
        .filter(KnowledgeNode.id == note_id, KnowledgeNode.user_id == current_user.id)
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()

    return {"message": "Note deleted successfully"}


# Knowledge Graph
@router.get("/graph", response_model=GraphData)
async def get_knowledge_graph(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get the knowledge graph for the current user."""
    # Get all nodes
    nodes = (
        db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id).all()
    )

    # Get all connections
    connections = (
        db.query(KnowledgeConnection)
        .join(KnowledgeNode, KnowledgeConnection.source_node_id == KnowledgeNode.id)
        .filter(KnowledgeNode.user_id == current_user.id)
        .all()
    )

    # Convert to graph format with enhanced data
    graph_nodes = [
        {
            "id": str(node.id),
            "title": node.title,
            "difficulty": node.difficulty_level,
            "difficulty_score": node.difficulty_score,
            "ai_rating": node.ai_rating,
            "tags": node.tags or [],
            "keywords": node.keywords or [],
            "mastery_level": node.mastery_level,
            "review_count": node.review_count,
            "created_at": node.created_at.isoformat() if node.created_at else None,
        }
        for node in nodes
    ]

    graph_links = [
        {
            "source": str(conn.source_node_id),
            "target": str(conn.target_node_id),
            "type": conn.relationship_type,
            "weight": conn.weight,
            "ai_confidence": conn.ai_confidence,
            "connection_tags": conn.connection_tags or [],
            "metadata": conn.connection_metadata or {},
        }
        for conn in connections
    ]

    return GraphData(nodes=graph_nodes, links=graph_links)


@router.post("/connections", response_model=KnowledgeConnectionResponse)
async def create_connection(
    connection_data: KnowledgeConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a connection between two nodes."""
    # Verify both nodes belong to the user
    source_node = (
        db.query(KnowledgeNode)
        .filter(
            KnowledgeNode.id == connection_data.source_node_id,
            KnowledgeNode.user_id == current_user.id,
        )
        .first()
    )

    target_node = (
        db.query(KnowledgeNode)
        .filter(
            KnowledgeNode.id == connection_data.target_node_id,
            KnowledgeNode.user_id == current_user.id,
        )
        .first()
    )

    if not source_node or not target_node:
        raise HTTPException(status_code=404, detail="One or both nodes not found")

    connection = KnowledgeConnection(
        source_node_id=connection_data.source_node_id,
        target_node_id=connection_data.target_node_id,
        relationship_type=connection_data.relationship_type,
        strength=connection_data.strength,
    )

    db.add(connection)
    db.commit()
    db.refresh(connection)

    return KnowledgeConnectionResponse.from_orm(connection)


# Study Sessions
@router.post("/sessions", response_model=StudySessionResponse)
async def create_study_session(
    session_data: StudySessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new study session."""
    # Verify the node belongs to the user
    node = (
        db.query(KnowledgeNode)
        .filter(
            KnowledgeNode.id == session_data.node_id,
            KnowledgeNode.user_id == current_user.id,
        )
        .first()
    )

    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    session = StudySession(
        user_id=current_user.id,
        node_id=session_data.node_id,
        session_duration=session_data.session_duration,
        mastery_level=session_data.mastery_level,
        session_data=session_data.session_data,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return StudySessionResponse.from_orm(session)


@router.get("/sessions", response_model=List[StudySessionResponse])
async def get_study_sessions(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get all study sessions for the current user."""
    sessions = (
        db.query(StudySession).filter(StudySession.user_id == current_user.id).all()
    )
    return [StudySessionResponse.from_orm(session) for session in sessions]


# Progress and Analytics
@router.get("/progress", response_model=ProgressStats)
async def get_progress_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get progress statistics for the current user."""
    # Count total notes
    total_notes = (
        db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id).count()
    )

    # Calculate total study time
    total_study_time = (
        db.query(StudySession)
        .filter(
            StudySession.user_id == current_user.id,
            StudySession.session_duration.isnot(None),
        )
        .with_entities(func.sum(StudySession.session_duration))
        .scalar()
        or 0
    )

    # Calculate average mastery
    avg_mastery = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id)
        .with_entities(func.avg(StudySession.mastery_level))
        .scalar()
        or 0
    )

    # TODO: Calculate study streak (simplified for now)
    study_streak = 0

    return ProgressStats(
        total_notes=total_notes,
        total_study_time=total_study_time,
        average_mastery=float(avg_mastery),
        study_streak=study_streak,
    )


@router.get("/recommendations", response_model=List[StudyRecommendation])
async def get_study_recommendations(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get AI-powered study recommendations."""
    # TODO: Implement AI-powered recommendations
    # For now, return basic recommendations based on recent activity

    recommendations = [
        StudyRecommendation(
            type="review",
            title="Review Recent Notes",
            description="Review notes from the last 7 days",
            priority="medium",
        ),
        StudyRecommendation(
            type="continue",
            title="Continue Learning Path",
            description="Continue your active learning path",
            priority="high",
        ),
    ]

    return recommendations
