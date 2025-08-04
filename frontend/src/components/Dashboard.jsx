import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from './Sidebar';
import { NoteEditor } from './NoteEditor';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ProgressPanel } from './ProgressPanel';
import { Header } from './Header';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../utils/api';

export const Dashboard = ({ onLogout, onNavigateToMain, onNavigateToProfile }) => {
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [graphVisible, setGraphVisible] = useState(true);
  const [graphExpanded, setGraphExpanded] = useState(false);
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
      setError(null);
      
      const response = await api.getNotes();
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteUpdate = async (updatedNote) => {
    try {
      const response = await api.updateNote(updatedNote.id, updatedNote);
      const data = await response.json();

      // Update local state
      setNotes(notes.map(note => 
        note.id === updatedNote.id ? data : note
      ));
      setSelectedNote(data);
    } catch (err) {
      console.error('Failed to update note:', err);
      setError(err.message);
    }
  };

  const handleNoteCreate = async (newNote) => {
    try {
      const response = await api.createNote(newNote);
      const createdNote = await response.json();
      
      setNotes([...notes, createdNote]);
      setSelectedNote(createdNote);
    } catch (err) {
      console.error('Failed to create note:', err);
      setError(err.message);
    }
  };

  const handleNodeSelect = (nodeId) => {
    const note = notes.find(n => n.id === nodeId);
    if (note) {
      setSelectedNote(note);
    }
  };

  const toggleGraphExpanded = () => {
    setGraphExpanded(!graphExpanded);
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

  // If graph is expanded, show full-screen graph view
  if (graphExpanded) {
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
        
        <div className="flex-1 relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleGraphExpanded}
              className="japanese-button"
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Full Screen
            </Button>
          </div>
          
          <div className="h-full w-full">
            <KnowledgeGraph 
              notes={notes}
              selectedNote={selectedNote}
              onNodeSelect={handleNodeSelect}
              isExpanded={true}
            />
          </div>
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
      
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Sidebar */}
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <Sidebar 
            collapsed={sidebarCollapsed}
            notes={notes}
            selectedNote={selectedNote}
            onNoteSelect={setSelectedNote}
            onNoteCreate={handleNoteCreate}
          />
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-1 bg-border hover:bg-foreground/20 transition-colors" />

        {/* Main Content Area */}
        <Panel defaultSize={graphVisible ? 60 : 80} minSize={40}>
          <div className="h-full flex flex-col">
            <NoteEditor 
              note={selectedNote}
              onNoteUpdate={handleNoteUpdate}
              onNoteCreate={handleNoteCreate}
            />
          </div>
        </Panel>

        {/* Right Panel - Graph and Progress */}
        {graphVisible && (
          <>
            <PanelResizeHandle className="w-1 bg-border hover:bg-foreground/20 transition-colors" />
            <Panel defaultSize={20} minSize={15} maxSize={40}>
              <div className="h-full flex flex-col">
                {/* Graph Header with Expand Button */}
                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
                  <h3 className="font-semibold japanese-text text-foreground">Knowledge Graph</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleGraphExpanded}
                    className="p-1 h-8 w-8"
                    title="Expand Graph"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Knowledge Graph */}
                <div className="flex-1 overflow-hidden">
                  <KnowledgeGraph 
                    notes={notes}
                    selectedNote={selectedNote}
                    onNodeSelect={handleNodeSelect}
                    isExpanded={false}
                  />
                </div>
                
                {/* Progress Panel */}
                <div className="border-t border-border">
                  <ProgressPanel />
                </div>
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}; 