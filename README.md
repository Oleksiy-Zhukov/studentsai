# StudentsAI MVP

A clean, production-ready MVP of StudentsAI - an intelligent study companion that helps students learn faster and better using AI.

## 🚀 Features

### Core MVP Features
- **Note Management**: Create, edit, and delete notes with a clean markdown-style interface
- **AI-Powered Summarization**: Generate intelligent summaries of notes using OpenAI
- **Flashcard Generation**: Automatically create Q&A flashcards from note content
- **Interactive Note Graph**: Visualize connections between notes using D3.js
- **User Authentication**: Secure registration and login system
- **Rate Limiting**: Built-in API rate limiting to prevent abuse
- **Responsive Design**: Clean, modern UI that works on desktop and mobile

### Technical Features
- **FastAPI Backend**: High-performance Python backend with automatic API documentation
- **PostgreSQL Database**: Robust relational database with proper migrations
- **Next.js Frontend**: Modern React frontend with TypeScript and Tailwind CSS
- **Real-time Updates**: Live updates across the application
- **Security**: JWT authentication, input validation, and CORS protection

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection and models
│   ├── schemas.py           # Pydantic models for API validation
│   ├── auth.py              # Authentication and JWT handling
│   ├── rate_limiter.py      # Rate limiting implementation
│   └── ai_service.py        # OpenAI integration
├── alembic/                 # Database migrations
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

### Frontend (Next.js)
```
frontend/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── notes/          # Note management components
│   │   ├── flashcards/     # Flashcard viewer
│   │   ├── graph/          # D3.js graph visualization
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utilities and API client
│   └── styles/             # Global styles
├── package.json            # Node.js dependencies
└── tailwind.config.ts      # Tailwind CSS configuration
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key (optional for AI features)

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd studentsai-mvp/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL**
   ```bash
   # Create database and user
   sudo -u postgres psql -c "CREATE DATABASE studentsai_mvp;"
   sudo -u postgres psql -c "CREATE USER studentsai WITH PASSWORD 'password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE studentsai_mvp TO studentsai;"
   ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and OpenAI API key
   ```

6. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

7. **Start the backend server**
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd studentsai-mvp/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your backend URL
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://studentsai:password@localhost:5432/studentsai_mvp
OPENAI_API_KEY=your-openai-api-key-here
SECRET_KEY=your-secret-key-for-jwt
DEBUG=true
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 API Documentation

The backend provides automatic API documentation via FastAPI:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

#### Notes
- `GET /notes` - List user notes
- `POST /notes` - Create new note
- `GET /notes/{id}` - Get specific note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

#### AI Features
- `POST /notes/{id}/summary` - Generate AI summary
- `POST /notes/{id}/flashcards` - Generate flashcards
- `GET /notes/graph` - Get notes graph data

## 🎨 Design System

The frontend follows the StudentsAI design system with:

- **Colors**: Orange (#f97316) primary, Purple (#8b5cf6) secondary
- **Typography**: Inter font family for clean readability
- **Components**: Consistent button, input, and card designs
- **Layout**: Responsive grid system with mobile-first approach

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Pydantic schemas for API validation
- **Rate Limiting**: Per-user and per-IP rate limiting
- **CORS Protection**: Configurable cross-origin request handling
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**
   - Use a production WSGI server like Gunicorn
   - Set up PostgreSQL database
   - Configure environment variables
   - Set up reverse proxy (Nginx)

2. **Frontend Deployment**
   - Build the production bundle: `npm run build`
   - Deploy to Vercel, Netlify, or similar platform
   - Configure environment variables

### Docker Deployment (Optional)

Create `docker-compose.yml` for easy deployment:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: studentsai_mvp
      POSTGRES_USER: studentsai
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://studentsai:password@postgres:5432/studentsai_mvp

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance

- **Backend**: FastAPI provides high performance with automatic async support
- **Frontend**: Next.js optimizations including code splitting and image optimization
- **Database**: PostgreSQL with proper indexing for fast queries
- **Caching**: Redis can be added for session and API response caching

## 🔄 Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement backend API endpoints
   - Add frontend components
   - Test integration
   - Update documentation

2. **Code Quality**
   - Use TypeScript for type safety
   - Follow PEP 8 for Python code
   - Use Prettier for code formatting
   - Add unit tests for critical functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the code comments and docstrings
- Create an issue in the repository

---

**Built with ❤️ for students who want to learn smarter, not harder.**