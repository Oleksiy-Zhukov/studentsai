'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Note } from '@/lib/api'
import { formatDate, truncateText, getWordCount } from '@/lib/utils'
import { Edit, Trash2, FileText, Calendar, Hash, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
      <div className="p-4 text-center">
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No notes yet</p>
        <p className="text-xs text-gray-400 mt-1">Create your first note to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group relative flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => onSelect(note)}
        >
          {/* Note Icon */}
          <div className="flex-shrink-0">
            <FileText className="h-4 w-4 text-gray-500" />
          </div>

          {/* Note Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {note.title}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{formatDate(note.updated_at)}</span>
              <span>•</span>
              <span>{getWordCount(note.content)} words</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  onEdit(note)
                }}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    handleDelete(note.id)
                  }}
                  disabled={deletingId === note.id}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  {deletingId === note.id ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}

