# Technical Implementation Guide - Smart Study Flow

## 🏗 **Database Schema Implementation**

### **1. Database Setup**

#### **PostgreSQL Schema**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    study_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge nodes (notes)
CREATE TABLE knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Connections between nodes
CREATE TABLE knowledge_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'related',
    strength INTEGER DEFAULT 1, -- 1-10 scale
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(source_node_id, target_node_id)
);

-- Study sessions
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    session_duration INTEGER, -- in minutes
    mastery_level INTEGER DEFAULT 0, -- 0-100
    session_data JSONB DEFAULT '{}',
    completed_at TIMESTAMP DEFAULT NOW()
);

-- Learning paths
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL, -- Array of step objects
    current_step INTEGER DEFAULT 0,
    progress FLOAT DEFAULT 0.0, -- 0.0 to 1.0
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_knowledge_nodes_user_id ON knowledge_nodes(user_id);
CREATE INDEX idx_knowledge_connections_source ON knowledge_connections(source_node_id);
CREATE INDEX idx_knowledge_connections_target ON knowledge_connections(target_node_id);
CREATE INDEX idx_study_sessions_user_node ON study_sessions(user_id, node_id);
CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
```

### **2. Backend Models (SQLAlchemy)**

#### **models.py**
```python
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    subscription_tier = Column(String(20), default='free')
    study_preferences = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    knowledge_nodes = relationship("KnowledgeNode", back_populates="user")
    study_sessions = relationship("StudySession", back_populates="user")
    learning_paths = relationship("LearningPath", back_populates="user")

class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    difficulty_level = Column(String(20), default='beginner')
    tags = Column(ARRAY(String), default=[])
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="knowledge_nodes")
    source_connections = relationship("KnowledgeConnection", foreign_keys="KnowledgeConnection.source_node_id")
    target_connections = relationship("KnowledgeConnection", foreign_keys="KnowledgeConnection.target_node_id")
    study_sessions = relationship("StudySession", back_populates="node")

class KnowledgeConnection(Base):
    __tablename__ = "knowledge_connections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False)
    target_node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False)
    relationship_type = Column(String(50), default='related')
    strength = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

class StudySession(Base):
    __tablename__ = "study_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False)
    session_duration = Column(Integer)  # in minutes
    mastery_level = Column(Integer, default=0)  # 0-100
    session_data = Column(JSON, default={})
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="study_sessions")
    node = relationship("KnowledgeNode", back_populates="study_sessions")

class LearningPath(Base):
    __tablename__ = "learning_paths"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    steps = Column(JSON, nullable=False)  # Array of step objects
    current_step = Column(Integer, default=0)
    progress = Column(Float, default=0.0)  # 0.0 to 1.0
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="learning_paths")
```

## 🔐 **Authentication System**

### **1. JWT Authentication**

#### **auth.py**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

### **2. User Management API**

#### **auth_routes.py**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta

from .database import get_db
from .models import User
from .auth import verify_password, get_password_hash, create_access_token, verify_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(password)
    user = User(email=email, password_hash=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "subscription_tier": user.subscription_tier
        }
    }

@router.post("/login")
async def login(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "subscription_tier": user.subscription_tier
        }
    }

@router.get("/me")
async def get_current_user(
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": str(user.id),
        "email": user.email,
        "subscription_tier": user.subscription_tier,
        "study_preferences": user.study_preferences
    }
```

## 🎨 **Frontend Dashboard Layout**

### **1. Main Dashboard Component**

#### **Dashboard.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { NoteEditor } from './NoteEditor';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ProgressPanel } from './ProgressPanel';
import { Header } from './Header';

