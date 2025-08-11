'use client'

import { useState, useEffect } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'
import { Header } from '@/components/layout/Header'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { NotesList } from '@/components/notes/NotesList'
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer'
import { NotesGraph } from '@/components/graph/NotesGraph'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, type Note, type User, APIError } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Plus, FileText, Zap, Network, Search, FolderOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

type View = 'notes' | 'editor' | 'flashcards' | 'graph'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [currentView, setCurrentView] = useState<View>('notes')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([])
  const [backlinks, setBacklinks] = useState<Array<{ note_id: string; title: string; excerpt?: string; created_at: string }>>([])
  const [tagsSaving, setTagsSaving] = useState(false)

  useEffect(() => {
    // Check for existing auth
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        api.setToken(token)
        loadNotes()
      } catch (err) {
        // Invalid stored data, clear it
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const loadNotes = async () => {
    try {
      const response = await api.getNotes()
      setNotes(response.notes)
    } catch (err: unknown) {
      console.error('Failed to load notes:', err)
      // If it's an auth error, clear the token and redirect to login
      if (err instanceof APIError && (err.status === 401 || err.message?.includes('credentials'))) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        setUser(null)
        setNotes([])
      }
    }
  }

  const handleAuthSuccess = () => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('authToken')
    if (userData && token) {
      setUser(JSON.parse(userData))
      api.setToken(token)
      loadNotes()
    }
  }

  const handleLogout = () => {
    api.clearToken()
    setUser(null)
    setNotes([])
    setCurrentView('notes')
    setSelectedNote(null)
  }

  const handleCreateNote = () => {
    setSelectedNote(null)
    setCurrentView('editor')
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setCurrentView('editor')
  }

  const handleSaveNote = (note: Note) => {
    if (selectedNote) {
      // Update existing note
      setNotes(notes.map(n => n.id === note.id ? note : n))
    } else {
      // Add new note
      setNotes([note, ...notes])
    }
    setCurrentView('notes')
    setSelectedNote(null)
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.deleteNote(noteId)
      setNotes(notes.filter(n => n.id !== noteId))
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setCurrentView('notes') // Stay on notes view but show note details
  }

  const handleViewFlashcards = (note: Note) => {
    setSelectedNote(note)
    setCurrentView('flashcards')
  }

  const transformWikiLinksToMarkdown = (text: string): string =>
    text.replace(/\[\[([^\[\]]+)\]\]/g, (_m, p1) => `[${p1}](#note=${encodeURIComponent(String(p1).trim())})`)

  const navigateToTitle = (title: string) => {
    const target = notes.find(n => n.title.toLowerCase() === title.toLowerCase())
    if (target) {
      setSelectedNote(target)
      setCurrentView('notes')
    }
  }

  const selectFromHash = () => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash || ''
    const match = hash.match(/^#note=(.+)$/)
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1])
      navigateToTitle(decoded)
    }
  }

  useEffect(() => {
    selectFromHash()
    const handler = () => selectFromHash()
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length])

  // Load suggested keywords and backlinks when a note is selected
  useEffect(() => {
    const run = async () => {
      if (!selectedNote) {
        setSuggestedKeywords([])
        setBacklinks([])
        return
      }
      try {
        const [{ keywords }, backlinksResp] = await Promise.all([
          api.getSuggestedKeywords(selectedNote.id),
          api.getBacklinks(selectedNote.id),
        ])
        setSuggestedKeywords(keywords)
        setBacklinks(backlinksResp)
      } catch (e) {
        // noop; sidebar can show empty states
      }
    }
    run()
  }, [selectedNote])

  const addTag = async (tag: string) => {
    if (!selectedNote) return
    const current = selectedNote.tags || []
    if (current.includes(tag)) return
    setTagsSaving(true)
    try {
      const updated = await api.updateTags(selectedNote.id, [...current, tag])
      // Update local state
      setNotes(notes.map(n => (n.id === updated.id ? updated : n)))
      setSelectedNote(updated)
    } finally {
      setTagsSaving(false)
    }
  }

  const removeTag = async (tag: string) => {
    if (!selectedNote) return
    const current = selectedNote.tags || []
    if (!current.includes(tag)) return
    setTagsSaving(true)
    try {
      const updated = await api.updateTags(selectedNote.id, current.filter(t => t !== tag))
      setNotes(notes.map(n => (n.id === updated.id ? updated : n)))
      setSelectedNote(updated)
    } finally {
      setTagsSaving(false)
    }
  }

  const handleGraphNodeClick = (nodeId: string) => {
    const note = notes.find(n => n.id === nodeId)
    if (note) {
      setSelectedNote(note)
      setCurrentView('notes')
    }
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading StudentsAI...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onSuccess={handleAuthSuccess} />
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <Header user={user} onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* File Explorer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">Notes</span>
            </div>
            <Button
              size="sm"
              onClick={handleCreateNote}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            <NotesList
              notes={filteredNotes}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onSelect={handleSelectNote}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {currentView === 'editor' ? (
            <NoteEditor
              note={selectedNote || undefined}
              onSave={handleSaveNote}
              onCancel={() => setCurrentView('notes')}
              onNavigateByTitle={navigateToTitle}
            />
          ) : currentView === 'flashcards' && selectedNote ? (
            <FlashcardViewer
              note={selectedNote}
              onClose={() => setCurrentView('notes')}
            />
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Top Toolbar */}
              <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as View)}>
                      <TabsList className="bg-gray-100">
                        <TabsTrigger value="notes" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Notes</span>
                        </TabsTrigger>
                        <TabsTrigger value="graph" className="flex items-center space-x-2">
                          <Network className="h-4 w-4" />
                          <span>Graph</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {selectedNote && currentView === 'notes' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditNote(selectedNote)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFlashcards(selectedNote)}
                        className="flex items-center space-x-1"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Flashcards</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {currentView === 'notes' && (
                  selectedNote ? (
                    <div className="h-full flex">
                      {/* Note Content */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                          <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedNote.title}</h1>
                          
                          {selectedNote.summary && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                              <h4 className="font-medium text-orange-900 mb-2">AI Summary</h4>
                              <p className="text-orange-800">{selectedNote.summary}</p>
                            </div>
                          )}
                          
                          <div className="prose prose-orange max-w-none">
                            <div className="text-gray-700 leading-relaxed overflow-y-auto pb-24">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ href, children, ...props }) => {
                                    if (href && href.startsWith('#note=')) {
                                      const title = decodeURIComponent(href.replace('#note=', ''))
                                      return (
                                        <a
                                          href={href}
                                          className="text-orange-600 underline"
                                          onClick={(e) => {
                                            e.preventDefault()
                                            if (typeof window !== 'undefined') {
                                              window.location.hash = `note=${encodeURIComponent(title)}`
                                            }
                                            navigateToTitle(title)
                                          }}
                                          {...props}
                                        >
                                          {children}
                                        </a>
                                      )
                                    }
                                    return (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-orange-600 underline"
                                        {...props}
                                      >
                                        {children}
                                      </a>
                                    )
                                  },
                                  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                                }}
                              >
                                {transformWikiLinksToMarkdown(selectedNote.content)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Sidebar - Backlinks & Metadata */}
                      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
                        <div className="space-y-6">
                          {/* Metadata */}
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Note Info</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div>Created: {new Date(selectedNote.created_at).toLocaleDateString()}</div>
                              <div>Updated: {new Date(selectedNote.updated_at).toLocaleDateString()}</div>
                              <div>Words: {selectedNote.content.split(' ').length}</div>
                            </div>
                          </div>

                          <Separator />

                          {/* Backlinks */}
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Backlinks</h3>
                            {backlinks.length === 0 ? (
                              <p className="text-sm text-gray-500">No backlinks found</p>
                            ) : (
                              <div className="space-y-2">
                                {backlinks.map((b) => (
                                  <button
                                    key={b.note_id}
                                    type="button"
                                    onClick={() => {
                                      const target = notes.find(n => n.id === b.note_id)
                                      if (target) {
                                        setSelectedNote(target)
                                      }
                                    }}
                                    className="w-full text-left text-sm p-2 rounded hover:bg-gray-100"
                                  >
                                    <div className="font-medium text-gray-900 truncate">{b.title}</div>
                                    {b.excerpt && (
                                      <div className="text-gray-500 truncate">{b.excerpt}</div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Tags and suggested keywords */}
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(selectedNote.tags || []).length === 0 ? (
                                <p className="text-sm text-gray-500">No tags</p>
                              ) : (
                                (selectedNote.tags || []).map((t) => (
                                  <span key={t} className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded text-xs">
                                    {t}
                                    <button
                                      type="button"
                                      title="Remove tag"
                                      className="text-orange-700 hover:text-orange-900"
                                      onClick={() => removeTag(t)}
                                      disabled={tagsSaving}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Suggested</div>
                              {suggestedKeywords.length === 0 ? (
                                <p className="text-sm text-gray-500">No suggestions</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {suggestedKeywords.map((k) => (
                                    <button
                                      key={k}
                                      type="button"
                                      onClick={() => addTag(k)}
                                      disabled={tagsSaving}
                                      className="text-xs px-2 py-0.5 border border-gray-200 rounded hover:bg-gray-100"
                                      title="Add tag"
                                    >
                                      + {k}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a note</h3>
                        <p className="text-gray-600">Choose a note from the sidebar to view its content.</p>
                      </div>
                    </div>
                  )
                )}

                {currentView === 'graph' && (
                  <NotesGraph onNodeClick={handleGraphNodeClick} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

