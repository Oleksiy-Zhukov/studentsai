'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { NotesList } from '@/components/notes/NotesList'
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer'
import { NotesGraph } from '@/components/graph/NotesGraph'
import { KeywordsDisplay } from '@/components/notes/KeywordsDisplay'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, type Note, type User, APIError } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Plus, FileText, Network, Search, FolderOpen, ArrowLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
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
  const [navHistory, setNavHistory] = useState<string[]>([])
  const [showNotesPanel, setShowNotesPanel] = useState(true)

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
    } else {
      if (typeof window !== 'undefined') {
        window.location.replace('/landing')
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
    if (typeof window !== 'undefined') {
      window.location.replace('/landing')
    }
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
      setNotes(notes.map(n => (n.id === note.id ? note : n)))
    } else {
      // Add new note
      setNotes([note, ...notes])
    }
    setSelectedNote(note)
    setCurrentView('notes')
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.deleteNote(noteId)
      setNotes(notes.filter(n => n.id !== noteId))
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const handleRefreshKeywords = async (noteId: string) => {
    try {
      const updatedNote = await api.extractKeywords(noteId)
      setNotes(notes.map(note => note.id === noteId ? updatedNote : note))
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNote)
      }
    } catch (error) {
      console.error('Failed to extract keywords:', error)
      alert('Failed to extract keywords')
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

  const navigateToNote = (note: Note) => {
    if (selectedNote && selectedNote.id !== note.id) {
      setNavHistory((prev) => [...prev, selectedNote.id])
    }
    setSelectedNote(note)
    setCurrentView('notes')
    if (typeof window !== 'undefined') {
      window.location.hash = `note=${encodeURIComponent(note.title)}`
    }
  }

  const navigateToTitle = (title: string) => {
    const target = notes.find(n => n.title.toLowerCase() === title.toLowerCase())
    if (target) {
      navigateToNote(target)
    }
  }

  const goBack = () => {
    setNavHistory((prev) => {
      if (prev.length === 0) return prev
      const next = prev.slice(0, -1)
      const prevId = prev[prev.length - 1]
      const prevNote = notes.find(n => n.id === prevId)
      if (prevNote) {
        setSelectedNote(prevNote)
        if (typeof window !== 'undefined') {
          window.location.hash = `note=${encodeURIComponent(prevNote.title)}`
        }
      }
      return next
    })
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
      navigateToNote(note)
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

  if (!user) return null

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0f1115]">
      {/* Top Header */}
      <Header user={user} onLogout={handleLogout} context="notes" />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - File Explorer */}
        {showNotesPanel && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col dark:bg-[#141820] dark:border-[#232a36]">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-[#232a36]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 dark:bg-[#0f1115] dark:border-[#232a36] dark:text-gray-100"
              />
            </div>
          </div>

          {/* File Explorer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#232a36]">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Notes</span>
            </div>
            <Button
              size="sm"
              onClick={handleCreateNote}
              className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-500 dark:hover:bg-orange-400 dark:text-white"
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
              onRefreshKeywords={handleRefreshKeywords}
              selectedNoteId={selectedNote?.id}
            />
          </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {currentView === 'editor' ? (
            <NoteEditor
              note={selectedNote || undefined}
              onSave={handleSaveNote}
              onCancel={() => setCurrentView('notes')}
              onNavigateByTitle={navigateToTitle}
              showNotesPanel={showNotesPanel}
              onToggleNotesPanel={() => setShowNotesPanel(!showNotesPanel)}
            />
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Top Toolbar */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 dark:bg-[#141820] dark:border-[#232a36]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Panel Toggle Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotesPanel(!showNotesPanel)}
                      className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                      title={showNotesPanel ? "Hide notes panel" : "Show notes panel"}
                    >
                      {showNotesPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                    </Button>
                    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as View)}>
                      <TabsList className="bg-gray-100 dark:bg-[#0f1115] dark:border dark:border-[#232a36]">
                        <TabsTrigger value="notes" className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600 dark:data-[state=active]:text-white">
                          <FileText className="h-4 w-4" />
                          <span>Notes</span>
                        </TabsTrigger>
                        <TabsTrigger value="flashcards" className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600 dark:data-[state=active]:text-white">
                          <img src="/flashcards-icon.svg" alt="Flashcards" className="h-4 w-4" />
                          <span>Flashcards</span>
                        </TabsTrigger>
                        <TabsTrigger value="graph" className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600 dark:data-[state=active]:text-white">
                          <Network className="h-4 w-4" />
                          <span>Graph</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {selectedNote && currentView === 'notes' && (
                    <div className="flex items-center space-x-2">
                      {navHistory.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goBack}
                          className="border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:bg-[#0f1318] dark:hover:bg-[#1d2430]"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Back
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditNote(selectedNote)}
                        className="border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:bg-[#0f1318] dark:hover:bg-[#1d2430]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFlashcards(selectedNote)}
                        className="flex items-center space-x-1 border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:bg-[#0f1318] dark:hover:bg-[#1d2430]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/flashcards-icon.svg" alt="Flashcards" className="h-4 w-4" />
                        <span>Generate Flashcards</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden min-h-0">
                {currentView === 'notes' && (
                  selectedNote ? (
                    <div className="h-full flex min-h-0">
                      {/* Note Content */}
                      <div className="flex-1 p-6 overflow-y-auto min-h-0">
                        <div className="max-w-4xl mx-auto">
                          <h1 className="text-3xl font-bold text-gray-900 mb-4 dark:text-gray-100">{selectedNote.title}</h1>
                          
                          {selectedNote.summary && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 dark:bg-orange-950/30 dark:border-orange-900/40">
                              <h4 className="font-medium text-orange-900 mb-2 dark:text-orange-300">AI Summary</h4>
                              <p className="text-orange-800 dark:text-orange-200">{selectedNote.summary}</p>
                            </div>
                          )}
                          
                          <div className="prose prose-orange max-w-none dark:prose-invert">
                            <div className="text-gray-700 leading-relaxed pb-24 dark:text-gray-200">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ href, children, ...props }) => {
                                    if (href && href.startsWith('#note=')) {
                                      const title = decodeURIComponent(href.replace('#note=', ''))
                                      return (
                                        <a
                                          href={href}
                                          className="text-orange-600 underline dark:text-orange-400"
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
                                        className="text-orange-600 underline dark:text-orange-400"
                                        {...props}
                                      >
                                        {children}
                                      </a>
                                    )
                                  },
                                  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                                  img: (props) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img {...props} alt={props.alt || ''} className="max-w-full rounded border border-gray-200 dark:border-[#232a36]" />
                                  ),
                                }}
                              >
                                {transformWikiLinksToMarkdown(selectedNote.content)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Sidebar - Backlinks & Metadata */}
                      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 dark:bg-[#141820] dark:border-[#232a36]">
                        <div className="space-y-6">
                          {/* Metadata */}
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2 dark:text-gray-100">Note Info</h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                              <div>Created: {new Date(selectedNote.created_at).toLocaleDateString()}</div>
                              <div>Updated: {new Date(selectedNote.updated_at).toLocaleDateString()}</div>
                              <div>Words: {selectedNote.content.split(' ').length}</div>
                            </div>
                          </div>

                          <Separator />

                          {/* Backlinks */}
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2 dark:text-gray-100">Backlinks</h3>
                            {backlinks.length === 0 ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No backlinks found</p>
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
                                    className="block w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-[#1d2430] text-sm"
                                  >
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{b.title}</div>
                                    {b.excerpt && (
                                      <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            a: ({ href, children, ...props }) => {
                                              if (href && href.startsWith('#note=')) {
                                                const title = decodeURIComponent(href.replace('#note=', ''))
                                                return (
                                                  <a
                                                    href={href}
                                                    className="text-orange-600 underline dark:text-orange-400"
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
                                                  className="text-orange-600 underline dark:text-orange-400"
                                                  {...props}
                                                >
                                                  {children}
                                                </a>
                                              )
                                            },
                                            p: ({ children }) => <span className="leading-relaxed">{children}</span>,
                                            img: () => null,
                                            h1: ({ children }) => <span className="font-semibold">{children}</span>,
                                            h2: ({ children }) => <span className="font-semibold">{children}</span>,
                                            h3: ({ children }) => <span className="font-semibold">{children}</span>,
                                          }}
                                        >
                                          {transformWikiLinksToMarkdown(b.excerpt)}
                                        </ReactMarkdown>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Keywords */}
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2 dark:text-gray-100">Keywords</h3>
                            {selectedNote && (
                              <KeywordsDisplay 
                                note={selectedNote}
                                onRefreshKeywords={handleRefreshKeywords}
                                className="text-sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No note selected</h3>
                        <p>Select a note from the sidebar to view its content</p>
                      </div>
                    </div>
                  )
                )}

                  {/* Flashcards Tab */}
                  {currentView === 'flashcards' && (
                    <div className="h-full p-6 overflow-y-auto">
                      <div className="max-w-4xl mx-auto">
                        {selectedNote ? (
                          <FlashcardViewer 
                            noteId={selectedNote.id} 
                            onFlashcardCreated={(flashcard) => { console.log('Flashcard created:', flashcard); }} 
                          />
                        ) : (
                          <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4">
                              <img src="/icons/flashcards-icon.svg" alt="Flashcards" className="w-full h-full" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                              Flashcard Studio
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                              Study and review your knowledge with AI-powered flashcards
                            </p>
                            <div className="flex gap-3 justify-center">
                              <Button 
                                onClick={() => window.location.href = '/flashcards'}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Go to Flashcards
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setCurrentView('notes')}
                                className="border-gray-200 dark:border-[#232a36] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1d2430]"
                              >
                                Select Note
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {currentView === 'graph' && (
                  <NotesGraph onNodeClick={handleGraphNodeClick} highlightNodeIds={filteredNotes.map(n=>n.id)} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

