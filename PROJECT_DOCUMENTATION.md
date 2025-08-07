# StudentsAI MVP - Project Documentation

## 📋 Project Overview

**StudentsAI MVP** is an intelligent study companion application designed to help students learn more effectively using artificial intelligence. The application combines note-taking capabilities with AI-powered features like summarization, flashcard generation, and visual note connections to create a comprehensive learning experience.

### 🎯 Project Goals
- Provide an intuitive note-taking interface for students
- Leverage AI to automatically generate study materials from notes
- Create visual connections between related notes to enhance understanding
- Offer a modern, responsive web application accessible on all devices
- Implement secure user authentication and data management

## 🏗️ System Architecture

### High-Level Architecture
The application follows a modern web application architecture with:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - React UI      │    │ - REST API      │    │ - User Data     │
│ - TypeScript    │    │ - Authentication│    │ - Notes         │
│ - Tailwind CSS  │    │ - AI Services   │    │ - Flashcards    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │                 │
                       │ - GPT-3.5-turbo │
                       │ - Text Analysis │
                       └─────────────────┘
```

### Technology Stack

#### Frontend (Next.js 15.4.6)
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: React hooks
- **Data Visualization**: D3.js for note graphs
- **Icons**: Lucide React

#### Backend (FastAPI)
- **Framework**: FastAPI 0.104.1
- **Language**: Python 3.11+
- **Database ORM**: SQLAlchemy 2.0.23
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt
- **API Documentation**: Automatic OpenAPI/Swagger
- **Rate Limiting**: Custom implementation with Redis support

#### Database
- **Primary Database**: PostgreSQL 14+
- **Migrations**: Alembic
- **Connection Pooling**: SQLAlchemy

#### AI Services
- **Provider**: OpenAI API
- **Model**: GPT-3.5-turbo
- **Features**: Text summarization, flashcard generation, similarity analysis

## 🚀 Core Features

### 1. User Authentication
- **Registration**: Email-based user registration with password validation
- **Login**: Secure JWT-based authentication
- **Session Management**: Persistent login sessions with localStorage
- **Security**: Password hashing with bcrypt, rate limiting on auth endpoints

### 2. Note Management
- **CRUD Operations**: Create, read, update, and delete notes
- **Rich Text Editing**: Markdown-style note editor
- **Organization**: Notes are associated with authenticated users
- **Search**: Basic text search functionality
- **Real-time Updates**: Immediate UI updates after operations

### 3. AI-Powered Summarization
- **Automatic Summaries**: Generate concise summaries of note content
- **OpenAI Integration**: Uses GPT-3.5-turbo for intelligent text processing
- **Context-Aware**: Maintains academic focus in summaries
- **Rate Limited**: Prevents API abuse with per-user limits

### 4. Flashcard Generation
- **Automatic Creation**: Generate Q&A flashcards from note content
- **Customizable Count**: Configurable number of flashcards per note
- **Educational Focus**: Questions target key concepts and definitions
- **JSON Response**: Structured data format for reliable parsing

### 5. Interactive Note Graph
- **Visual Connections**: D3.js-powered graph visualization
- **Similarity Analysis**: TF-IDF and cosine similarity for note relationships
- **Interactive Nodes**: Click to navigate between related notes
- **Dynamic Layout**: Force-directed graph layout

### 6. Rate Limiting & Security
- **Multi-level Protection**: Per-user, per-IP, and per-endpoint limits
- **AI Service Limits**: Separate rate limiting for OpenAI API calls
- **Authentication Limits**: Protection against brute force attacks
- **Redis Integration**: Scalable rate limiting storage (optional)

## 📁 Project Structure

### Backend Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application and routes
│   ├── config.py            # Configuration management
│   ├── database.py          # Database models and connections
│   ├── schemas.py           # Pydantic data models
│   ├── auth.py              # Authentication logic
│   ├── rate_limiter.py      # Rate limiting implementation
│   └── ai_service.py        # OpenAI integration
├── alembic/                 # Database migrations
│   ├── env.py
│   └── versions/
├── requirements.txt         # Python dependencies
└── tests/                   # Test files
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout component
│   │   ├── page.tsx         # Main application page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── auth/            # Authentication components
│   │   ├── notes/           # Note management components
│   │   ├── flashcards/      # Flashcard viewer
│   │   ├── graph/           # D3.js graph components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Reusable UI components
│   ├── lib/
│   │   ├── api.ts           # API client functions
│   │   └── utils.ts         # Utility functions
│   └── hooks/
│       └── use-toast.ts     # Toast notification hook
├── public/                  # Static assets
├── package.json             # Node.js dependencies
└── tailwind.config.ts       # Tailwind configuration
```

