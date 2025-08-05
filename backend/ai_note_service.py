"""
AI-powered note processing service for intelligent knowledge management.
Handles keyword extraction, content analysis, and connection suggestions.
"""

import re
import json
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from models_study import KnowledgeNode, KnowledgeConnection
from ai_connection_service import AIConnectionService
import numpy as np
from datetime import datetime


class AINoteService:
    """AI service for intelligent note processing and analysis."""

    def __init__(self):
        self.connection_service = AIConnectionService()

        # Common academic keywords and concepts
        self.academic_keywords = {
            "math": [
                "derivative",
                "integral",
                "function",
                "equation",
                "variable",
                "constant",
                "limit",
                "series",
                "sequence",
            ],
            "physics": [
                "force",
                "energy",
                "velocity",
                "acceleration",
                "mass",
                "gravity",
                "momentum",
                "wave",
                "particle",
            ],
            "chemistry": [
                "molecule",
                "atom",
                "reaction",
                "bond",
                "element",
                "compound",
                "solution",
                "acid",
                "base",
            ],
            "biology": [
                "cell",
                "organism",
                "gene",
                "protein",
                "enzyme",
                "metabolism",
                "evolution",
                "ecosystem",
            ],
            "computer_science": [
                "algorithm",
                "data_structure",
                "programming",
                "function",
                "variable",
                "loop",
                "recursion",
            ],
            "history": [
                "event",
                "period",
                "civilization",
                "war",
                "revolution",
                "empire",
                "culture",
                "society",
            ],
            "literature": [
                "theme",
                "character",
                "plot",
                "symbolism",
                "metaphor",
                "narrative",
                "genre",
                "style",
            ],
        }

        # Connection phrases that indicate relationships
        self.connection_phrases = [
            r"related to\s+(\w+)",
            r"similar to\s+(\w+)",
            r"different from\s+(\w+)",
            r"builds on\s+(\w+)",
            r"requires\s+(\w+)",
            r"example of\s+(\w+)",
            r"applies to\s+(\w+)",
            r"derived from\s+(\w+)",
            r"used in\s+(\w+)",
            r"part of\s+(\w+)",
            r"type of\s+(\w+)",
            r"consists of\s+(\w+)",
        ]

    def process_note_content(self, content: str, title: str) -> Dict:
        """Process note content to extract intelligent metadata."""
        full_text = f"{title} {content}"

        # Extract keywords
        keywords = self._extract_keywords(full_text)

        # Analyze content complexity
        complexity_score = self._analyze_complexity(content)

        # Extract potential connections
        potential_connections = self._extract_potential_connections(content)

        # Determine difficulty level
        difficulty_level = self._determine_difficulty(complexity_score, keywords)

        # Generate AI rating
        ai_rating = self._calculate_ai_rating(content, keywords, complexity_score)

        # Extract suggested tags
        suggested_tags = self._suggest_tags(keywords, content)

        return {
            "keywords": keywords,
            "complexity_score": complexity_score,
            "difficulty_level": difficulty_level,
            "ai_rating": ai_rating,
            "suggested_tags": suggested_tags,
            "potential_connections": potential_connections,
            "content_analysis": {
                "word_count": len(content.split()),
                "sentence_count": len(re.split(r"[.!?]+", content)),
                "has_formulas": bool(re.search(r"[=+\-*/^()]", content)),
                "has_code": bool(
                    re.search(
                        r"(def|class|function|import|var|let|const)", content, re.I
                    )
                ),
                "has_definitions": bool(
                    re.search(r"is\s+a|are\s+a|defined\s+as", content, re.I)
                ),
            },
        }

    def suggest_connections(
        self, note: KnowledgeNode, all_notes: List[KnowledgeNode], db: Session
    ) -> List[Dict]:
        """Suggest intelligent connections for a new note."""
        suggestions = []

        # Get AI analysis of the note
        analysis = self.process_note_content(note.content or "", note.title)

        for target_note in all_notes:
            if target_note.id == note.id:
                continue

            # Calculate connection strength using multiple strategies
            connection_score = self._calculate_connection_score(
                note, target_note, analysis
            )

            if connection_score > 0.1:  # Lower threshold for more connections
                connection_type = self._determine_connection_type(
                    note, target_note, connection_score
                )

                suggestions.append(
                    {
                        "source_node_id": note.id,
                        "target_node_id": target_note.id,
                        "relationship_type": connection_type,
                        "weight": connection_score,
                        "ai_confidence": connection_score,
                        "reason": self._generate_connection_reason(
                            note, target_note, connection_type
                        ),
                        "connection_tags": self._generate_connection_tags(
                            note, target_note
                        ),
                    }
                )

        return suggestions

    def generate_study_recommendations(self, user_id: str, db: Session) -> List[Dict]:
        """Generate AI-powered study recommendations."""
        # Get all user's notes
        notes = db.query(KnowledgeNode).filter(KnowledgeNode.user_id == user_id).all()

        if not notes:
            return []

        recommendations = []

        # Find unconnected nodes (islands)
        connected_nodes = set()
        connections = (
            db.query(KnowledgeConnection)
            .filter(KnowledgeConnection.source_node_id.in_([n.id for n in notes]))
            .all()
        )

        for conn in connections:
            connected_nodes.add(conn.source_node_id)
            connected_nodes.add(conn.target_node_id)

        # Suggest connections for island nodes
        for note in notes:
            if note.id not in connected_nodes:
                suggestions = self.suggest_connections(note, notes, db)
                if suggestions:
                    recommendations.append(
                        {
                            "type": "connect_island",
                            "node_id": note.id,
                            "node_title": note.title,
                            "suggestions": suggestions[:3],  # Top 3 suggestions
                            "priority": "high",
                        }
                    )

        # Suggest study path based on difficulty progression
        beginner_notes = [n for n in notes if n.difficulty_level == "beginner"]
        intermediate_notes = [n for n in notes if n.difficulty_level == "intermediate"]
        advanced_notes = [n for n in notes if n.difficulty_level == "advanced"]

        if beginner_notes and intermediate_notes:
            recommendations.append(
                {
                    "type": "progression_path",
                    "title": "Progress to Intermediate Concepts",
                    "description": f"You have {len(beginner_notes)} beginner concepts. Ready to explore {len(intermediate_notes)} intermediate topics.",
                    "suggested_notes": intermediate_notes[:3],
                    "priority": "medium",
                }
            )

        return recommendations

    def generate_quiz_questions(self, note: KnowledgeNode) -> List[Dict]:
        """Generate quiz questions based on note content."""
        questions = []
        content = note.content or ""

        # Extract key concepts
        key_concepts = self._extract_key_concepts(content)

        for concept in key_concepts[:3]:  # Generate up to 3 questions
            question = self._create_question_from_concept(concept, content)
            if question:
                questions.append(question)

        return questions

    def generate_summary(
        self, note: KnowledgeNode, connected_notes: List[KnowledgeNode] = None
    ) -> str:
        """Generate AI summary of a note and its connections."""
        content = note.content or ""

        # Basic summary generation
        sentences = re.split(r"[.!?]+", content)
        key_sentences = self._extract_key_sentences(sentences)

        summary = f"**{note.title}**\n\n"
        summary += " ".join(key_sentences[:3]) + ".\n\n"

        if connected_notes:
            summary += f"**Related Concepts:**\n"
            for connected in connected_notes[:3]:
                summary += f"- {connected.title}\n"

        return summary

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text."""
        # Remove common words
        stop_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "being",
            "have",
            "has",
            "had",
            "do",
            "does",
            "did",
            "will",
            "would",
            "could",
            "should",
            "may",
            "might",
            "must",
            "can",
            "this",
            "that",
            "these",
            "those",
        }

        # Extract words
        words = re.findall(r"\b[a-zA-Z]+\b", text.lower())

        # Filter and count
        word_counts = {}
        for word in words:
            if word not in stop_words and len(word) > 2:
                word_counts[word] = word_counts.get(word, 0) + 1

        # Add academic keywords if found
        for category, keywords in self.academic_keywords.items():
            for keyword in keywords:
                if keyword in text.lower():
                    word_counts[keyword] = (
                        word_counts.get(keyword, 0) + 2
                    )  # Higher weight

        # Return top keywords
        sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        return [word for word, count in sorted_words[:10]]

    def _analyze_complexity(self, content: str) -> float:
        """Analyze content complexity."""
        if not content:
            return 0.0

        sentences = re.split(r"[.!?]+", content)
        words = re.findall(r"\b[a-zA-Z]+\b", content)

        avg_sentence_length = len(words) / max(len(sentences), 1)
        avg_word_length = sum(len(word) for word in words) / max(len(words), 1)

        # Technical indicators
        has_formulas = bool(re.search(r"[=+\-*/^()]", content))
        has_code = bool(
            re.search(r"(def|class|function|import|var|let|const)", content, re.I)
        )
        has_numbers = bool(re.search(r"\d+", content))
        has_definitions = bool(re.search(r"is\s+a|are\s+a|defined\s+as", content, re.I))

        complexity = (
            (avg_sentence_length / 20) * 0.3
            + (avg_word_length / 8) * 0.2
            + (has_formulas * 0.2)
            + (has_code * 0.2)
            + (has_numbers * 0.1)
        )

        return min(complexity, 1.0)

    def _extract_potential_connections(self, content: str) -> List[str]:
        """Extract potential connection phrases from content."""
        connections = []
        for phrase in self.connection_phrases:
            matches = re.findall(phrase, content, re.I)
            connections.extend(matches)
        return connections

    def _determine_difficulty(
        self, complexity_score: float, keywords: List[str]
    ) -> str:
        """Determine difficulty level based on complexity and keywords."""
        if complexity_score > 0.7:
            return "advanced"
        elif complexity_score > 0.4:
            return "intermediate"
        else:
            return "beginner"

    def _calculate_ai_rating(
        self, content: str, keywords: List[str], complexity: float
    ) -> float:
        """Calculate AI confidence rating for content quality."""
        # Factors: content length, keyword density, complexity balance
        word_count = len(content.split())
        keyword_density = len(keywords) / max(word_count, 1)

        # Balance between complexity and clarity
        clarity_score = 1.0 - complexity if complexity < 0.8 else 0.2

        rating = (
            (min(word_count / 100, 1.0) * 0.3)
            + (keyword_density * 0.3)
            + (clarity_score * 0.4)
        )

        return min(rating, 1.0)

    def _suggest_tags(self, keywords: List[str], content: str) -> List[str]:
        """Suggest tags based on keywords and content."""
        tags = []

        # Add category tags based on keywords
        for category, category_keywords in self.academic_keywords.items():
            if any(kw in keywords for kw in category_keywords):
                tags.append(category)

        # Add difficulty tag
        complexity = self._analyze_complexity(content)
        if complexity > 0.7:
            tags.append("advanced")
        elif complexity > 0.4:
            tags.append("intermediate")
        else:
            tags.append("beginner")

        return list(set(tags))

    def _calculate_connection_score(
        self, note1: KnowledgeNode, note2: KnowledgeNode, analysis: Dict
    ) -> float:
        """Calculate connection strength between two notes."""
        # Multiple similarity metrics
        keyword_similarity = self._calculate_keyword_similarity(note1, note2)
        content_similarity = self._calculate_content_similarity(note1, note2)
        tag_similarity = self._calculate_tag_similarity(note1, note2)
        difficulty_relationship = self._analyze_difficulty_relationship(note1, note2)

        # Weighted combination
        score = (
            keyword_similarity * 0.4
            + content_similarity * 0.3
            + tag_similarity * 0.2
            + difficulty_relationship * 0.1
        )

        return min(score, 1.0)

    def _calculate_keyword_similarity(
        self, note1: KnowledgeNode, note2: KnowledgeNode
    ) -> float:
        """Calculate similarity based on keywords."""
        # Get keywords from node_metadata if available, otherwise from direct field
        keywords1 = set()
        if note1.node_metadata and "ai_analysis" in note1.node_metadata:
            keywords1 = set(note1.node_metadata["ai_analysis"].get("keywords", []))
        elif note1.keywords:
            keywords1 = set(note1.keywords)

        keywords2 = set()
        if note2.node_metadata and "ai_analysis" in note2.node_metadata:
            keywords2 = set(note2.node_metadata["ai_analysis"].get("keywords", []))
        elif note2.keywords:
            keywords2 = set(note2.keywords)

        if not keywords1 or not keywords2:
            return 0.0

        intersection = keywords1.intersection(keywords2)
        union = keywords1.union(keywords2)

        return len(intersection) / len(union) if union else 0.0

    def _calculate_content_similarity(
        self, note1: KnowledgeNode, note2: KnowledgeNode
    ) -> float:
        """Calculate similarity based on content overlap."""
        content1 = (note1.content or "").lower()
        content2 = (note2.content or "").lower()

        if not content1 or not content2:
            return 0.0

        words1 = set(re.findall(r"\b[a-zA-Z]+\b", content1))
        words2 = set(re.findall(r"\b[a-zA-Z]+\b", content2))

        intersection = words1.intersection(words2)
        union = words1.union(words2)

        return len(intersection) / len(union) if union else 0.0

    def _calculate_tag_similarity(
        self, note1: KnowledgeNode, note2: KnowledgeNode
    ) -> float:
        """Calculate similarity based on tag overlap."""
        tags1 = set(note1.tags or [])
        tags2 = set(note2.tags or [])

        if not tags1 or not tags2:
            return 0.0

        intersection = tags1.intersection(tags2)
        union = tags1.union(tags2)

        return len(intersection) / len(union) if union else 0.0

    def _analyze_difficulty_relationship(
        self, note1: KnowledgeNode, note2: KnowledgeNode
    ) -> float:
        """Analyze relationship based on difficulty levels."""
        difficulty_map = {"beginner": 1, "intermediate": 2, "advanced": 3}

        diff1 = difficulty_map.get(note1.difficulty_level, 1)
        diff2 = difficulty_map.get(note2.difficulty_level, 1)

        if diff1 < diff2:
            return 0.8  # Prerequisite relationship
        elif diff1 == diff2:
            return 0.6  # Related at same level
        else:
            return 0.3  # Less common

    def _determine_connection_type(
        self, note1: KnowledgeNode, note2: KnowledgeNode, score: float
    ) -> str:
        """Determine the type of connection between nodes."""
        difficulty_map = {"beginner": 1, "intermediate": 2, "advanced": 3}
        diff1 = difficulty_map.get(note1.difficulty_level, 1)
        diff2 = difficulty_map.get(note2.difficulty_level, 1)

        if diff1 < diff2:
            return "prerequisite"
        elif score > 0.8:
            return "related"
        elif score > 0.6:
            return "derives_from"
        elif score > 0.4:
            return "enhances"
        else:
            return "related"

    def _generate_connection_reason(
        self, note1: KnowledgeNode, note2: KnowledgeNode, connection_type: str
    ) -> str:
        """Generate human-readable reason for connection."""
        if connection_type == "prerequisite":
            return (
                f"Understanding {note1.title} is required before learning {note2.title}"
            )
        elif connection_type == "related":
            return (
                f"Both notes cover related concepts in {note1.difficulty_level} level"
            )
        elif connection_type == "derives_from":
            return f"{note2.title} builds upon concepts from {note1.title}"
        else:
            return f"Shared concepts and keywords between the notes"

    def _generate_connection_tags(
        self, note1: KnowledgeNode, note2: KnowledgeNode
    ) -> List[str]:
        """Generate tags for the connection."""
        tags = []

        # Add common tags
        common_tags = set(note1.tags or []).intersection(set(note2.tags or []))
        tags.extend(list(common_tags))

        # Add difficulty-based tags
        if note1.difficulty_level != note2.difficulty_level:
            tags.append("difficulty_transition")

        return tags

    def _extract_key_concepts(self, content: str) -> List[str]:
        """Extract key concepts from content for quiz generation."""
        # Look for definitions and important terms
        concepts = []

        # Find capitalized terms (potential concepts)
        capitalized_terms = re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b", content)
        concepts.extend(capitalized_terms[:5])

        # Find terms in quotes
        quoted_terms = re.findall(r'"([^"]+)"', content)
        concepts.extend(quoted_terms)

        return list(set(concepts))[:5]

    def _create_question_from_concept(
        self, concept: str, content: str
    ) -> Optional[Dict]:
        """Create a quiz question from a concept."""
        if not concept or len(concept) < 3:
            return None

        # Simple question generation
        question = f"What is {concept}?"

        # Extract potential answers from content
        sentences = re.split(r"[.!?]+", content)
        relevant_sentences = [s for s in sentences if concept.lower() in s.lower()]

        if relevant_sentences:
            answer = relevant_sentences[0].strip()
            return {
                "question": question,
                "answer": answer,
                "concept": concept,
                "type": "definition",
            }

        return None

    def _extract_key_sentences(self, sentences: List[str]) -> List[str]:
        """Extract key sentences for summary generation."""
        # Simple heuristic: longer sentences with key terms
        scored_sentences = []

        for sentence in sentences:
            if len(sentence.strip()) < 10:
                continue

            # Score based on length and presence of key terms
            score = len(sentence.split()) * 0.1

            # Bonus for sentences with definitions
            if re.search(r"is\s+a|are\s+a|defined\s+as", sentence, re.I):
                score += 2

            scored_sentences.append((sentence.strip(), score))

        # Return top sentences
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in scored_sentences[:3]]
