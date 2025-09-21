"""
AI service integration for StudentsAI MVP using OpenAI
"""

import asyncio
import logging
from typing import List, Dict, Any
import openai
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re

from .config import OPENAI_API_KEY
from .schemas import GeneratedFlashcard

# Configure OpenAI
openai.api_key = OPENAI_API_KEY

# Configure logging
logger = logging.getLogger(__name__)


class AIService:
    """AI service for text processing and generation"""

    def __init__(self):
        self.client = openai.OpenAI(api_key=OPENAI_API_KEY)

    async def summarize_text(self, content: str) -> str:
        """Generate summary of text content"""
        try:
            prompt = f"""
            Please provide a concise summary of the following text. 
            Focus on the key points and main ideas. 
            Keep the summary clear and well-structured.
            
            Text to summarize:
            {content}
            
            Summary:
            """

            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that creates clear, concise summaries of academic and educational content.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=2000,
                temperature=0.3,
            )

            summary = response.choices[0].message.content.strip()
            return summary

        except Exception as e:
            logger.error(f"Error in summarize_text: {str(e)}")
            raise Exception(f"Failed to generate summary: {str(e)}")

    async def generate_flashcards(
        self, content: str, count: int = 5
    ) -> List[GeneratedFlashcard]:
        """Generate flashcards from text content"""
        try:
            prompt = f"""
            Create {count} educational flashcards from the following content.
            Each flashcard should have a clear question and a concise answer.
            Focus on key concepts, definitions, and important facts.
            Format your response as a JSON array with objects containing "question" and "answer" fields.
            
            Content:
            {content}
            
            Generate exactly {count} flashcards in this JSON format:
            [
                {{"question": "What is...", "answer": "..."}},
                {{"question": "How does...", "answer": "..."}},
                ...
            ]
            """

            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an educational assistant that creates high-quality study flashcards. Always respond with valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=1000,
                temperature=0.4,
            )

            response_text = response.choices[0].message.content.strip()

            # Parse JSON response
            import json

            try:
                decoded = json.loads(response_text)

                # Some models wrap the list, e.g. {"flashcards": [...]} or {"cards": [...]}
                if isinstance(decoded, dict):
                    if isinstance(decoded.get("flashcards"), list):
                        flashcards_data = decoded["flashcards"]
                    elif isinstance(decoded.get("cards"), list):
                        flashcards_data = decoded["cards"]
                    else:
                        # Unexpected dict shape; fallback
                        return self._parse_flashcards_fallback(response_text, count)
                elif isinstance(decoded, list):
                    flashcards_data = decoded
                else:
                    # Unsupported top-level type; fallback
                    return self._parse_flashcards_fallback(response_text, count)

                # Normalize items; ignore malformed entries gracefully
                normalized: List[GeneratedFlashcard] = []
                for item in flashcards_data:
                    if isinstance(item, dict):
                        q = item.get("question")
                        a = item.get("answer")
                        if isinstance(q, str) and isinstance(a, str):
                            normalized.append(GeneratedFlashcard(question=q, answer=a))
                    elif isinstance(item, list) and len(item) >= 2:
                        q, a = item[0], item[1]
                        if isinstance(q, str) and isinstance(a, str):
                            normalized.append(GeneratedFlashcard(question=q, answer=a))

                if not normalized:
                    return self._parse_flashcards_fallback(response_text, count)

                return normalized[:count]
            except json.JSONDecodeError:
                # Fallback: extract Q&A pairs manually
                return self._parse_flashcards_fallback(response_text, count)

        except Exception as e:
            logger.error(f"Error in generate_flashcards: {str(e)}")
            raise Exception(f"Failed to generate flashcards: {str(e)}")

    def _parse_flashcards_fallback(
        self, text: str, count: int
    ) -> List[GeneratedFlashcard]:
        """Fallback parser for flashcards when JSON parsing fails"""
        flashcards = []
        lines = text.split("\n")

        current_question = None
        current_answer = None

        for line in lines:
            line = line.strip()
            if line.startswith("Q:") or line.startswith("Question:"):
                if current_question and current_answer:
                    flashcards.append(
                        GeneratedFlashcard(
                            question=current_question, answer=current_answer
                        )
                    )
                current_question = line.split(":", 1)[1].strip()
                current_answer = None
            elif line.startswith("A:") or line.startswith("Answer:"):
                current_answer = line.split(":", 1)[1].strip()

        # Add the last flashcard
        if current_question and current_answer:
            flashcards.append(
                GeneratedFlashcard(question=current_question, answer=current_answer)
            )

        # If still no flashcards, create simple ones
        if not flashcards:
            flashcards = [
                GeneratedFlashcard(
                    question="What are the main points of this content?",
                    answer="Please review the original content for key concepts.",
                )
            ]

        return flashcards[:count]

    def calculate_similarity(self, texts: List[str]) -> np.ndarray:
        """Calculate similarity matrix between texts using TF-IDF"""
        if len(texts) < 2:
            return np.array([[1.0]])

        try:
            # Create TF-IDF vectors
            # More permissive vectorizer to make similarity matching easier
            vectorizer = TfidfVectorizer(
                max_features=3000,
                stop_words="english",
                ngram_range=(1, 2),
                sublinear_tf=True,
                norm="l2",
            )

            tfidf_matrix = vectorizer.fit_transform(texts)

            # Calculate cosine similarity
            similarity_matrix = cosine_similarity(tfidf_matrix)
            # Calibrate similarities to be less strict: boost medium sims upward
            # boosted = min(1, sqrt(sim) * 1.1)
            boosted = np.minimum(1.0, np.sqrt(np.maximum(similarity_matrix, 0.0)) * 1.1)

            return boosted

        except Exception as e:
            logger.error(f"Error calculating similarity: {str(e)}")
            # Return identity matrix as fallback
            n = len(texts)
            return np.eye(n)

    def find_note_connections(
        self, notes: List[Dict[str, Any]], threshold: float = 0.6
    ) -> List[Dict[str, Any]]:
        """Find connections between notes based on content similarity"""
        if len(notes) < 2:
            return []

        # Extract text content for similarity calculation
        texts = [f"{note['title']} {note['content']}" for note in notes]

        # Calculate similarity matrix
        similarity_matrix = self.calculate_similarity(texts)

        connections = []
        n = len(notes)

        for i in range(n):
            for j in range(i + 1, n):
                similarity = similarity_matrix[i][j]

                if similarity > threshold:
                    connections.append(
                        {
                            "source_id": notes[i]["id"],
                            "target_id": notes[j]["id"],
                            "similarity": float(similarity),
                            "connection_type": "similarity",
                        }
                    )

        # Sort by similarity (highest first)
        connections.sort(key=lambda x: x["similarity"], reverse=True)

        return connections

    def extract_keywords(self, text: str, max_keywords: int = 12) -> List[str]:
        """Lightweight keyword extraction using TF-IDF on the single document split into chunks.
        For MVP: split text into sentences, compute tf-idf terms, pick top N terms.
        """
        if not text:
            return []
        try:
            # Basic cleanup
            text = re.sub(r"\s+", " ", text)
            # Split into pseudo-docs (sentences) so TF-IDF makes sense
            sentences = re.split(r"(?<=[.!?])\s+", text)
            sentences = [s for s in sentences if len(s.split()) >= 3]
            if len(sentences) < 3:
                sentences = [text]

            vectorizer = TfidfVectorizer(
                max_features=2000, stop_words="english", ngram_range=(1, 2)
            )
            tfidf_matrix = vectorizer.fit_transform(sentences)
            # Aggregate scores across sentences
            scores = np.asarray(tfidf_matrix.sum(axis=0)).ravel()
            terms = np.array(vectorizer.get_feature_names_out())
            # Rank by score
            top_indices = np.argsort(scores)[::-1]
            ranked_terms = [terms[i] for i in top_indices]
            # Filter out very short tokens
            ranked_terms = [t for t in ranked_terms if len(t) > 2][:max_keywords]
            return ranked_terms
        except Exception as e:
            logger.warning(f"Keyword extraction failed: {e}")
            return []


