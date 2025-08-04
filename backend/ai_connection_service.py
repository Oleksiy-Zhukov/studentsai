"""
AI-powered connection service for intelligent knowledge graph relationships.
Implements semantic analysis, user behavior tracking, and hybrid connection logic.
"""

import re
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
from models_study import KnowledgeNode, KnowledgeConnection, StudySession, AISuggestion
import numpy as np
from datetime import datetime, timedelta


class AIConnectionService:
    """Service for intelligent knowledge graph connections."""
    
    def __init__(self):
        self.connection_types = {
            'prerequisite': 'requires understanding of',
            'related': 'conceptually related to',
            'derives_from': 'builds upon',
            'example_of': 'is an example of',
            'contrasts_with': 'differs from',
            'enhances': 'improves understanding of',
            'applies_to': 'can be applied to'
        }
    
    def analyze_node_content(self, node: KnowledgeNode) -> Dict:
        """Analyze node content to extract semantic information."""
        content = node.content or ""
        title = node.title or ""
        
        # Extract keywords from content
        keywords = self._extract_keywords(content + " " + title)
        
        # Calculate content complexity
        complexity_score = self._calculate_complexity(content)
        
        # Extract potential connections
        potential_connections = self._extract_potential_connections(content)
        
        return {
            'keywords': keywords,
            'complexity_score': complexity_score,
            'potential_connections': potential_connections,
            'content_length': len(content),
            'has_formulas': bool(re.search(r'[=+\-*/^()]', content)),
            'has_code': bool(re.search(r'(def|class|function|import|var|let|const)', content, re.I))
        }
    
    def find_semantic_connections(self, source_node: KnowledgeNode, all_nodes: List[KnowledgeNode]) -> List[Dict]:
        """Find semantic connections between nodes using multiple strategies."""
        connections = []
        
        for target_node in all_nodes:
            if source_node.id == target_node.id:
                continue
                
            # Strategy 1: Keyword overlap
            keyword_similarity = self._calculate_keyword_similarity(source_node, target_node)
            
            # Strategy 2: Content similarity
            content_similarity = self._calculate_content_similarity(source_node, target_node)
            
            # Strategy 3: Tag overlap
            tag_similarity = self._calculate_tag_similarity(source_node, target_node)
            
            # Strategy 4: Difficulty relationship
            difficulty_relationship = self._analyze_difficulty_relationship(source_node, target_node)
            
            # Strategy 5: Temporal relationship (creation order)
            temporal_relationship = self._analyze_temporal_relationship(source_node, target_node)
            
            # Calculate overall similarity score
            overall_score = self._calculate_overall_similarity(
                keyword_similarity, content_similarity, tag_similarity, 
                difficulty_relationship, temporal_relationship
            )
            
            if overall_score > 0.3:  # Threshold for meaningful connection
                connection_type = self._determine_connection_type(
                    source_node, target_node, overall_score, difficulty_relationship
                )
                
                connections.append({
                    'source_node_id': source_node.id,
                    'target_node_id': target_node.id,
                    'relationship_type': connection_type,
                    'weight': overall_score,
                    'ai_confidence': overall_score,
                    'connection_tags': self._generate_connection_tags(source_node, target_node),
                    'metadata': {
                        'keyword_similarity': keyword_similarity,
                        'content_similarity': content_similarity,
                        'tag_similarity': tag_similarity,
                        'difficulty_relationship': difficulty_relationship,
                        'temporal_relationship': temporal_relationship
                    }
                })
        
        return connections
    
    def analyze_user_behavior_connections(self, user_id: str, db: Session) -> List[Dict]:
        """Analyze user study behavior to suggest connections."""
        # Get user's study sessions
        study_sessions = db.query(StudySession).filter(
            StudySession.user_id == user_id
        ).order_by(StudySession.completed_at.desc()).all()
        
        connections = []
        
        # Find nodes studied in sequence
        for i in range(len(study_sessions) - 1):
            session1 = study_sessions[i]
            session2 = study_sessions[i + 1]
            
            # If sessions are close in time, suggest connection
            time_diff = abs((session1.completed_at - session2.completed_at).total_seconds() / 3600)
            
            if time_diff < 24:  # Within 24 hours
                # Check if connection already exists
                existing = db.query(KnowledgeConnection).filter(
                    KnowledgeConnection.source_node_id == session1.node_id,
                    KnowledgeConnection.target_node_id == session2.node_id
                ).first()
                
                if not existing:
                    connections.append({
                        'source_node_id': session1.node_id,
                        'target_node_id': session2.node_id,
                        'relationship_type': 'study_sequence',
                        'weight': 0.7,
                        'ai_confidence': 0.6,
                        'connection_tags': ['user_behavior', 'study_pattern'],
                        'metadata': {
                            'time_gap_hours': time_diff,
                            'session1_mastery': session1.mastery_level,
                            'session2_mastery': session2.mastery_level
                        }
                    })
        
        return connections
    
    def suggest_learning_path(self, user_id: str, target_node_id: str, db: Session) -> List[str]:
        """Suggest optimal learning path to a target node."""
        # Get all nodes
        all_nodes = db.query(KnowledgeNode).filter(KnowledgeNode.user_id == user_id).all()
        
        # Create adjacency matrix
        adjacency_matrix = self._create_adjacency_matrix(all_nodes, db)
        
        # Find shortest path using Dijkstra's algorithm
        path = self._find_shortest_path(adjacency_matrix, all_nodes, target_node_id)
        
        return path
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text."""
        # Remove common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'}
        
        # Extract words
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        
        # Filter and count
        word_counts = {}
        for word in words:
            if word not in stop_words and len(word) > 2:
                word_counts[word] = word_counts.get(word, 0) + 1
        
        # Return top keywords
        sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        return [word for word, count in sorted_words[:10]]
    
    def _calculate_complexity(self, text: str) -> float:
        """Calculate text complexity score."""
        if not text:
            return 0.0
        
        # Factors: sentence length, word length, technical terms, formulas
        sentences = re.split(r'[.!?]+', text)
        words = re.findall(r'\b[a-zA-Z]+\b', text)
        
        avg_sentence_length = len(words) / max(len(sentences), 1)
        avg_word_length = sum(len(word) for word in words) / max(len(words), 1)
        
        # Technical indicators
        has_formulas = bool(re.search(r'[=+\-*/^()]', text))
        has_code = bool(re.search(r'(def|class|function|import|var|let|const)', text, re.I))
        has_numbers = bool(re.search(r'\d+', text))
        
        complexity = (
            (avg_sentence_length / 20) * 0.3 +
            (avg_word_length / 8) * 0.2 +
            (has_formulas * 0.2) +
            (has_code * 0.2) +
            (has_numbers * 0.1)
        )
        
        return min(complexity, 1.0)
    
    def _extract_potential_connections(self, text: str) -> List[str]:
        """Extract potential connection phrases from text."""
        connection_phrases = [
            r'related to\s+(\w+)',
            r'similar to\s+(\w+)',
            r'different from\s+(\w+)',
            r'builds on\s+(\w+)',
            r'requires\s+(\w+)',
            r'example of\s+(\w+)',
            r'applies to\s+(\w+)'
        ]
        
        connections = []
        for phrase in connection_phrases:
            matches = re.findall(phrase, text, re.I)
            connections.extend(matches)
        
        return connections
    
    def _calculate_keyword_similarity(self, node1: KnowledgeNode, node2: KnowledgeNode) -> float:
        """Calculate similarity based on keyword overlap."""
        keywords1 = set(node1.keywords or [])
        keywords2 = set(node2.keywords or [])
        
        if not keywords1 or not keywords2:
            return 0.0
        
        intersection = keywords1.intersection(keywords2)
        union = keywords1.union(keywords2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _calculate_content_similarity(self, node1: KnowledgeNode, node2: KnowledgeNode) -> float:
        """Calculate similarity based on content overlap."""
        content1 = (node1.content or "").lower()
        content2 = (node2.content or "").lower()
        
        if not content1 or not content2:
            return 0.0
        
        # Simple word overlap
        words1 = set(re.findall(r'\b[a-zA-Z]+\b', content1))
        words2 = set(re.findall(r'\b[a-zA-Z]+\b', content2))
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _calculate_tag_similarity(self, node1: KnowledgeNode, node2: KnowledgeNode) -> float:
        """Calculate similarity based on tag overlap."""
        tags1 = set(node1.tags or [])
        tags2 = set(node2.tags or [])
        
        if not tags1 or not tags2:
            return 0.0
        
        intersection = tags1.intersection(tags2)
        union = tags1.union(tags2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _analyze_difficulty_relationship(self, node1: KnowledgeNode, node2: KnowledgeNode) -> float:
        """Analyze relationship based on difficulty levels."""
        difficulty_map = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
        
        diff1 = difficulty_map.get(node1.difficulty_level, 1)
        diff2 = difficulty_map.get(node2.difficulty_level, 1)
        
        # Prerequisite relationship (easier -> harder)
        if diff1 < diff2:
            return 0.8
        # Related at same level
        elif diff1 == diff2:
            return 0.6
        # Harder -> easier (less common)
        else:
            return 0.3
    
    def _analyze_temporal_relationship(self, node1: KnowledgeNode, node2: KnowledgeNode) -> float:
        """Analyze relationship based on creation time."""
        time_diff = abs((node1.created_at - node2.created_at).total_seconds() / 3600)
        
        # Nodes created close together might be related
        if time_diff < 24:  # Within 24 hours
            return 0.7
        elif time_diff < 168:  # Within a week
            return 0.5
        else:
            return 0.2
    
    def _calculate_overall_similarity(self, keyword_sim: float, content_sim: float, 
                                    tag_sim: float, difficulty_rel: float, 
                                    temporal_rel: float) -> float:
        """Calculate overall similarity score."""
        weights = {
            'keyword': 0.3,
            'content': 0.25,
            'tag': 0.2,
            'difficulty': 0.15,
            'temporal': 0.1
        }
        
        overall = (
            keyword_sim * weights['keyword'] +
            content_sim * weights['content'] +
            tag_sim * weights['tag'] +
            difficulty_rel * weights['difficulty'] +
            temporal_rel * weights['temporal']
        )
        
        return min(overall, 1.0)
    
    def _determine_connection_type(self, source: KnowledgeNode, target: KnowledgeNode, 
                                 similarity: float, difficulty_rel: float) -> str:
        """Determine the type of connection between nodes."""
        if difficulty_rel > 0.7:
            return 'prerequisite'
        elif similarity > 0.8:
            return 'related'
        elif similarity > 0.6:
            return 'derives_from'
        elif similarity > 0.4:
            return 'enhances'
        else:
            return 'related'
    
    def _generate_connection_tags(self, source: KnowledgeNode, target: KnowledgeNode) -> List[str]:
        """Generate tags for the connection."""
        tags = []
        
        # Add common tags
        common_tags = set(source.tags or []).intersection(set(target.tags or []))
        tags.extend(list(common_tags))
        
        # Add difficulty-based tags
        if source.difficulty_level != target.difficulty_level:
            tags.append('difficulty_transition')
        
        # Add content-based tags
        if any(tag in (source.content or "").lower() for tag in ['math', 'formula', 'equation']):
            tags.append('mathematical')
        if any(tag in (source.content or "").lower() for tag in ['code', 'program', 'function']):
            tags.append('programming')
        
        return tags
    
    def _create_adjacency_matrix(self, nodes: List[KnowledgeNode], db: Session) -> np.ndarray:
        """Create adjacency matrix for pathfinding."""
        n = len(nodes)
        matrix = np.zeros((n, n))
        
        # Get all connections
        connections = db.query(KnowledgeConnection).all()
        
        # Build matrix
        for conn in connections:
            source_idx = next((i for i, node in enumerate(nodes) if node.id == conn.source_node_id), None)
            target_idx = next((i for i, node in enumerate(nodes) if node.id == conn.target_node_id), None)
            
            if source_idx is not None and target_idx is not None:
                matrix[source_idx][target_idx] = conn.weight
        
        return matrix
    
    def _find_shortest_path(self, adjacency_matrix: np.ndarray, nodes: List[KnowledgeNode], 
                           target_id: str) -> List[str]:
        """Find shortest path using Dijkstra's algorithm."""
        # Implementation would go here
        # For now, return a simple path
        return [str(node.id) for node in nodes[:3]]  # Placeholder 