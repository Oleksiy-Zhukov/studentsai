"""
Main FastAPI application for the Smart Study Flow feature.
Combines authentication, study routes, and database management.
"""

import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database_study import create_tables
from auth_routes_study import router as auth_router
from study_routes import router as study_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("🚀 Starting Smart Study Flow API...")
    create_tables()
    print("✅ Database tables created")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Smart Study Flow API...")

# Create FastAPI app
app = FastAPI(
    title="Smart Study Flow API",
    description="AI-powered study platform with knowledge graphs and adaptive learning",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(study_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Smart Study Flow API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "features": [
            "User Authentication",
            "Knowledge Nodes",
            "Knowledge Graph",
            "Study Sessions",
            "Progress Tracking",
            "AI Recommendations"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "smart-study-flow-api"
    }

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8001"))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    print(f"🌐 Server will run on http://{host}:{port}")
    print(f"🔧 Debug mode: {'On' if debug else 'Off'}")
    
    uvicorn.run(
        "main_study:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    ) 