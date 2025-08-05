# 🐳 Docker Setup for StudentsAI Toolkit

This project now supports Docker for consistent development and deployment environments.

## 📋 Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Docker Compose (included with Docker Desktop)

## 🚀 Quick Start

### 1. Start All Services
```bash
./docker-start.sh
```

This will:
- Build all Docker images
- Start PostgreSQL database
- Start the backend API server
- Start the frontend development server

### 2. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **Database**: localhost:5432

## 🛠️ Docker Commands

### Using the Helper Script
```bash
# Start all services
./docker-start.sh start

# View logs
./docker-start.sh logs

# Stop all services
./docker-start.sh stop

# Reset database
./docker-start.sh reset

# Check service status
./docker-start.sh status

# Restart all services
./docker-start.sh restart
```

### Using Docker Compose Directly
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Reset everything (including database)
docker-compose down -v
docker-compose up --build -d
```

## 🏗️ Architecture

The Docker setup includes three main services:

### 1. PostgreSQL Database (`postgres`)
- **Image**: `postgres:15-alpine`
- **Port**: 5432
- **Database**: `studentsai`
- **Credentials**: `postgres/postgres123`

### 2. Backend API (`backend`)
- **Base**: Python 3.11
- **Port**: 8001
- **Features**: FastAPI, SQLAlchemy, AI services
- **Health Check**: `/health` endpoint

### 3. Frontend (`frontend`)
- **Base**: Node.js 18 with pnpm
- **Port**: 5173
- **Features**: React, Vite, Tailwind CSS
- **Hot Reload**: Enabled for development

## 🔧 Configuration

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `DEBUG`: Debug mode flag

#### Frontend
- `VITE_API_BASE_URL`: Backend API URL

### Database Initialization

The database is automatically initialized with:
- UUID extension
- Proper permissions
- UTC timezone

## 📊 Monitoring

### Health Checks
- **PostgreSQL**: `pg_isready` check
- **Backend**: HTTP health endpoint
- **Frontend**: Vite dev server

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## 🔄 Development Workflow

### 1. Code Changes
- Frontend changes are hot-reloaded automatically
- Backend changes require container restart
- Database changes require migration

### 2. Adding Dependencies
```bash
# Backend dependencies
docker-compose exec backend pip install new-package
# Update requirements.txt and rebuild

# Frontend dependencies
docker-compose exec frontend pnpm add new-package
# Update package.json and rebuild
```

### 3. Database Migrations
```bash
# Access database
docker-compose exec postgres psql -U postgres -d studentsai

# Reset database
./docker-start.sh reset
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :8001
lsof -i :5173
lsof -i :5432

# Stop conflicting services
docker-compose down
```

#### 2. Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Reset database
./docker-start.sh reset
```

#### 3. Build Failures
```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose up --build -d
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x docker-start.sh
```

### Debug Mode
```bash
# Enable debug logging
docker-compose down
DEBUG=true docker-compose up -d
```

## 🚀 Production Deployment

For production deployment:

1. **Update environment variables**
2. **Use production Docker images**
3. **Set up proper secrets management**
4. **Configure reverse proxy (nginx)**
5. **Set up SSL certificates**

## 📝 Notes

- The database data persists in a Docker volume
- Frontend uses Vite dev server (not production build)
- Backend runs in development mode
- All services are networked together
- Health checks ensure proper startup order

## 🤝 Contributing

When contributing to the Docker setup:

1. Test with `./docker-start.sh reset`
2. Verify all services start correctly
3. Check that the application works end-to-end
4. Update this documentation if needed 