## 🔧 Key Components

### Backend Components

#### 1. FastAPI Application (`main.py`)
- **Entry Point**: Main application with all API endpoints
- **Middleware**: CORS, exception handling, rate limiting
- **Routes**: Authentication, notes, AI services, graph data
- **Documentation**: Automatic OpenAPI/Swagger generation

#### 2. Database Models (`database.py`)
- **User Model**: User authentication and profile data
- **Note Model**: Note content, metadata, and relationships
- **Flashcard Model**: Generated flashcards linked to notes
- **Migrations**: Alembic for database schema management

#### 3. AI Service (`ai_service.py`)
- **OpenAI Client**: Integration with GPT-3.5-turbo
- **Text Processing**: Summarization and flashcard generation
- **Similarity Analysis**: TF-IDF vectorization and cosine similarity
- **Error Handling**: Robust error handling for API failures

#### 4. Authentication (`auth.py`)
- **JWT Management**: Token creation and validation
- **Password Security**: bcrypt hashing and verification
- **User Management**: Registration and login logic
- **Session Handling**: Token-based session management

### Frontend Components

#### 1. Main Application (`page.tsx`)
- **State Management**: User authentication, notes, current view
- **Navigation**: Tab-based interface for different features
- **Data Loading**: API integration and error handling
- **Responsive Design**: Mobile-first approach

#### 2. Note Editor (`NoteEditor.tsx`)
- **Rich Text Editing**: Markdown-style note creation
- **Auto-save**: Automatic saving of note changes
- **AI Integration**: Buttons for summarization and flashcard generation
- **Real-time Updates**: Immediate UI feedback

#### 3. Notes Graph (`NotesGraph.tsx`)
- **D3.js Integration**: Force-directed graph visualization
- **Interactive Nodes**: Clickable note nodes with hover effects
- **Dynamic Layout**: Responsive graph that adapts to screen size
- **Data Visualization**: Visual representation of note relationships

#### 4. Flashcard Viewer (`FlashcardViewer.tsx`)
- **Card Interface**: Flip animation for question/answer display
- **Navigation**: Previous/next card controls
- **Progress Tracking**: Visual progress indicator
- **Study Mode**: Optimized for active recall practice

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user information

### Notes Endpoints
- `GET /notes` - List user's notes with pagination
- `POST /notes` - Create a new note
- `GET /notes/{id}` - Get specific note details
- `PUT /notes/{id}` - Update existing note
- `DELETE /notes/{id}` - Delete a note

### AI Service Endpoints
- `POST /ai/summarize` - Generate text summary
- `POST /ai/flashcards` - Generate flashcards from text
- `POST /notes/{id}/summarize` - Summarize specific note
- `POST /notes/{id}/flashcards/generate` - Generate flashcards for note
- `GET /notes/{id}/flashcards` - Get flashcards for note

### Graph Endpoints
- `GET /graph` - Get note relationship graph data

## 🎨 User Interface Design

