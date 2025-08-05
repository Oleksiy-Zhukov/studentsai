import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Brain, Link, Target, Sparkles, Zap, ChevronDown, ChevronUp, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

export const NoteEditor = ({ note, onNoteUpdate, onNoteCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    connections: true,
    quiz: true,
    study_plan: true,
    analysis: false
  });

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

  const getAISuggestions = async () => {
    if (!note?.id) return;
    
    setIsLoadingAI(true);
    try {
      const suggestions = await api.getNoteSuggestions(note.id);
      setAiSuggestions(suggestions);
      setShowAIPanel(true);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const createAIConnections = async () => {
    if (!note?.id) return;
    
    setIsLoadingAI(true);
    try {
      const result = await api.createAIConnections(note.id);
      console.log('AI connections created:', result);
      // Refresh the note to get updated data
      if (onNoteUpdate) {
        onNoteUpdate({ ...note, connections_updated: true });
      }
      // Refresh AI suggestions to show updated connections
      await getAISuggestions();
    } catch (error) {
      console.error('Failed to create AI connections:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (confidence >= 0.6) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
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
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={getAISuggestions}
                  disabled={isLoadingAI}
                  className="flex items-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  {isLoadingAI ? 'Analyzing...' : 'AI Analysis'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createAIConnections}
                  disabled={isLoadingAI}
                  className="flex items-center space-x-2"
                >
                  <Link className="w-4 h-4" />
                  {isLoadingAI ? 'Creating...' : 'Auto-Connect'}
                </Button>
              </>
            )}
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

      {/* Enhanced AI Suggestions Panel */}
      {showAIPanel && aiSuggestions && (
        <div className="border-t border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>AI Analysis & Suggestions</span>
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createAIConnections}
                  disabled={isLoadingAI}
                  className="flex items-center space-x-2"
                >
                  <Link className="w-4 h-4" />
                  {isLoadingAI ? 'Creating...' : 'Create Connections'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIPanel(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Summary Section */}
            <Card className="border-2">
              <div 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('summary')}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>AI Summary</span>
                  </h4>
                  {expandedSections.summary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              {expandedSections.summary && (
                <div className="px-4 pb-4">
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {aiSuggestions.summary}
                  </div>
                </div>
              )}
            </Card>

            {/* Connection Suggestions Section */}
            <Card className="border-2">
              <div 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('connections')}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Link className="w-4 h-4" />
                    <span>Suggested Connections ({aiSuggestions.connection_suggestions?.length || 0})</span>
                  </h4>
                  {expandedSections.connections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              {expandedSections.connections && (
                <div className="px-4 pb-4 space-y-3">
                  {aiSuggestions.connection_suggestions?.length > 0 ? (
                    aiSuggestions.connection_suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-background rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {suggestion.relationship_type}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {getConfidenceIcon(suggestion.ai_confidence)}
                            <span className={`text-xs font-medium ${getConfidenceColor(suggestion.ai_confidence)}`}>
                              {Math.round(suggestion.ai_confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-medium mb-1">
                          {suggestion.target_node_id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {suggestion.reason}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No connection suggestions available.</p>
                  )}
                </div>
              )}
            </Card>

            {/* Quiz Questions Section */}
            <Card className="border-2">
              <div 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('quiz')}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Quiz Questions ({aiSuggestions.quiz_questions?.length || 0})</span>
                  </h4>
                  {expandedSections.quiz ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              {expandedSections.quiz && (
                <div className="px-4 pb-4 space-y-3">
                  {aiSuggestions.quiz_questions?.length > 0 ? (
                    aiSuggestions.quiz_questions.map((question, index) => (
                      <div key={index} className="p-3 bg-background rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {question.type || 'definition'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Concept: {question.concept}
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-2">
                          {question.question}
                        </div>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Show answer
                          </summary>
                          <div className="mt-2 p-2 bg-muted/50 rounded text-muted-foreground">
                            {question.answer}
                          </div>
                        </details>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No quiz questions available.</p>
                  )}
                </div>
              )}
            </Card>

            {/* Study Plan Section */}
            <Card className="border-2">
              <div 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('study_plan')}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Study Plan</span>
                  </h4>
                  {expandedSections.study_plan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              {expandedSections.study_plan && aiSuggestions.study_plan && (
                <div className="px-4 pb-4">
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {aiSuggestions.study_plan}
                  </div>
                </div>
              )}
            </Card>

            {/* AI Analysis Section */}
            <Card className="border-2">
              <div 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('analysis')}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>Content Analysis</span>
                  </h4>
                  {expandedSections.analysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              {expandedSections.analysis && aiSuggestions.ai_analysis && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Keywords:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiSuggestions.ai_analysis.keywords?.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Complexity Score:</span>
                      <div className="mt-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(aiSuggestions.ai_analysis.complexity_score || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((aiSuggestions.ai_analysis.complexity_score || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}; 