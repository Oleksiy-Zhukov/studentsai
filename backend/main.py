"""
StudentsAI - Unified FastAPI Application
A clean, efficient AI-powered study platform with knowledge graphs and adaptive learning.
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Core imports
from config import config
from models import Base
from database import engine, get_db
from auth import router as auth_router
from study_routes import router as study_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("🚀 Starting StudentsAI API...")

    # Create database tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

    # Validate configuration
    if not config.OPENAI_API_KEY:
        print("⚠️  OpenAI API key not found (falling back to local models)")
    else:
        print("✅ OpenAI API key configured")

    print(f"🌐 Server: http://{config.HOST}:{config.PORT}")
    print(f"📚 API Docs: http://{config.HOST}:{config.PORT}/docs")

    yield

    # Shutdown
    print("🛑 Shutting down StudentsAI API...")


# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/hour"])

# Create FastAPI app
app = FastAPI(
    title="StudentsAI",
    description="AI-powered study platform with knowledge graphs and adaptive learning",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Attach limiter to app state
app.state.limiter = limiter

# Add middleware - ORDER MATTERS!
# 1. CORS middleware (must be first)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Rate limiting middleware (after CORS)
app.add_middleware(SlowAPIMiddleware)


# Rate limit exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "retry_after": exc.retry_after,
            "detail": "Too many requests. Please try again later.",
        },
    )


# Root endpoint
@app.get("/", tags=["Status"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "StudentsAI API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


# Health check
@app.get("/health", tags=["Status"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "2.0.0", "database": "connected"}


# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(study_router, prefix="/api/v1/study", tags=["Study"])


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if config.DEBUG else "An unexpected error occurred",
        },
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG,
        log_level="info",
    )
