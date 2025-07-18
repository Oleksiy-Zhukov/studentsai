# Student AI Toolkit - Architecture Documentation

## Overview

The Student AI Toolkit is designed as a modern, scalable web application with a clear separation of concerns between the frontend and backend. This document provides a comprehensive overview of the system architecture, design decisions, and implementation details.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│                 │◄──────────────────►│                 │
│  React Frontend │                    │ FastAPI Backend │
│                 │                    │                 │
└─────────────────┘                    └─────────────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │   AI Backends   │
                                       │                 │
                                       │ ┌─────────────┐ │
                                       │ │   OpenAI    │ │
                                       │ └─────────────┘ │
                                       │ ┌─────────────┐ │
                                       │ │ HuggingFace │ │
                                       │ └─────────────┘ │
                                       └─────────────────┘
```

### Component Breakdown

#### Frontend (React + Vite)
- **Technology Stack**: React 19, Vite, Tailwind CSS, shadcn/ui
- **Responsibilities**:
  - User interface and interaction
  - File upload handling
  - API communication
  - State management
  - Responsive design

#### Backend (FastAPI)
- **Technology Stack**: Python 3.11, FastAPI, Uvicorn
- **Responsibilities**:
  - API endpoint management
  - File processing and text extraction
  - AI backend orchestration
  - Request validation and error handling
  - CORS configuration

#### AI Backends
- **OpenAI Integration**: GPT-4-nano for production-quality responses
- **HuggingFace Integration**: Mock implementation with extensible architecture (In development)

## Folder Structure Analysis

### Backend Structure (`/backend`)

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration and environment management
├── models.py            # Pydantic data models and schemas
├── ai_backends.py       # AI backend implementations
├── file_processor.py    # File upload and text extraction
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not in repo)
```

**Key Files Explained:**

- **`main.py`**: The central FastAPI application that defines all API endpoints, middleware configuration, and server startup logic. It orchestrates the entire backend functionality.

- **`config.py`**: Centralized configuration management using environment variables. Handles API keys, backend selection, and application settings with validation.

- **`models.py`**: Pydantic models that define the data structures for API requests and responses. Ensures type safety and automatic validation.

- **`ai_backends.py`**: Abstract base class and concrete implementations for different AI providers. Designed for easy extension with new AI services.

- **`file_processor.py`**: Handles file upload, validation, and text extraction from various formats (PDF, DOCX, TXT).

### Frontend Structure (`/frontend/student-ai-toolkit-frontend`)

```
src/
├── components/
│   ├── Header.jsx           # Application header with branding
│   ├── Footer.jsx           # Footer with links and backend status
│   ├── FileUpload.jsx       # File upload and text input component
│   ├── ActionSelector.jsx   # AI action selection and processing
│   └── ResultDisplay.jsx    # AI result display with export options
├── App.jsx                  # Main application component
├── App.css                  # Custom styles and animations
├── main.jsx                 # React application entry point
└── index.css                # Global styles and Tailwind imports
```

**Component Architecture:**

- **`App.jsx`**: Root component that manages global state and coordinates between child components
- **`FileUpload.jsx`**: Handles both file uploads and direct text input with drag-and-drop support
- **`ActionSelector.jsx`**: Provides action selection UI and advanced options
- **ResultDisplay.jsx`**: Displays AI-generated results with copy/download functionality

## Data Flow

### 1. Content Input Flow

```
User Input → FileUpload Component → API Call → Backend Processing → Response
```

**Detailed Steps:**
1. User uploads file or enters text in `FileUpload.jsx`
2. File validation occurs on both frontend and backend
3. Text extraction happens in `file_processor.py`
4. Extracted content is stored in React state
5. UI updates to show content preview and enable actions

### 2. AI Processing Flow

```
Action Selection → API Request → Backend Routing → AI Backend → Response Processing → UI Update
```

**Detailed Steps:**
1. User selects action in `ActionSelector.jsx`
2. Frontend sends POST request to `/process` endpoint
3. Backend validates request using Pydantic models
4. Appropriate AI backend is called based on configuration
5. AI response is processed and formatted
6. Result is sent back to frontend and displayed in `ResultDisplay.jsx`

## API Design

### RESTful Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/` | API information | None | Basic API details |
| GET | `/health` | Health check | None | Backend status |
| GET | `/actions` | Available actions | None | List of AI actions |
| POST | `/upload` | File upload | Multipart form | Extracted text |
| POST | `/process` | AI processing | JSON with text/action | AI result |
| POST | `/process-file` | Upload + process | Multipart + form data | AI result |

