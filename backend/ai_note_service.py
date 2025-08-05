"""
Production-ready AI-powered note processing service.
Uses AIServiceManager for robust, scalable AI operations.
"""

import re
import json
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from models_study import KnowledgeNode, KnowledgeConnection
from ai_connection_service import AIConnectionService
from ai_service_manager import ai_service_manager
import numpy as np
from datetime import datetime
import os


class HybridAINoteService:
    """Production-ready hybrid AI service using AIServiceManager."""

    def __init__(self):
        self.connection_service = AIConnectionService()
        self.ai_manager = ai_service_manager
        # Get OpenAI client from AI service manager
        self.openai_client = self.ai_manager.openai_client
        print("✅ Production AI service initialized")

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
                "machine learning",
                "neural networks",
                "artificial intelligence",
                "deep learning",
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
        """Process note content using local models for efficiency."""
        full_text = f"{title} {content}"

        # Extract keywords using YAKE (local)
        keywords = self._extract_keywords_local(full_text)

        # Analyze content complexity (local)
        complexity_score = self._analyze_complexity_local(content)

        # Extract potential connections (local)
        potential_connections = self._extract_potential_connections(content)

        # Determine difficulty level (local)
        difficulty_level = self._determine_difficulty_local(complexity_score, keywords)

        # Generate AI rating (local)
        ai_rating = self._calculate_ai_rating_local(content, keywords, complexity_score)

        # Extract suggested tags (local)
        suggested_tags = self._suggest_tags_local(keywords, content)

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
        """Suggest connections using production AI service manager."""
        suggestions = []

        if not all_notes:
            return suggestions

        try:
            note_text = f"{note.title} {note.content or ''}"

            for target_note in all_notes:
                if target_note.id == note.id:
                    continue

                target_text = f"{target_note.title} {target_note.content or ''}"

                # Use AI service manager for similarity
                similarity_score = self.ai_manager.get_semantic_similarity(
                    note_text, target_text
                )

                # Use adaptive threshold based on similarity type
                threshold = 0.3 if similarity_score > 0.5 else 0.1

                if similarity_score > threshold:
                    connection_type = self._determine_connection_type_local(
                        note, target_note, similarity_score
                    )

                    suggestions.append(
                        {
                            "source_node_id": note.id,
                            "target_node_id": target_note.id,
                            "relationship_type": connection_type,
                            "weight": similarity_score,
                            "ai_confidence": similarity_score,
                            "reason": self._generate_connection_reason_local(
                                note, target_note, connection_type
                            ),
                            "connection_tags": self._generate_connection_tags_local(
                                note, target_note
                            ),
                        }
                    )

        except Exception as e:
            print(f"Error in connection suggestions: {e}")

        # Sort by similarity and return top suggestions
        suggestions.sort(key=lambda x: x["weight"], reverse=True)
        return suggestions[:5]

    def generate_quiz_questions(self, note: KnowledgeNode) -> List[Dict]:
        """Generate quiz questions using AI service manager."""
        content = note.content or ""
        title = note.title or ""

        return self.ai_manager.generate_quiz_questions(content, title)

    def generate_summary(
        self, note: KnowledgeNode, connected_notes: List[KnowledgeNode] = None
    ) -> str:
        """Generate summary using AI service manager."""
        content = note.content or ""
        title = note.title or ""

        return self.ai_manager.generate_summary(content, title)

    def generate_study_recommendations(self, user_id: str, db: Session) -> List[Dict]:
        """Generate personalized study recommendations."""
        recommendations = []

        # Get user's notes
        user_notes = (
            db.query(KnowledgeNode).filter(KnowledgeNode.created_by == user_id).all()
        )

        if not user_notes:
            return recommendations

        # Analyze user's learning patterns
        difficulty_distribution = {}
        for note in user_notes:
            difficulty = note.difficulty_level or "beginner"
            difficulty_distribution[difficulty] = (
                difficulty_distribution.get(difficulty, 0) + 1
            )

        # Generate recommendations based on patterns
        if difficulty_distribution.get("beginner", 0) > difficulty_distribution.get(
            "advanced", 0
        ):
            recommendations.append(
                {
                    "type": "difficulty_progression",
                    "title": "Ready for Intermediate Topics",
                    "description": "You've mastered many beginner concepts. Consider exploring intermediate topics.",
                    "priority": "high",
                }
            )

        # Recommend topics with low review count
        low_review_notes = [note for note in user_notes if (note.review_count or 0) < 2]
        if low_review_notes:
            recommendations.append(
                {
                    "type": "review_reminder",
                    "title": "Review Needed",
                    "description": f"You have {len(low_review_notes)} notes that need review.",
                    "priority": "medium",
                }
            )

        return recommendations

    def generate_study_plan(self, note: KnowledgeNode) -> str:
        """Generate study plan using OpenAI (high-value task)."""
        if not self.openai_client:
            return self._generate_study_plan_local(note)

        content = note.content or ""
        title = note.title or ""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert study coach. Create a personalized study plan for the given content.",
                    },
                    {
                        "role": "user",
                        "content": f"Create a study plan for: {title}\n\nContent: {content}",
                    },
                ],
                max_tokens=500,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI study plan generation failed: {e}")
            return self._generate_study_plan_local(note)

    # Local model implementations
    def _extract_keywords_local(self, text: str) -> List[str]:
        """Extract keywords using AI service manager."""
        return self.ai_manager.extract_keywords(text)

    def _extract_keywords_fallback(self, text: str) -> List[str]:
        """Fallback keyword extraction using basic NLP."""
        # Final fallback: extract capitalized terms
        return re.findall(r"\b[A-Z][a-zA-Z\s]+\b", text)[:5]

    def _generate_questions_local(self, content: str, title: str) -> List[Dict]:
        """Generate questions using local NLP."""
        questions = []

        # Extract key concepts
        key_concepts = self._extract_key_concepts_local(content)
        if title and title not in key_concepts:
            key_concepts.insert(0, title)

        for concept in key_concepts[:3]:
            question = self._create_question_local(concept, content)
            if question:
                questions.append(question)

        return questions

    def _generate_questions_openai(self, content: str, title: str) -> List[Dict]:
        """Generate questions using OpenAI."""
        if not self.openai_client:
            return []

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Generate 2-3 quiz questions about the given content. Return as JSON array with 'question', 'answer', 'concept', 'type' fields.",
                    },
                    {"role": "user", "content": f"Title: {title}\nContent: {content}"},
                ],
                max_tokens=300,
                temperature=0.7,
            )

            # Parse JSON response
            import json

            questions_text = response.choices[0].message.content
            questions = json.loads(questions_text)
            return questions
        except Exception as e:
            print(f"OpenAI question generation failed: {e}")
            return []

    def _generate_summary_local(
        self, note: KnowledgeNode, connected_notes: List[KnowledgeNode] = None
    ) -> str:
        """Generate summary using local NLP."""
        content = note.content or ""
        title = note.title or ""

        # Basic summary using extractive approach
        sentences = re.split(r"[.!?]+", content)
        key_sentences = self._extract_key_sentences_local(sentences)

        summary = f"**{title}**\n\n"
        if key_sentences:
            summary += " ".join(key_sentences[:3]) + ".\n\n"
        else:
            summary += f"{content[:200]}...\n\n"

        # Add metadata
        if note.difficulty_level:
            summary += f"**Difficulty:** {note.difficulty_level.title()}\n"
        if note.ai_rating:
            summary += f"**AI Rating:** {note.ai_rating:.1%}\n"

        return summary

    def _generate_summary_openai(self, content: str, title: str) -> str:
        """Generate enhanced summary using OpenAI."""
        if not self.openai_client:
            return ""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Create a clear, concise summary of the given content. Use markdown formatting.",
                    },
                    {"role": "user", "content": f"Title: {title}\nContent: {content}"},
                ],
                max_tokens=300,
                temperature=0.5,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI summary generation failed: {e}")
            return ""

    # Helper methods (keeping existing ones but making them local-focused)
    def _analyze_complexity_local(self, content: str) -> float:
        """Analyze content complexity using local metrics."""
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

    def _determine_difficulty_local(
        self, complexity_score: float, keywords: List[str]
    ) -> str:
        """Determine difficulty level using local analysis."""
        if complexity_score > 0.7:
            return "advanced"
        elif complexity_score > 0.4:
            return "intermediate"
        else:
            return "beginner"

    def _calculate_ai_rating_local(
        self, content: str, keywords: List[str], complexity: float
    ) -> float:
        """Calculate AI rating using local metrics."""
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

    def _suggest_tags_local(self, keywords: List[str], content: str) -> List[str]:
        """Suggest tags using local analysis."""
        tags = []

        # Add category tags based on keywords
        for category, category_keywords in self.academic_keywords.items():
            if any(kw in keywords for kw in category_keywords):
                tags.append(category)

        # Add difficulty tag
        complexity = self._analyze_complexity_local(content)
        if complexity > 0.7:
            tags.append("advanced")
        elif complexity > 0.4:
            tags.append("intermediate")
        else:
            tags.append("beginner")

        return list(set(tags))

    def _extract_key_concepts_local(self, content: str) -> List[str]:
        """Extract key concepts using local NLP with spaCy if available."""
        concepts = []

        # Use spaCy for NER if available
        if self.nlp:
            try:
                doc = self.nlp(content)
                entities = [
                    ent.text
                    for ent in doc.ents
                    if ent.label_ in ["ORG", "PRODUCT", "GPE", "PERSON", "MISC"]
                ]
                concepts.extend(entities[:3])
            except Exception as e:
                print(f"spaCy NER failed: {e}")

        # Find capitalized terms
        capitalized_terms = re.findall(
            r"\b[A-Z][a-zA-Z\s]+(?:[A-Z][a-zA-Z\s]+)*\b", content
        )
        concepts.extend(
            [term.strip() for term in capitalized_terms if len(term.strip()) > 2]
        )

        # Find terms in quotes
        quoted_terms = re.findall(r'"([^"]+)"', content)
        concepts.extend(quoted_terms)

        # Find terms after "is a" or "are"
        definition_patterns = re.findall(
            r"(?:is\s+a|are\s+a|defined\s+as)\s+([A-Z][a-zA-Z\s]+)", content, re.I
        )
        concepts.extend(definition_patterns)

        # Remove duplicates and return
        return list(set(concepts))[:5]

    def _create_question_local(self, concept: str, content: str) -> Optional[Dict]:
        """Create a question using local NLP."""
        if not concept or len(concept) < 3:
            return None

        question = f"What is {concept}?"

        # Find relevant sentences
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

    def _extract_key_sentences_local(self, sentences: List[str]) -> List[str]:
        """Extract key sentences using local analysis."""
        scored_sentences = []

        for sentence in sentences:
            if len(sentence.strip()) < 10:
                continue

            score = len(sentence.split()) * 0.1

            if re.search(r"is\s+a|are\s+a|defined\s+as", sentence, re.I):
                score += 2

            scored_sentences.append((sentence.strip(), score))

        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in scored_sentences[:3]]

    def _determine_connection_type_local(
        self, note1: KnowledgeNode, note2: KnowledgeNode, similarity: float
    ) -> str:
        """Determine connection type using local analysis."""
        difficulty_map = {"beginner": 1, "intermediate": 2, "advanced": 3}
        diff1 = difficulty_map.get(note1.difficulty_level, 1)
        diff2 = difficulty_map.get(note2.difficulty_level, 1)

        if diff1 < diff2:
            return "prerequisite"
        elif similarity > 0.8:
            return "related"
        elif similarity > 0.6:
            return "derives_from"
        elif similarity > 0.4:
            return "enhances"
        else:
            return "related"

    def _generate_connection_reason_local(
        self, note1: KnowledgeNode, note2: KnowledgeNode, connection_type: str
    ) -> str:
        """Generate connection reason using local analysis."""
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

    def _generate_connection_tags_local(
        self, note1: KnowledgeNode, note2: KnowledgeNode
    ) -> List[str]:
        """Generate connection tags using local analysis."""
        tags = []

        # Add common tags
        common_tags = set(note1.tags or []).intersection(set(note2.tags or []))
        tags.extend(list(common_tags))

        # Add difficulty-based tags
        if note1.difficulty_level != note2.difficulty_level:
            tags.append("difficulty_transition")

        return tags

    def _generate_study_plan_local(self, note: KnowledgeNode) -> str:
        """Generate basic study plan using local analysis."""
        content = note.content or ""
        title = note.title or ""

        plan = f"## Study Plan for {title}\n\n"
        plan += "### 1. Review Key Concepts\n"
        plan += "- Read through the content carefully\n"
        plan += "- Identify main ideas and supporting details\n\n"

        plan += "### 2. Practice Activities\n"
        plan += "- Create flashcards for key terms\n"
        plan += "- Summarize the content in your own words\n"
        plan += "- Discuss with peers or study group\n\n"

        plan += "### 3. Assessment\n"
        plan += "- Test your understanding with practice questions\n"
        plan += "- Review any areas of confusion\n\n"

        return plan

    def _extract_potential_connections(self, content: str) -> List[str]:
        """Extract potential connection phrases from content."""
        connections = []
        for pattern in self.connection_phrases:
            matches = re.findall(pattern, content, re.IGNORECASE)
            connections.extend(matches)
        return connections
