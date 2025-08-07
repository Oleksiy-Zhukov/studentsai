'use client'

import { useState, useEffect } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'
import { Header } from '@/components/layout/Header'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { NotesList } from '@/components/notes/NotesList'
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer'
import { NotesGraph } from '@/components/graph/NotesGraph'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, type Note, type User } from '@/lib/api'
import { Plus, FileText, Zap, Network } from 'lucide-react'

type View = 'notes' | 'editor' | 'flashcards' | 'graph'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [currentView, setCurrentView] = useState<View>('notes')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)

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
    } catch (err) {
      console.error('Failed to load notes:', err)
    }
  }

  const handleAuthSuccess = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      loadNotes()
    }
  }

  const handleLogout = () => {
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

  const handleGraphNodeClick = (nodeId: string) => {
    const note = notes.find(n => n.id === nodeId)
    if (note) {
      setSelectedNote(note)
      setCurrentView('notes')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onSuccess={handleAuthSuccess} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'editor' ? (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onCancel={() => setCurrentView('notes')}
          />
        ) : currentView === 'flashcards' && selectedNote ? (
          <FlashcardViewer
            note={selectedNote}
            onClose={() => setCurrentView('notes')}
          />
        ) : (
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as View)}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="notes" className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>Notes</span>
                </TabsTrigger>
                <TabsTrigger value="graph" className="flex items-center space-x-1">
                  <Network className="h-4 w-4" />
                  <span>Graph</span>
                </TabsTrigger>
              </TabsList>

              {currentView === 'notes' && (
                <Button onClick={handleCreateNote} className="flex items-center space-x-1">
                  <Plus className="h-4 w-4" />
                  <span>New Note</span>
                </Button>
              )}
            </div>

            <TabsContent value="notes">
              <div className="space-y-6">
                {selectedNote && currentView === 'notes' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedNote.title}</h2>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNote(selectedNote)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewFlashcards(selectedNote)}
                          className="flex items-center space-x-1"
                        >
                          <Zap className="h-4 w-4" />
                          <span>Flashcards</span>
                        </Button>
                      </div>
                    </div>
                    
                    {selectedNote.summary && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-orange-900 mb-2">AI Summary</h4>
                        <p className="text-orange-800">{selectedNote.summary}</p>
                      </div>
                    )}
                    
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700">{selectedNote.content}</p>
                    </div>
                  </div>
                )}
                
                <NotesList
                  notes={notes}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onSelect={handleSelectNote}
                />
              </div>
            </TabsContent>

            <TabsContent value="graph">
              <NotesGraph onNodeClick={handleGraphNodeClick} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

