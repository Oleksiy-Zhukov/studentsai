"""
Configuration management for StudentsAI MVP
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Database
    database_url: str = "postgresql://localhost:5432/studentsai_mvp"
    
    # OpenAI
    openai_api_key: str
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Application
    environment: str = "development"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # seconds
    
    # Redis (optional)
    redis_url: str = "redis://localhost:6379/0"
    
    # CORS
    allowed_origins: str = "http://localhost:3000,http://localhost:3001"
    
    @validator('allowed_origins', pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return v
        return v
    
    @validator('database_url', pre=True)
    def validate_database_url(cls, v):
        if not v:
            raise ValueError("DATABASE_URL is required")
        return v
    
    @validator('openai_api_key', pre=True)
    def validate_openai_key(cls, v):
        if not v:
            raise ValueError("OPENAI_API_KEY is required")
        return v
    
    @validator('secret_key', pre=True)
    def validate_secret_key(cls, v):
        if not v:
            raise ValueError("SECRET_KEY is required")
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

# Database URL for SQLAlchemy
DATABASE_URL = settings.database_url

# OpenAI configuration
OPENAI_API_KEY = settings.openai_api_key

# Security configuration
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

# Application configuration
ENVIRONMENT = settings.environment
DEBUG = settings.debug
HOST = settings.host
PORT = settings.port

# Rate limiting configuration
RATE_LIMIT_REQUESTS = settings.rate_limit_requests
RATE_LIMIT_WINDOW = settings.rate_limit_window

# Redis configuration
REDIS_URL = settings.redis_url

# CORS configuration
ALLOWED_ORIGINS = [origin.strip() for origin in settings.allowed_origins.split(',')]