### Request/Response Models

**ProcessRequest:**
```python
{
    "action": "summarize" | "generate_questions" | "plan_study",
    "text_content": "string",
    "additional_instructions": "string (optional)"
}
```

**ProcessResponse:**
```python
{
    "success": boolean,
    "result": "string",
    "error": "string (optional)",
    "action": "string",
    "backend_used": "openai" | "huggingface"
}
```

## AI Backend Architecture

### Abstract Base Class Design

The `AIBackend` abstract base class ensures consistent interface across different AI providers:

```python
class AIBackend(ABC):
    @abstractmethod
    def is_available(self) -> bool:
        """Check if backend is properly configured"""
        
    @abstractmethod
    def process_text(self, action, text, instructions) -> Tuple[bool, str, str]:
        """Process text and return (success, result, error)"""
```

### OpenAI Implementation

- Uses the official OpenAI Python SDK
- Implements GPT-3.5-turbo for cost-effective processing
- Includes custom system prompts for each action type
- Handles API errors gracefully

### HuggingFace Implementation

- Currently provides mock responses for demonstration
- Designed for easy integration with actual HuggingFace models
- Supports both Inference API and local model deployment
- Extensible for custom model implementations

## Frontend Architecture

### State Management

The application uses React's built-in state management with the following state structure:

```javascript
// App.jsx state
{
    uploadedContent: string,      // Extracted text content
    selectedAction: string,       // Current AI action
    result: object | null,        // AI processing result
    isLoading: boolean,          // Processing state
    error: string | null         // Error messages
}
```

### Component Communication

- **Props Down**: Parent components pass data and callbacks to children
- **Callbacks Up**: Child components communicate with parents via callback functions
- **No Global State**: Keeps the architecture simple and predictable

### UI/UX Design Patterns

1. **Progressive Disclosure**: Advanced options are hidden by default
2. **Immediate Feedback**: Loading states and success/error messages
3. **Accessibility**: Proper ARIA labels and keyboard navigation
4. **Mobile-First**: Responsive design with Tailwind CSS

## File Processing Pipeline

### Supported Formats

| Format | Library | Extraction Method |
|--------|---------|-------------------|
| PDF | PyPDF2 | Page-by-page text extraction |
| DOCX | python-docx | Paragraph-based extraction |
| TXT | Built-in | Direct file reading with encoding detection |

### Processing Steps

1. **Validation**: File type and size checking
2. **Upload**: Temporary file storage
3. **Extraction**: Format-specific text extraction
4. **Cleanup**: Temporary file removal
5. **Response**: Extracted text returned to frontend

## Security Considerations

### Input Validation

- **File Size Limits**: 10MB maximum to prevent abuse
- **File Type Restrictions**: Only PDF, TXT, and DOCX allowed
- **Content Sanitization**: Text content is processed safely
- **Request Validation**: Pydantic models ensure data integrity

### API Security

- **CORS Configuration**: Allows frontend access while maintaining security
- **Environment Variables**: Sensitive data stored securely
- **Error Handling**: Detailed errors in development, generic in production
- **Rate Limiting**: Can be added for production deployment

## Performance Considerations

### Frontend Optimization

- **Code Splitting**: Vite automatically splits code for optimal loading
- **Asset Optimization**: Images and static assets are optimized
- **Lazy Loading**: Components load only when needed
- **Caching**: Browser caching for static assets

### Backend Optimization

