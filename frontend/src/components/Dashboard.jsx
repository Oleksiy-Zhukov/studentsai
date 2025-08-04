import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { NoteEditor } from './NoteEditor';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ProgressPanel } from './ProgressPanel';
import { Header } from './Header';

export const Dashboard = ({ onLogout, onNavigateToMain, onNavigateToProfile }) => {
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [graphVisible, setGraphVisible] = useState(true);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8001/api/v1/study/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteUpdate = async (updatedNote) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8001/api/v1/study/notes/${updatedNote.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      // Update local state
      setNotes(notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ));
      setSelectedNote(updatedNote);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNoteCreate = async (newNote) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8001/api/v1/study/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const createdNote = await response.json();
      setNotes([...notes, createdNote]);
      setSelectedNote(createdNote);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNodeSelect = (nodeId) => {
    const note = notes.find(n => n.id === nodeId);
    if (note) {
      setSelectedNote(note);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading your knowledge base...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchNotes}
            className="japanese-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleGraph={() => setGraphVisible(!graphVisible)}
        graphVisible={graphVisible}
        onLogout={onLogout}
        onNavigateToMain={onNavigateToMain}
        onNavigateToProfile={onNavigateToProfile}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          collapsed={sidebarCollapsed}
          notes={notes}
          selectedNote={selectedNote}
          onNoteSelect={setSelectedNote}
          onNoteCreate={handleNoteCreate}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <NoteEditor 
              note={selectedNote}
              onNoteUpdate={handleNoteUpdate}
              onNoteCreate={handleNoteCreate}
            />
          </div>
          
          {graphVisible && (
            <div className="w-80 flex flex-col border-l border-border">
              <KnowledgeGraph 
                notes={notes}
                selectedNote={selectedNote}
                onNodeSelect={handleNodeSelect}
              />
              <ProgressPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 