### Design System
- **Color Palette**: Orange primary (#f97316), Purple secondary (#8b5cf6)
- **Typography**: Inter font family for clean readability
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable UI components with consistent styling

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Intuitive Navigation**: Tab-based interface for easy feature access
- **Real-time Feedback**: Immediate visual feedback for user actions
- **Error Handling**: User-friendly error messages and recovery options

### Key UI Features
- **Tabbed Interface**: Notes, Editor, Flashcards, and Graph views
- **Search Functionality**: Filter notes by content
- **Loading States**: Visual indicators for async operations
- **Toast Notifications**: Success and error message display

## 🔒 Security Implementation

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt for password storage
- **Token Expiration**: Configurable token lifetime
- **Secure Storage**: Client-side token storage in localStorage

### API Security
- **Input Validation**: Pydantic schemas for request validation
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **CORS Protection**: Configurable cross-origin request handling
- **Rate Limiting**: Protection against API abuse

### Data Protection
- **User Isolation**: Notes are strictly associated with authenticated users
- **Data Validation**: Server-side validation of all user inputs
- **Error Handling**: Secure error messages that don't expose system details

## 🚀 Performance Considerations

### Backend Performance
- **Async Operations**: FastAPI's async support for concurrent requests
- **Database Optimization**: Proper indexing and query optimization
- **Caching**: Redis integration for session and API response caching
- **Connection Pooling**: Efficient database connection management

### Frontend Performance
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Built-in image optimization
- **Bundle Optimization**: Efficient JavaScript bundling
- **Lazy Loading**: Components loaded on demand

### AI Service Performance
- **Rate Limiting**: Prevents OpenAI API quota exhaustion
- **Error Handling**: Graceful degradation when AI services are unavailable
- **Caching**: Cache AI-generated content to reduce API calls
- **Async Processing**: Non-blocking AI operations

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API endpoint testing with pytest
- **Database Tests**: Migration and model testing
- **AI Service Tests**: Mock OpenAI API responses

### Frontend Testing
- **Component Tests**: React component testing
- **Integration Tests**: User workflow testing
- **E2E Tests**: Full application testing
- **Accessibility Tests**: WCAG compliance testing

## 📊 Data Models

### User Model
```python
class User(Base):
    id: UUID (Primary Key)
    email: String (Unique)
    hashed_password: String
    created_at: DateTime
    updated_at: DateTime
```

### Note Model
```python
class Note(Base):
    id: UUID (Primary Key)
    user_id: UUID (Foreign Key)
    title: String
    content: Text
    summary: Text (Optional)
    created_at: DateTime
    updated_at: DateTime
```

### Flashcard Model
```python
class Flashcard(Base):
    id: UUID (Primary Key)
    note_id: UUID (Foreign Key)
    question: String
    answer: String
    created_at: DateTime
```

## 🔄 Development Workflow

### Local Development Setup
1. **Backend Setup**: Python virtual environment, PostgreSQL, environment variables
2. **Frontend Setup**: Node.js dependencies, environment configuration
3. **Database Setup**: Alembic migrations, initial data seeding
4. **AI Service Setup**: OpenAI API key configuration

### Development Process
1. **Feature Development**: Branch-based development with feature branches
2. **Code Review**: Pull request reviews for quality assurance
3. **Testing**: Automated testing before deployment
4. **Documentation**: Code comments and API documentation updates

### Deployment Process
1. **Environment Setup**: Production environment configuration
2. **Database Migration**: Safe migration deployment
3. **Application Deployment**: Backend and frontend deployment
4. **Monitoring**: Application health and performance monitoring

## 🎯 Future Enhancements

### Planned Features
- **Collaborative Notes**: Multi-user note sharing and editing
- **Advanced AI**: More sophisticated AI models and features
- **Mobile App**: Native mobile application
- **Offline Support**: Offline note editing and sync
- **Advanced Analytics**: Learning progress tracking and insights

### Technical Improvements
- **Microservices**: Service-oriented architecture
- **Real-time Features**: WebSocket integration for live collaboration
- **Advanced Caching**: Redis for improved performance
- **Containerization**: Docker deployment for scalability

## 📚 Learning Resources

### For Developers
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Next.js Documentation**: https://nextjs.org/docs
- **OpenAI API Documentation**: https://platform.openai.com/docs
- **D3.js Documentation**: https://d3js.org/

### For Users
- **User Guide**: In-app help and tutorials
- **API Documentation**: Interactive Swagger UI at `/docs`
- **Support**: Issue tracking and user support channels

---

**StudentsAI MVP** represents a modern approach to educational technology, combining the power of artificial intelligence with intuitive user interfaces to create an effective learning companion for students. The application demonstrates best practices in full-stack development, security, and user experience design while providing valuable educational tools powered by cutting-edge AI technology.
