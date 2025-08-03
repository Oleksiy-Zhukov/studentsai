import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const NoteEditor = ({ note, onNoteUpdate, onNoteCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Update local state when note prop changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setDifficulty(note.difficulty_level || 'beginner');
      setTags(note.tags || []);
      setIsEditing(false);
    } else {
      // Reset form for new note
      setTitle('');
      setContent('');
      setDifficulty('beginner');
      setTags([]);
      setIsEditing(true);
    }
  }, [note]);

  const handleSave = () => {
    if (!title.trim()) return;

    const updatedNote = {
      ...note,
      title: title.trim(),
      content: content.trim(),
      difficulty_level: difficulty,
      tags: tags
    };

    if (note?.id) {
      onNoteUpdate(updatedNote);
    } else {
      onNoteCreate(updatedNote);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setDifficulty(note.difficulty_level || 'beginner');
      setTags(note.tags || []);
      setIsEditing(false);
    } else {
      setTitle('');
      setContent('');
      setDifficulty('beginner');
      setTags([]);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  const renderMarkdownPreview = (text) => {
    // Simple markdown rendering (basic implementation)
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  if (!note && !isEditing) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Welcome to Smart Study Flow
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first note to start building your knowledge base. 
            Connect ideas, track your progress, and let AI guide your learning.
          </p>
          <Button onClick={() => setIsEditing(true)} className="japanese-button">
            Create Your First Note
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            {note?.id && (
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date(note.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="japanese-button"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="japanese-button"
              >
                Edit
              </Button>
            )}
          </div>
        </div>

        {isEditing ? (
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold mb-4"
            onKeyPress={handleKeyPress}
          />
        ) : (
          <h1 className="text-xl font-semibold text-foreground mb-4">
            {title || 'Untitled Note'}
          </h1>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {showPreview ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdownPreview(content || 'No content yet...') 
              }}
            />
          </div>
        ) : (
          <div className="flex-1 p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content
                  </label>
                  <Textarea
                    placeholder="Write your notes here... (Markdown supported)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] japanese-textarea"
                    onKeyPress={handleKeyPress}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use **bold**, *italic*, `code`, and line breaks for formatting
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Difficulty Level
                    </label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tags
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content
                  </label>
                  <div className="min-h-[400px] p-4 border rounded-md bg-muted/50">
                    {content ? (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: renderMarkdownPreview(content) 
                        }}
                      />
                    ) : (
                      <p className="text-muted-foreground">No content yet...</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Difficulty Level
                    </label>
                    <Badge 
                      variant={
                        difficulty === 'beginner' ? 'default' :
                        difficulty === 'intermediate' ? 'secondary' : 'destructive'
                      }
                    >
                      {difficulty}
                    </Badge>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tags
                    </label>
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No tags</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 