export const Dashboard = () => {
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [graphVisible, setGraphVisible] = useState(true);
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleGraph={() => setGraphVisible(!graphVisible)}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          selectedNote={selectedNote}
          onNoteSelect={setSelectedNote}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Note Editor */}
          <div className="flex-1 flex flex-col">
            <NoteEditor 
              note={selectedNote}
              onNoteUpdate={(updatedNote) => {
                // Handle note update
              }}
            />
          </div>
          
          {/* Right Panel - Knowledge Graph & Progress */}
          {graphVisible && (
            <div className="w-80 flex flex-col border-l border-border">
              <KnowledgeGraph 
                selectedNote={selectedNote}
                onNodeSelect={(nodeId) => {
                  // Handle node selection
                }}
              />
              <ProgressPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### **2. Sidebar Component**

#### **Sidebar.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Search, Folder, FileText } from 'lucide-react';

export const Sidebar = ({ collapsed, selectedNote, onNoteSelect }) => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Fetch user's notes
    fetchNotes();
  }, []);
  
  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };
  
  return (
    <div className={`bg-card border-r border-border transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        {!collapsed && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-sm"
              />
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        )}
      </div>
      
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onNoteSelect(note)}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                selectedNote?.id === note.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{note.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### **3. Knowledge Graph Component**

#### **KnowledgeGraph.jsx**
```jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const KnowledgeGraph = ({ selectedNote, onNodeSelect }) => {
  const svgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  
  useEffect(() => {
    fetchGraphData();
  }, []);
  
  useEffect(() => {
    if (graphData.nodes.length > 0) {
      renderGraph();
    }
  }, [graphData]);
  
  const fetchGraphData = async () => {
    try {
      const response = await fetch('/api/graph', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setGraphData(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };
  
  const renderGraph = () => {
    const svg = d3.select(svgRef.current);
    const width = 320;
    const height = 400;
    
    // Clear previous graph
    svg.selectAll("*").remove();
    
    // Create simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force("link", d3.forceLink(graphData.links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));
    
    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));
    
    // Create nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter().append("circle")
      .attr("r", 5)
      .attr("fill", d => {
        if (selectedNote?.id === d.id) return "#d79921";
        return d.difficulty === "beginner" ? "#b8bb26" : 
               d.difficulty === "intermediate" ? "#fabd2f" : "#d3869b";
      })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("click", (event, d) => onNodeSelect(d.id));
    
    // Add labels
    const label = svg.append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .enter().append("text")
      .text(d => d.title)
      .attr("font-size", "10px")
      .attr("dx", 12)
      .attr("dy", ".35em");
    
    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      
      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };
  
  return (
    <div className="p-4 border-b border-border">
      <h3 className="text-lg font-semibold mb-4">Knowledge Graph</h3>
      <svg
        ref={svgRef}
        width="320"
        height="400"
        className="w-full h-80 border border-border rounded-md"
      />
    </div>
  );
};
```

## 📊 **Study Analytics**

### **1. Progress Tracking**

#### **ProgressPanel.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Target, BookOpen } from 'lucide-react';

export const ProgressPanel = () => {
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalStudyTime: 0,
    averageMastery: 0,
    studyStreak: 0
  });
  
  useEffect(() => {
    fetchProgressStats();
  }, []);
  
  const fetchProgressStats = async () => {
    try {
      const response = await fetch('/api/progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold">Progress</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Notes</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalNotes}</div>
        </div>
        
        <div className="bg-card p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Study Time</span>
          </div>
          <div className="text-2xl font-bold">{Math.round(stats.totalStudyTime / 60)}h</div>
        </div>
        
        <div className="bg-card p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Mastery</span>
          </div>
          <div className="text-2xl font-bold">{stats.averageMastery}%</div>
        </div>
        
        <div className="bg-card p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <div className="text-2xl font-bold">{stats.studyStreak} days</div>
        </div>
      </div>
      
      {/* Study Recommendations */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <h4 className="font-medium mb-3">Study Recommendations</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Review "Quantum Physics Basics" - due today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Continue "Advanced Calculus" learning path</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 🚀 **Next Implementation Steps**

1. **Set up database** with PostgreSQL and run migrations
2. **Implement authentication** system with JWT
3. **Create basic API endpoints** for notes and graph data
4. **Build dashboard layout** with sidebar and main content area
5. **Add note editor** with markdown support
6. **Implement knowledge graph** visualization with D3.js
7. **Add progress tracking** and analytics
8. **Integrate AI features** for smart suggestions
9. **Add export functionality**
10. **Polish UI/UX** and add animations

---

*This technical guide will be updated as implementation progresses.* 