"""
Main FastAPI application for the Student AI Toolkit backend.
Provides REST API endpoints for file upload and AI processing.
"""

import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from config import config
from models import (
    ProcessRequest,
    ProcessResponse,
    FileUploadResponse,
    HealthResponse,
    ActionType,
)
from file_processor import FileProcessor
from ai_backends import get_ai_backend

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["2/hour"])

# Initialize FastAPI app
app = FastAPI(
    title="Student AI Toolkit API",
    description="Backend API for the Student AI Toolkit - providing AI-powered study assistance",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add middleware for rate limiting and CORS
# IMPORTANT: The SlowAPIMiddleware must be added before the CORS middleware
# for the rate limiter to function correctly with cross-origin requests.
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach limiter to app state
app.state.limiter = limiter


# Custom rate limit exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """
    Custom handler for when a rate limit is exceeded.
    Returns a JSON response with a 429 status code.
    """
    return JSONResponse(
        status_code=429,
        content={"error": f"Rate limit exceeded: {exc.detail}"},
    )


# Initialize processors
file_processor = FileProcessor()
ai_backend = get_ai_backend()


@app.get("/", response_model=dict, include_in_schema=False)
async def root():
    """
    Root endpoint providing basic API information.
    """
    return {
        "message": "Welcome to the Student AI Toolkit API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check_url": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["Status"])
async def health_check():
    """
    Performs a health check of the API and its backend services.
    """
    backend_available = ai_backend.is_available()
    return HealthResponse(
        status="healthy" if backend_available else "degraded",
        backend=config.AI_BACKEND,
        backend_available=backend_available,
    )


@app.post("/upload", response_model=FileUploadResponse, tags=["File Handling"])
async def upload_file(file: UploadFile = File(...)):
    """
    Handles file uploads, validates them, and extracts text content.
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file name provided.")

        if not file_processor.is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Supported types are: {', '.join(config.ALLOWED_EXTENSIONS)}",
            )

        file_content = await file.read()
        if len(file_content) > config.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File is too large. Maximum size is {config.MAX_FILE_SIZE / (1024 * 1024):.1f}MB.",
            )

        success, file_path, error = file_processor.save_uploaded_file(
            file_content, file.filename
        )
        if not success or not file_path:
            raise HTTPException(status_code=500, detail=error)

        # Extract text from the saved file
        success, text_content, error = file_processor.extract_text_from_file(file_path)

        # Clean up the temporary file
        try:
            os.remove(file_path)
        except OSError as e:
            # Log this error but don't fail the request
            print(f"Warning: Could not remove temporary file {file_path}: {e}")

        if not success:
            raise HTTPException(status_code=422, detail=error)

        return FileUploadResponse(
            success=True, filename=file.filename, content=text_content, error=None
        )

    except HTTPException:
        raise
    except Exception as e:
        # Log the full exception for debugging
        print(f"An unexpected error occurred during file upload: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during upload: {str(e)}",
        )


@app.post("/process", response_model=ProcessResponse, tags=["AI Processing"])
@limiter.limit("2/hour")
async def process_content(request: Request, data: ProcessRequest):
    """
    Processes raw text content with the AI backend.
    This endpoint is rate-limited.
    """
    try:
        if not data.text_content or not data.text_content.strip():
            raise HTTPException(
                status_code=400, detail="No text content provided for processing."
            )

        if not ai_backend.is_available():
            raise HTTPException(
                status_code=503,
                detail=f"The AI backend ({config.AI_BACKEND}) is currently unavailable. Please try again later.",
            )

        success, result, error = ai_backend.process_text(
            action=data.action,
            text=data.text_content,
            additional_instructions=data.additional_instructions,
        )

        if not success:
            raise HTTPException(status_code=500, detail=error)

        return ProcessResponse(
            success=True,
            result=result,
            error=None,
            action=data.action,
            backend_used=config.AI_BACKEND,
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"An unexpected error occurred during content processing: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during processing: {str(e)}",
        )


@app.post("/process-file", response_model=ProcessResponse, tags=["AI Processing"])
@limiter.limit("2/hour")
async def process_file(
    request: Request,  # FIX: Added the Request object for the limiter
    file: UploadFile = File(...),
    action: ActionType = Form(...),
    additional_instructions: Optional[str] = Form(None),
):
    """
    Uploads a file and immediately processes its content with the AI backend.
    This endpoint is rate-limited.
    """
    try:
        # Step 1: Upload and extract text from the file
        upload_response = await upload_file(file)
        if not upload_response.success or not upload_response.content:
            # upload_file raises HTTPException, but we handle this for robustness
            raise HTTPException(
                status_code=422,
                detail=upload_response.error or "Failed to extract content from file.",
            )

        # Step 2: Create a request model for the processing step
        process_data = ProcessRequest(
            action=action,
            text_content=upload_response.content,
            additional_instructions=additional_instructions,
        )

        # Step 3: Call the text processing endpoint
        # We pass the original request object to maintain the client's identity for rate limiting
        return await process_content(request, process_data)

    except HTTPException:
        raise
    except Exception as e:
        print(f"An unexpected error occurred during file processing: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during file processing: {str(e)}",
        )


@app.get("/actions", response_model=dict, tags=["Configuration"])
async def get_available_actions():
    """
    Returns a list of available AI actions that the backend can perform.
    """
    return {
        "actions": [
            {
                "id": ActionType.SUMMARIZE.value,
                "name": "Summarize",
                "description": "Create a concise summary of the provided text content.",
            },
            {
                "id": ActionType.GENERATE_QUESTIONS.value,
                "name": "Generate Questions",
                "description": "Generate potential study questions based on the text.",
            },
            {
                "id": ActionType.PLAN_STUDY.value,
                "name": "Plan Study",
                "description": "Create a structured study plan from the content.",
            },
        ]
    }


if __name__ == "__main__":
    if not config.validate_config():
        print("❌ Configuration validation failed!")
        print(f"   Current AI Backend: {config.AI_BACKEND}")
        if config.AI_BACKEND == "openai" and not config.OPENAI_API_KEY:
            print(
                "   Error: OpenAI API key is required but not found in environment variables (OPENAI_API_KEY)."
            )
        elif config.AI_BACKEND == "huggingface" and not config.HUGGINGFACE_API_TOKEN:
            print(
                "   Error: HuggingFace API token is required but not found in environment variables (HUGGINGFACE_API_TOKEN)."
            )
        exit(1)

    print("🚀 Starting Student AI Toolkit API...")
    print(f"   - AI Backend: {config.AI_BACKEND}")
    print(f"   - Server URL: http://{config.HOST}:{config.PORT}")
    print(f"   - API Docs: http://{config.HOST}:{config.PORT}/docs")
    print(f"   - Debug Mode: {'On' if config.DEBUG else 'Off'}")

    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG,
        log_level="info",
    )
