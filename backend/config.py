"""
Configuration module for the Student AI Toolkit backend.
Handles environment variables and application settings.
"""

import os
from dotenv import load_dotenv
from typing import Literal, Tuple

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
    PORT: int = int(os.getenv("PORT", "8001"))

    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./studentsai.db")

    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))

    # JWT Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )

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

    @classmethod
    def validate_config_with_warnings(cls) -> Tuple[bool, list]:
        """Validate configuration and return warnings for missing optional components."""
        warnings = []
        critical_missing = False

        if cls.AI_BACKEND == "openai" and not cls.OPENAI_API_KEY:
            if cls.DEBUG:
                warnings.append("OpenAI API key missing - AI features will be limited")
            else:
                critical_missing = True

        if cls.AI_BACKEND == "huggingface" and not cls.HUGGINGFACE_API_TOKEN:
            if cls.DEBUG:
                warnings.append(
                    "HuggingFace API token missing - AI features will be limited"
                )
            else:
                critical_missing = True

        return not critical_missing, warnings


# Create global config instance
config = Config()
