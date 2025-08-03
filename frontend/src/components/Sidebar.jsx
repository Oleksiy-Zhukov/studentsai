import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

export const Sidebar = ({ 
  collapsed, 
  notes, 
  selectedNote, 
  onNoteSelect, 
  onNoteCreate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      onNoteCreate({
        title: newNoteTitle.trim(),
        content: '',
        difficulty_level: 'beginner',
        tags: []
      });
      setNewNoteTitle('');
      setShowCreateForm(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateNote();
    }
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateForm(true)}
          className="mb-4"
          title="Create new note"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
        
        <div className="flex-1 overflow-y-auto">
          {notes.slice(0, 5).map((note) => (
            <Button
              key={note.id}
              variant={selectedNote?.id === note.id ? "default" : "ghost"}
              size="sm"
              className="w-10 h-10 mb-2"
              onClick={() => onNoteSelect(note)}
              title={note.title}
            >
              <span className="text-xs font-mono">
                {note.title.charAt(0).toUpperCase()}
              </span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Notes</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="h-8 w-8 p-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
        
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />
        
        {showCreateForm && (
          <div className="space-y-2">
            <Input
              placeholder="Note title..."
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleCreateNote}
                disabled={!newNoteTitle.trim()}
              >
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewNoteTitle('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No notes found' : 'No notes yet'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className={`p-3 cursor-pointer transition-all hover:bg-accent ${
                  selectedNote?.id === note.id ? 'bg-accent border-foreground' : ''
                }`}
                onClick={() => onNoteSelect(note)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {note.title}
                    </h3>
                    {note.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {note.content}
                      </p>
                    )}
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        note.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                        note.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {note.difficulty_level}
                      </span>
                      {note.tags.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {note.tags.length} tag{note.tags.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}; 