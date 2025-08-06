import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ChevronDown, ChevronUp, Bold, Italic, Code, List, ListOrdered, Quote,
  Heading1, Heading2, Heading3, Minus, Plus, Save, Edit3, Eye, EyeOff,
  Brain, Link, Target, Sparkles, Zap, X, Maximize2, Minimize2
} from 'lucide-react';
import { api } from '../utils/api';


export const NoteEditor = ({ note, onNoteUpdate, onNoteCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [selectedText, setSelectedText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [aiPanelHeight, setAiPanelHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef(null);

  // Load note data when component mounts or note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setDifficulty(note.difficulty || 'beginner');
      setTags(note.tags || []);
      setAiSuggestions(note.ai_suggestions || {});
      setHasUnsavedChanges(false);
    } else {
      // Reset form for new note
      setTitle('');
      setContent('');
      setDifficulty('beginner');
      setTags([]);
      setAiSuggestions({});
      setHasUnsavedChanges(false);
    }
  }, [note]);

  // Track changes for autosave detection
  useEffect(() => {
    if (!note) return;
    
    const currentData = {
      title: note.title || '',
      content: note.content || '',
      difficulty: note.difficulty || 'beginner',
      tags: note.tags || []
    };
    
    const newData = {
      title,
      content,
      difficulty,
      tags
    };
    
    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(newData);
    setHasUnsavedChanges(hasChanges);
  }, [title, content, difficulty, tags, note]);

  const handleSave = async () => {
    const noteData = {
      title,
      content,
      difficulty,
      tags,
      ai_suggestions: aiSuggestions
    };

    console.log('Note object:', note); // Debug log
    console.log('Note ID:', note?.id); // Debug log

    try {
      if (note?.id) {
        // Update existing note
        const updatedNote = { ...note, ...noteData };
        console.log('Updating note with ID:', note.id); // Debug log
        await api.updateNote(note.id, noteData);
        onNoteUpdate(updatedNote);
      } else {
        // Create new note
        console.log('Creating new note'); // Debug log
        const response = await api.createNote(noteData);
        onNoteCreate(response);
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving note:', error);
      // You might want to show a toast notification here
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
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const formatText = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'heading1':
        formattedText = `# ${selectedText}`;
        break;
      case 'heading2':
        formattedText = `## ${selectedText}`;
        break;
      case 'heading3':
        formattedText = `### ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      case 'orderedList':
        formattedText = `1. ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Reset selection
    setTimeout(() => {
      textarea.setSelectionRange(start, start + formattedText.length);
      textarea.focus();
    }, 0);
  };

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      setSelectedText(content.substring(start, end));
    }
  };



  const generateSummary = async () => {
    if (!note?.id) return;
    
    setLoadingStates(prev => ({ ...prev, summary: true }));
    try {
      const response = await api.generateSummary(note.id);
      setAiSuggestions(prev => ({ ...prev, summary: response }));
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, summary: false }));
    }
  };

  const generateQuiz = async () => {
    if (!note?.id) return;
    
    setLoadingStates(prev => ({ ...prev, quiz: true }));
    try {
      const response = await api.generateQuiz(note.id);
      setAiSuggestions(prev => ({ ...prev, quiz: response }));
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, quiz: false }));
    }
  };

  const generateStudyPlan = async () => {
    if (!note?.id) return;
    
    setLoadingStates(prev => ({ ...prev, studyPlan: true }));
    try {
      const response = await api.generateStudyPlan(note.id);
      setAiSuggestions(prev => ({ ...prev, study_plan: response }));
    } catch (error) {
      console.error('Error generating study plan:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, studyPlan: false }));
    }
  };

  const createAIConnections = async () => {
    if (!note?.id) return;
    
    setLoadingStates(prev => ({ ...prev, connections: true }));
    try {
      const response = await api.createAIConnections(note.id);
      setAiSuggestions(prev => ({ ...prev, connections: response }));
    } catch (error) {
      console.error('Error creating AI connections:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, connections: false }));
    }
  };

  const regenerateAnalysis = async () => {
    if (!note?.id) return;
    
    setLoadingStates(prev => ({ ...prev, analysis: true }));
    try {
      const response = await api.regenerateAnalysis(note.id);
      setAiSuggestions(prev => ({ ...prev, analysis: response }));
    } catch (error) {
      console.error('Error regenerating analysis:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, analysis: false }));
    }
  };

  // Improved resize handlers for smoother animation
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newHeight = window.innerHeight - e.clientY - 50;
    if (newHeight > 100 && newHeight < window.innerHeight - 200) {
      setAiPanelHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing]);

  const renderMarkdownPreview = (text) => {
    // Simple markdown rendering - you might want to use a proper markdown library
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/\n/g, '<br>');
  };

    return (
    <div className="h-screen flex flex-col bg-background">
      {/* VS Code-style Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">
          {note?.id ? 'Edit Note' : 'Create New Note'}
        </h1>
        <div className="flex items-center space-x-2">
          {note?.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIFeatures(!showAIFeatures)}
              className="flex items-center space-x-2"
            >
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>AI Features</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </Button>
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-600 font-medium">Unsaved changes</span>
            )}
            <Button 
              size="sm" 
              onClick={handleSave} 
              className="flex items-center space-x-2"
              disabled={!hasUnsavedChanges}
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Note Editor Section */}
        <div className="flex-1 p-6 overflow-y-auto" style={{ height: showAIFeatures ? `calc(100vh - ${aiPanelHeight + 100}px)` : 'calc(100vh - 80px)' }}>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
                          <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="text-lg"
            />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Content</label>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('bold')}
                    disabled={!selectedText}
                    className="p-1"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('italic')}
                    disabled={!selectedText}
                    className="p-1"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('code')}
                    disabled={!selectedText}
                    className="p-1"
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('heading1')}
                    disabled={!selectedText}
                    className="p-1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('list')}
                    disabled={!selectedText}
                    className="p-1"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {showPreview ? (
                <div className="border rounded-md p-4 min-h-[400px] bg-background">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }}
                  />
                </div>
              ) : (
                              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={handleTextSelection}
                placeholder="Write your note content here... (Supports Markdown)"
                className="min-h-[400px] resize-none"
              />
              )}
            </div>

            {/* Difficulty and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Difficulty Level</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tags</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tag..."
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                                      {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Panel (VS Code Terminal Style) */}
        {showAIFeatures && note?.id && (
          <>
            {/* Resize Handle */}
            <div 
              className="h-1 bg-border cursor-ns-resize hover:bg-primary/20 transition-colors"
              onMouseDown={handleMouseDown}
            />
            
            {/* AI Panel */}
            <div 
              className="bg-card border-t border-border overflow-hidden"
              style={{ height: `${aiPanelHeight}px` }}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span className="text-sm font-medium text-foreground">AI Features</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIFeatures(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="p-4 overflow-y-auto h-full">
                <div className="space-y-4">
                  {/* AI Feature Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Card 
                      className="p-3 hover:shadow-md transition-all cursor-pointer border-2 hover:border-blue-300"
                      onClick={generateSummary}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <div className="w-4 h-4 bg-blue-600 rounded"></div>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">AI Summary</h3>
                          <p className="text-xs text-muted-foreground">Generate concise summary</p>
                        </div>
                      </div>
                      {loadingStates.summary && (
                        <div className="mt-2 text-xs text-blue-600">Generating...</div>
                      )}
                    </Card>

                    <Card 
                      className="p-3 hover:shadow-md transition-all cursor-pointer border-2 hover:border-green-300"
                      onClick={generateQuiz}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <div className="w-4 h-4 bg-green-600 rounded"></div>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">Quiz Questions</h3>
                          <p className="text-xs text-muted-foreground">Create practice questions</p>
                        </div>
                      </div>
                      {loadingStates.quiz && (
                        <div className="mt-2 text-xs text-green-600">Generating...</div>
                      )}
                    </Card>

                    <Card 
                      className="p-3 hover:shadow-md transition-all cursor-pointer border-2 hover:border-purple-300"
                      onClick={generateStudyPlan}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <div className="w-4 h-4 bg-purple-600 rounded"></div>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">Study Plan</h3>
                          <p className="text-xs text-muted-foreground">Generate learning path</p>
                        </div>
                      </div>
                      {loadingStates.studyPlan && (
                        <div className="mt-2 text-xs text-purple-600">Generating...</div>
                      )}
                    </Card>

                    <Card 
                      className="p-3 hover:shadow-md transition-all cursor-pointer border-2 hover:border-orange-300"
                      onClick={createAIConnections}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <div className="w-4 h-4 bg-orange-600 rounded"></div>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">Auto-Connect</h3>
                          <p className="text-xs text-muted-foreground">Find related notes</p>
                        </div>
                      </div>
                      {loadingStates.connections && (
                        <div className="mt-2 text-xs text-orange-600">Finding...</div>
                      )}
                    </Card>

                    <Card 
                      className="p-3 hover:shadow-md transition-all cursor-pointer border-2 hover:border-red-300"
                      onClick={regenerateAnalysis}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <div className="w-4 h-4 bg-red-600 rounded"></div>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">Deep Analysis</h3>
                          <p className="text-xs text-muted-foreground">Comprehensive insights</p>
                        </div>
                      </div>
                      {loadingStates.analysis && (
                        <div className="mt-2 text-xs text-red-600">Analyzing...</div>
                      )}
                    </Card>
                  </div>

                  {/* AI Results Display */}
                  <div className="space-y-3">
                    {aiSuggestions.summary && (
                      <Card className="p-3 border-l-4 border-l-blue-500">
                        <h4 className="font-medium text-sm mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">{aiSuggestions.summary}</p>
                      </Card>
                    )}
                    
                    {aiSuggestions.quiz && (
                      <Card className="p-3 border-l-4 border-l-green-500">
                        <h4 className="font-medium text-sm mb-2">Quiz Questions</h4>
                        <div className="space-y-2">
                          {aiSuggestions.quiz.map((question, index) => (
                            <div key={index} className="text-sm">
                              <p className="font-medium mb-1">{question.question}</p>
                              <p className="text-muted-foreground">Answer: {question.answer}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {aiSuggestions.study_plan && (
                      <Card className="p-3 border-l-4 border-l-purple-500">
                        <h4 className="font-medium text-sm mb-2">Study Plan</h4>
                        <div className="space-y-1">
                          {aiSuggestions.study_plan.map((step, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {index + 1}. {step}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {aiSuggestions.connections && (
                      <Card className="p-3 border-l-4 border-l-orange-500">
                        <h4 className="font-medium text-sm mb-2">Related Notes</h4>
                        <div className="space-y-1">
                          {aiSuggestions.connections.map((connection, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {connection.title}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {aiSuggestions.analysis && (
                      <Card className="p-3 border-l-4 border-l-red-500">
                        <h4 className="font-medium text-sm mb-2">Deep Analysis</h4>
                        <p className="text-sm text-muted-foreground">{aiSuggestions.analysis}</p>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 