- **Async Processing**: FastAPI's async capabilities for concurrent requests
- **File Streaming**: Large files are processed in chunks
- **Memory Management**: Temporary files are cleaned up promptly
- **Connection Pooling**: HTTP clients reuse connections

## Deployment Architecture

### Development Environment

```
Frontend (Vite Dev Server) ←→ Backend (Uvicorn) ←→ AI APIs
```

### Production Environment

```
Frontend (Static Files) → CDN/Static Hosting
                         ↓
Backend (Container/Server) ←→ AI APIs
```

**Recommended Deployment:**
- **Frontend**: Vercel, Netlify, or similar static hosting
- **Backend**: Railway, Heroku, or containerized deployment
- **Environment**: Separate staging and production environments

## Extensibility Design

### Adding New AI Actions

1. **Backend**: Add to `ActionType` enum in `models.py`
2. **Backend**: Implement in AI backend classes
3. **Frontend**: Add to actions array in `ActionSelector.jsx`
4. **UI**: Update icons and descriptions

### Adding New File Types

1. **Backend**: Update `ALLOWED_EXTENSIONS` in `config.py`
2. **Backend**: Add extraction logic in `file_processor.py`
3. **Frontend**: Update file input accept attribute
4. **Testing**: Ensure proper handling of new format

### Adding New AI Backends

1. **Create**: New class inheriting from `AIBackend`
2. **Implement**: Required abstract methods
3. **Register**: Add to `get_ai_backend()` function
4. **Configure**: Add environment variables
5. **Test**: Ensure compatibility with existing actions

## Error Handling Strategy

### Frontend Error Handling

- **Network Errors**: Graceful degradation with retry options
- **Validation Errors**: Immediate user feedback
- **File Errors**: Clear error messages with suggestions
- **Loading States**: Visual feedback during processing

### Backend Error Handling

- **Input Validation**: Pydantic model validation
- **File Processing**: Detailed error messages for debugging
- **AI Backend Errors**: Fallback mechanisms and error reporting
- **HTTP Errors**: Appropriate status codes and messages

## Testing Strategy

### Manual Testing Checklist

1. **File Upload**: Test all supported formats and edge cases
2. **Text Input**: Test various content lengths and types
3. **AI Actions**: Verify all actions work with both backends
4. **Error Scenarios**: Test network failures and invalid inputs
5. **UI/UX**: Test responsive design and accessibility

### Automated Testing (Future)

- **Backend**: Unit tests for each component
- **Frontend**: Component testing with React Testing Library
- **Integration**: End-to-end testing with Playwright
- **API**: Automated API testing with pytest

## Monitoring and Observability

### Current Implementation

- **Health Endpoint**: Basic backend status checking
- **Console Logging**: Development debugging
- **Error Responses**: Structured error information

### Production Recommendations

- **Application Monitoring**: Sentry or similar service
- **Performance Monitoring**: New Relic or DataDog
- **Log Aggregation**: Centralized logging system
- **Metrics Collection**: Custom metrics for usage patterns

## Configuration Management

### Environment Variables

```env
# AI Configuration
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_TOKEN=hf_...
AI_BACKEND=openai #or huggingface

# Server Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000

# File Processing
MAX_FILE_SIZE=10485760  # 10MB
```

### Configuration Validation

The `config.py` module includes validation to ensure:
- Required API keys are present for selected backend
- Numeric values are properly typed
- Boolean flags are correctly parsed
- Default values are provided where appropriate

## Future Architecture Considerations

### Scalability Improvements

1. **Database Integration**: User accounts and content storage
2. **Caching Layer**: Redis for frequently accessed data
3. **Queue System**: Background processing for large files
4. **Microservices**: Split into specialized services

### Advanced Features

1. **Real-time Collaboration**: WebSocket integration
2. **Advanced Analytics**: User behavior tracking
3. **Content Versioning**: Track changes and history
4. **Multi-tenant Architecture**: Support for institutions

This architecture provides a solid foundation for the Student AI Toolkit while maintaining flexibility for future enhancements and scaling requirements.

