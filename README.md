# StudentsAI - Smart Study Flow

An AI-powered study platform with knowledge graphs and adaptive learning. Transform your learning experience with intelligent note-taking, progress tracking, and personalized study recommendations.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (for PostgreSQL)
- Python 3.11+
- Node.js 18+

### 1. Start PostgreSQL Database
```bash
# Start Docker Desktop first, then run:
./setup_postgres.sh
```

### 2. Backend Setup
```bash
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
python main_study.py
```
Backend will run on `http://localhost:8001`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

## 🧠 Smart Study Flow Features

### Core Features
- **Knowledge Graph**: Visualize connections between your notes
- **AI-Powered Recommendations**: Get personalized study suggestions
- **Progress Tracking**: Monitor your learning journey
- **Markdown Editor**: Rich text editing with real-time preview
- **Export Functionality**: Export your knowledge base

### Authentication
- **User Registration**: Create your account
- **Secure Login**: JWT-based authentication
- **Demo Account**: Try the features without registration

### Study Tools
- **Note Creation**: Create and organize knowledge nodes
- **Difficulty Levels**: Tag notes by complexity
- **Study Sessions**: Track time spent on each topic
- **Mastery Tracking**: Monitor your progress (0-100%)

## 🏗️ Architecture

### Backend (FastAPI + PostgreSQL)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API**: RESTful endpoints with automatic documentation
- **Security**: CORS, rate limiting, input validation

### Frontend (React 19 + Vite)
- **UI Framework**: shadcn/ui components
- **Styling**: Tailwind CSS 4 with Japanese-inspired design
- **State Management**: React hooks with localStorage persistence
- **Animations**: Framer Motion for smooth interactions

### Database Schema
```sql
-- Users, Knowledge Nodes, Connections, Study Sessions, Learning Paths
-- Full UUID support with proper foreign key relationships
-- JSON fields for flexible metadata storage
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Study Flow
- `GET /api/v1/study/notes` - Get user's notes
- `POST /api/v1/study/notes` - Create new note
- `PUT /api/v1/study/notes/{id}` - Update note
- `DELETE /api/v1/study/notes/{id}` - Delete note
- `GET /api/v1/study/graph` - Get knowledge graph data
- `GET /api/v1/study/progress` - Get progress statistics
- `GET /api/v1/study/recommendations` - Get AI recommendations

## 🎨 UI/UX Design

### Design Principles
- **Japanese-inspired**: Clean, minimal aesthetic
- **Progressive Disclosure**: Information revealed as needed
- **Responsive**: Works on desktop and mobile
- **Dark Mode**: Full theme support

### Key Components
- **Auth Page**: Login/register with demo account option
- **Dashboard**: Main study interface with sidebar navigation
- **Note Editor**: Markdown editor with live preview
- **Knowledge Graph**: D3.js visualization
- **Progress Panel**: Statistics and recommendations

## 🔧 Development

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://postgres:password@localhost:5432/studentsai_study
JWT_SECRET_KEY=your-secret-key
HOST=0.0.0.0
PORT=8001
DEBUG=false

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8001
```

### Database Setup
```bash
# Using Docker Compose
docker-compose up -d postgres

# Or manual setup
./setup_postgres.sh
```

## 📈 Roadmap

### Phase 1 (Current)
- ✅ User authentication
- ✅ Basic note creation
- ✅ Knowledge graph visualization
- ✅ Progress tracking

### Phase 2 (Next)
- 🔄 Advanced graph algorithms
- 🔄 AI-powered study paths
- 🔄 Export functionality
- 🔄 Mobile optimization

### Phase 3 (Future)
- 📋 Collaborative features
- 📋 Advanced analytics
- 📋 Integration with external tools
- 📋 Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Visit `/docs` on the backend for API docs
- **Issues**: Report bugs on GitHub
- **Discussions**: Join the community

---

**Built with ❤️ for students worldwide**