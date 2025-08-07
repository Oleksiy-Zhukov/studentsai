'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type Note } from '@/lib/api'
import { formatDate, truncateText, getWordCount } from '@/lib/utils'
import { Edit, Trash2, FileText, Calendar, Hash } from 'lucide-react'

interface NotesListProps {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
  onSelect: (note: Note) => void
}

export function NotesList({ notes, onEdit, onDelete, onSelect }: NotesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setDeletingId(noteId)
      try {
        await onDelete(noteId)
      } finally {
        setDeletingId(null)
      }
    }
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
        <p className="text-gray-600">Create your first note to get started with AI-powered studying.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <Card 
          key={note.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(note)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg line-clamp-2">
              {note.title}
            </CardTitle>
            <CardDescription className="flex items-center space-x-4 text-xs">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(note.updated_at)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Hash className="h-3 w-3" />
                <span>{getWordCount(note.content)} words</span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {truncateText(note.content, 150)}
            </p>
            
            {note.summary && (
              <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-4">
                <p className="text-xs text-orange-800 line-clamp-2">
                  <strong>Summary:</strong> {truncateText(note.summary, 100)}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(note)
                  }}
                  className="flex items-center space-x-1"
                >
                  <Edit className="h-3 w-3" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(note.id)
                  }}
                  disabled={deletingId === note.id}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {deletingId === note.id ? 'Deleting...' : 'Delete'}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