# Global AI service instance
ai_service = AIService()


# Convenience functions
async def summarize_content(content: str) -> str:
    """Summarize text content"""
    return await ai_service.summarize_text(content)


async def generate_flashcards_from_content(
    content: str, count: int = 5
) -> List[GeneratedFlashcard]:
    """Generate flashcards from content"""
    return await ai_service.generate_flashcards(content, count)


def calculate_note_similarities(notes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Calculate similarities between notes"""
    return ai_service.find_note_connections(notes)


def extract_keywords_from_text(text: str, max_keywords: int = 12) -> List[str]:
    """Extract keywords from text using TF-IDF"""
    return ai_service.extract_keywords(text, max_keywords)


async def evaluate_answer_with_llm(prompt: str) -> str:
    """
    Evaluate a student's answer using LLM for intelligent scoring.
    This is a premium feature for paid users.
    """
    try:
        # TODO: Implement actual LLM call (OpenAI, Anthropic, etc.)
        # For now, return a mock response to test the system

        # Mock LLM response - replace with actual API call
        mock_response = {
            "score": 85,
            "quality_rating": 4,
            "verdict": "correct",
            "feedback": "Excellent understanding demonstrated! You've covered the key concepts well and shown good comprehension of the material.",
            "key_points_covered": 4,
            "key_points_missing": ["minor detail about timing"],
            "confidence": 88,
        }

        import json

        return json.dumps(mock_response)

    except Exception as e:
        from .config import DEBUG

        if DEBUG:
            print(f"LLM evaluation failed: {e}")
        # Return fallback response
        fallback_response = {
            "score": 60,
            "quality_rating": 3,
            "verdict": "partial",
            "feedback": "AI evaluation temporarily unavailable. Using fallback scoring.",
            "key_points_covered": 2,
            "key_points_missing": ["several key concepts"],
            "confidence": 50,
        }

        import json

        return json.dumps(fallback_response)
