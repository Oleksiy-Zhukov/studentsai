"""
Production-ready AI Service Manager with lazy loading and external service integration.
Implements a robust, scalable architecture for AI operations.
"""

import os
import json
import time
import hashlib
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import requests
import openai
import redis

# from celery import Celery  # Removed - not needed for core functionality
import numpy as np

# Configure logging
logger = logging.getLogger(__name__)
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import yake
from config import config


class AIServiceManager:
    """
    Production-ready AI service manager with:
    - Lazy loading of heavy models
    - Caching for performance
    - Fallback mechanisms
    - External service integration
    - Resource management
    """

    def __init__(self):
        self.cache = None
        self.celery_app = None
        self.openai_client = None
        self._initialize_services()

    def _initialize_services(self):
        """Initialize core services with error handling."""
        # Initialize Redis cache
        try:
            self.cache = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=0,
                decode_responses=True,
            )
            self.cache.ping()
            logger.info("✅ Redis cache initialized")
        except Exception as e:
            logger.warning("⚠️ Redis cache unavailable: %s", e)
            self.cache = None

        # Initialize async task support (simplified)
        self.celery_app = None  # Removed for simplicity

        # Initialize OpenAI - Legacy API approach (compatible with 0.28.1)
        openai_api_key = config.OPENAI_API_KEY
        if openai_api_key and openai_api_key.strip():
            try:
                # Use the legacy OpenAI client initialization
                import openai

                openai.api_key = openai_api_key
                self.openai_client = openai
                logger.info("✅ OpenAI client initialized (legacy API - 0.28.1)")
            except Exception as e:
                logger.warning("⚠️ OpenAI client initialization failed: %s", e)
                self.openai_client = None
        else:
            logger.warning("⚠️ OpenAI API key not found (using local models only)")
            self.openai_client = None

    def _get_cache_key(self, operation: str, data: str) -> str:
        """Generate cache key for operations."""
        content_hash = hashlib.md5(data.encode()).hexdigest()
        return f"ai:{operation}:{content_hash}"

    def _get_cached_result(self, cache_key: str) -> Optional[Dict]:
        """Get cached result if available and not expired."""
        if not self.cache:
            return None

        try:
            cached = self.cache.get(cache_key)
            if cached:
                result = json.loads(cached)
                # Check if cache is still valid (24 hours)
                if result.get("timestamp"):
                    cache_time = datetime.fromisoformat(result["timestamp"])
                    if datetime.now() - cache_time < timedelta(hours=24):
                        return result["data"]
        except Exception as e:
            print(f"Cache error: {e}")
        return None

    def _cache_result(self, cache_key: str, data: Dict):
        """Cache result with timestamp."""
        if not self.cache:
            return

        try:
            cache_data = {"data": data, "timestamp": datetime.now().isoformat()}
            self.cache.setex(cache_key, 86400, json.dumps(cache_data))  # 24 hours
        except Exception as e:
            print(f"Cache error: {e}")

    def get_semantic_similarity(self, text1: str, text2: str) -> float:
        """
        Get semantic similarity using external service or fallback.
        Production-ready with caching and fallback mechanisms.
        """
        cache_key = self._get_cache_key("similarity", f"{text1}|{text2}")

        # Check cache first
        cached = self._get_cached_result(cache_key)
        if cached is not None:
            return cached.get("similarity", 0.0)

        # Try external semantic service
        similarity = self._get_external_semantic_similarity(text1, text2)

        # Fallback to TF-IDF if external service fails
        if similarity is None:
            similarity = self._get_tfidf_similarity(text1, text2)

        # Cache result
        self._cache_result(cache_key, {"similarity": similarity})
        return similarity

    def _get_external_semantic_similarity(
        self, text1: str, text2: str
    ) -> Optional[float]:
        """Get semantic similarity from external service."""
        # In production, this would call a dedicated ML service
        # For now, we'll use a simple heuristic
        try:
            # Simple word overlap similarity as fallback
            words1 = set(text1.lower().split())
            words2 = set(text2.lower().split())

            if not words1 or not words2:
                return 0.0

            intersection = words1.intersection(words2)
            union = words1.union(words2)

            return len(intersection) / len(union) if union else 0.0

        except Exception as e:
            print(f"External semantic similarity failed: {e}")
            return None

    def _get_tfidf_similarity(self, text1: str, text2: str) -> float:
        """Get TF-IDF similarity as fallback."""
        try:
            vectorizer = TfidfVectorizer(max_features=100, stop_words="english")
            tfidf_matrix = vectorizer.fit_transform([text1, text2])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except Exception as e:
            print(f"TF-IDF similarity failed: {e}")
            return 0.0

    def extract_keywords(self, text: str) -> List[str]:
        """Extract keywords with caching."""
        cache_key = self._get_cache_key("keywords", text)

        # Check cache
        cached = self._get_cached_result(cache_key)
        if cached is not None:
            return cached["keywords"]

        # Extract keywords
        keywords = self._extract_keywords_local(text)

        # Cache result
        self._cache_result(cache_key, {"keywords": keywords})
        return keywords

    def _extract_keywords_local(self, text: str) -> List[str]:
        """Extract keywords using YAKE."""
        try:
            keyword_extractor = yake.KeywordExtractor(
                lan="en", n=1, dedupLim=0.9, top=10
            )
            keywords = keyword_extractor.extract_keywords(text)
            return [kw for kw, score in keywords]
        except Exception as e:
            print(f"YAKE keyword extraction failed: {e}")
            # Fallback to simple extraction
            stopwords = {
                "the",
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
                "can",
                "this",
                "that",
                "these",
                "those",
                "a",
                "an",
                "as",
                "from",
                "not",
                "no",
                "yes",
                "so",
                "if",
                "then",
                "else",
                "when",
                "where",
                "why",
                "how",
                "what",
                "which",
                "who",
                "whom",
                "whose",
            }
            words = text.lower().split()
            filtered_words = [w for w in words if len(w) > 3 and w not in stopwords]
            return filtered_words[:5] if filtered_words else ["key concept"]

    def generate_summary(
        self, content: str, title: str = "", tier: str = "free"
    ) -> str:
        """Generate summary with OpenAI or fallback."""
        cache_key = self._get_cache_key("summary", f"{title}:{content}")

        # Check cache
        cached = self._get_cached_result(cache_key)
        if cached is not None:
            return cached["summary"]

        # Try OpenAI first
        if tier != "free" and self.openai_client and len(content) > 200:
            summary = self._generate_openai_summary(content, title)
            if summary:
                self._cache_result(cache_key, {"summary": summary})
                return summary

        # Fallback to extractive summary
        summary = self._generate_extractive_summary(content)
        self._cache_result(cache_key, {"summary": summary})
        return summary

    def _generate_openai_summary(self, content: str, title: str) -> Optional[str]:
        """Generate summary using OpenAI."""
        try:
            prompt = f"""Create a comprehensive summary of the following educational content. 
            Focus on key concepts, main ideas, and important details.
            Use clear, academic language and structure the summary logically.
            
            Title: {title}
            Content: {content[:3000]}
            
            Provide a summary that includes:
            1. Main topic and key concepts
            2. Important definitions or explanations
            3. Key takeaways for learning
            4. Difficulty level assessment
            """

            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.3,
            )

            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI summary generation failed: {e}")
            return None

    def _generate_extractive_summary(self, content: str) -> str:
        """Generate extractive summary using key sentences."""
        try:
            sentences = content.split(".")
            if len(sentences) <= 2:
                return content

            # Simple extractive summary: first and last sentences
            summary_sentences = [sentences[0]]
            if len(sentences) > 1:
                summary_sentences.append(sentences[-1])

            return ". ".join(summary_sentences) + "."
        except Exception as e:
            print(f"Extractive summary failed: {e}")
            return content[:200] + "..." if len(content) > 200 else content

    def generate_quiz_questions(
        self, content: str, title: str = "", tier: str = "free"
    ) -> List[Dict]:
        """Generate quiz questions with caching and tier-based AI selection."""
        print(
            f"DEBUG: AI service manager generate_quiz_questions called with tier={tier}"
        )
        cache_key = self._get_cache_key("quiz", f"{title}:{content}")

        # Check cache
        cached = self._get_cached_result(cache_key)
        if cached is not None:
            print("DEBUG: Returning cached quiz questions")
            return cached["questions"]
        else:
            print("DEBUG: No cached quiz questions found")

        # Generate questions based on tier
        print(
            f"DEBUG: tier={tier}, openai_client={self.openai_client is not None}, content_length={len(content)}"
        )
        print(f"DEBUG: tier != 'free' = {tier != 'free'}")
        print(f"DEBUG: self.openai_client = {self.openai_client}")
        print(f"DEBUG: len(content) > 100 = {len(content) > 100}")
        if tier != "free" and self.openai_client and len(content) > 100:
            print("DEBUG: Attempting OpenAI quiz generation")
            questions = self._generate_questions_openai(content, title)
            if questions:
                print("DEBUG: OpenAI quiz generation successful")
                self._cache_result(cache_key, {"questions": questions})
                return questions
            else:
                print("DEBUG: OpenAI quiz generation failed, falling back to local")
        else:
            print("DEBUG: Using local quiz generation")

        # Fallback to local generation
        questions = self._generate_questions_local(content, title)
        self._cache_result(cache_key, {"questions": questions})
        return questions

    def generate_study_plan(
        self, content: str, title: str = "", tier: str = "free"
    ) -> str:
        """Generate study plan with OpenAI or fallback."""
        cache_key = self._get_cache_key("study_plan", f"{title}:{content}")

        # Check cache
        cached = self._get_cached_result(cache_key)
        if cached is not None:
            return cached["study_plan"]

        # Try OpenAI first for pro users
        if tier != "free" and self.openai_client and len(content) > 100:
            study_plan = self._generate_openai_study_plan(content, title)
            if study_plan:
                self._cache_result(cache_key, {"study_plan": study_plan})
                return study_plan

        # Fallback to local generation
        study_plan = self._generate_local_study_plan(content, title)
        self._cache_result(cache_key, {"study_plan": study_plan})
        return study_plan

    def _generate_openai_study_plan(self, content: str, title: str) -> Optional[str]:
        """Generate study plan using OpenAI."""
        try:
            prompt = f"""Create a comprehensive, step-by-step study plan for the following educational content.
            Design it as an expert study coach would for a student.
            
            Title: {title}
            Content: {content[:3000]}
            
            Create a study plan that includes:
            1. **Estimated Study Time** (realistic time allocation)
            2. **Prerequisites** (what should be known before studying this)
            3. **Learning Objectives** (what will be learned)
            4. **Step-by-Step Study Process**:
               - Initial review and overview
               - Deep reading and note-taking
               - Active learning exercises
               - Practice and application
               - Assessment and review
            5. **Study Techniques** (specific methods for this content)
            6. **Common Pitfalls** (what to avoid)
            7. **Success Metrics** (how to know you've learned it)
            8. **Follow-up Activities** (what to do next)
            
            Format the response in clear sections with markdown formatting.
            Make it practical and actionable for a student."""

            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.4,
            )

            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI study plan generation failed: {e}")
            return None

    def _generate_local_study_plan(self, content: str, title: str) -> str:
        """Generate basic study plan using local analysis."""
        word_count = len(content.split())
        estimated_time = "30-45 minutes" if word_count < 500 else "1-2 hours"

        plan = f"""# Study Plan for: {title}

## Estimated Study Time
{estimated_time}

## Learning Objectives
- Understand the main concepts presented
- Identify key terms and definitions
- Apply knowledge through practice

## Study Process
1. **Initial Review** (10-15 minutes)
   - Skim through the content
   - Identify main topics and subtopics
   - Note any unfamiliar terms

2. **Deep Reading** (20-30 minutes)
   - Read content thoroughly
   - Take notes on key points
   - Highlight important concepts

3. **Active Learning** (15-20 minutes)
   - Create flashcards for key terms
   - Write a summary in your own words
   - Generate practice questions

4. **Review and Assessment** (10-15 minutes)
   - Test your understanding
   - Review any unclear areas
   - Connect to previous knowledge

## Study Tips
- Take breaks every 30 minutes
- Use active recall techniques
- Practice explaining concepts to others
- Review within 24 hours for better retention

## Success Metrics
- Can explain main concepts in your own words
- Can identify and define key terms
- Can apply knowledge to new situations
"""
        return plan

    def _generate_questions_openai(
        self, content: str, title: str
    ) -> Optional[List[Dict]]:
        """Generate quiz questions using OpenAI GPT."""
        print("DEBUG: _generate_questions_openai called")
        try:
            prompt = f"""Generate 5 comprehensive quiz questions based on this educational content. 
            Create a mix of question types to test different levels of understanding.
            
            Return as JSON array with this exact format:
            [
                {{
                    "question": "Clear, specific question text",
                    "answer": "Detailed, accurate answer",
                    "type": "multiple_choice|short_answer|true_false|definition",
                    "difficulty": "easy|medium|hard",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "explanation": "Brief explanation of why this answer is correct"
                }}
            ]
            
            Guidelines:
            - Focus on key concepts, definitions, and important details
            - Include at least 2 multiple choice questions
            - Include at least 1 short answer question
            - Include at least 1 true/false question
            - Include at least 1 definition question
            - Ensure questions test different cognitive levels (recall, understanding, application)
            - Make sure all multiple choice options are plausible but only one is correct
            
            Content: {content[:3000]}
            Title: {title}"""

            print(
                f"DEBUG: About to call OpenAI API with client type: {type(self.openai_client)}"
            )
            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.7,
            )

            result = response.choices[0].message.content.strip()
            print(f"DEBUG: OpenAI response received: {result[:100]}...")

            # Try to parse JSON response
            try:
                questions = json.loads(result)
                if isinstance(questions, list):
                    print(
                        f"DEBUG: Successfully parsed {len(questions)} questions from JSON"
                    )
                    return questions[:5]  # Limit to 5 questions
            except json.JSONDecodeError as e:
                print(f"DEBUG: JSON parsing failed: {e}")
                # Fallback: parse manually if JSON fails
                parsed_questions = self._parse_questions_from_text(result)
                print(f"DEBUG: Parsed {len(parsed_questions)} questions from text")
                return parsed_questions

        except Exception as e:
            print(f"OpenAI quiz generation failed: {e}")
            print(f"DEBUG: Exception type: {type(e)}")
            print(f"DEBUG: Exception details: {str(e)}")
            import traceback

            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            return None

    def _parse_questions_from_text(self, text: str) -> List[Dict]:
        """Parse questions from OpenAI text response if JSON parsing fails."""
        questions = []
        lines = text.split("\n")
        current_question = {}

        for line in lines:
            line = line.strip()
            if line.startswith("Q:") or line.startswith("Question:"):
                if current_question:
                    questions.append(current_question)
                current_question = {"question": line.split(":", 1)[1].strip()}
            elif line.startswith("A:") or line.startswith("Answer:"):
                current_question["answer"] = line.split(":", 1)[1].strip()
                current_question["type"] = "short_answer"
                current_question["difficulty"] = "medium"

        if current_question:
            questions.append(current_question)

        return questions[:5]

    def _generate_questions_local(self, content: str, title: str) -> List[Dict]:
        """Generate quiz questions using local NLP."""
        questions = []

        try:
            # Extract key concepts
            keywords = self.extract_keywords(content)

            # Generate questions for each keyword
            for keyword in keywords[:3]:
                question = {
                    "question": f"What is {keyword}?",
                    "answer": f"Based on the content, {keyword} is discussed in the material.",
                    "type": "definition",
                    "difficulty": "medium",
                }
                questions.append(question)

        except Exception as e:
            print(f"Question generation failed: {e}")

        return questions[:3]

    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of all AI services."""
        status = {
            "cache": "healthy" if self.cache else "unavailable",
            "celery": "healthy" if self.celery_app else "unavailable",
            "openai": "healthy" if self.openai_client else "unavailable",
            "timestamp": datetime.now().isoformat(),
        }

        # Test cache connectivity
        if self.cache:
            try:
                self.cache.ping()
                status["cache"] = "healthy"
            except:
                status["cache"] = "error"

        return status


# Global instance
ai_service_manager = AIServiceManager()
