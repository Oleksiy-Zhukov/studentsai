"""
Configuration module for the Student AI Toolkit backend.
Handles environment variables and application settings.
"""

import os
from dotenv import load_dotenv
from typing import Literal

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration class."""

    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_API_BASE: str = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")

    # HuggingFace Configuration
    HUGGINGFACE_API_TOKEN: str = os.getenv("HUGGINGFACE_API_TOKEN", "")

    # Backend Configuration
    AI_BACKEND: Literal["openai", "huggingface"] = os.getenv("AI_BACKEND", "openai")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    # reCAPTCHA Configuration
    RECAPTCHA_SITE_KEY: str = os.getenv("RECAPTCHA_SITE_KEY", "")
    RECAPTCHA_SECRET_KEY: str = os.getenv("RECAPTCHA_SECRET_KEY", "")

    # File Upload Configuration
    UPLOAD_FOLDER: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".pdf", ".txt", ".docx"}

    @classmethod
    def validate_config(cls) -> bool:
        """Validate that required configuration is present."""
        if cls.AI_BACKEND == "openai" and not cls.OPENAI_API_KEY:
            return False
        if cls.AI_BACKEND == "huggingface" and not cls.HUGGINGFACE_API_TOKEN:
            return False
        return True


# Create global config instance
config = Config()
