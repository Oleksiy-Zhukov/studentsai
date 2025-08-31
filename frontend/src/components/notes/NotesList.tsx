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
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { KeywordsDisplay } from './KeywordsDisplay'

interface NotesListProps {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
  onSelect: (note: Note) => void
  onRefreshKeywords?: (noteId: string) => Promise<void>
  selectedNoteId?: string
}

export function NotesList({ notes, onEdit, onDelete, onSelect, onRefreshKeywords, selectedNoteId }: NotesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; noteId: string | null }>({
    isOpen: false,
    noteId: null
  })

  const handleDeleteClick = (noteId: string) => {
    setDeleteDialog({ isOpen: true, noteId })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.noteId) return
    
    setDeletingId(deleteDialog.noteId)
    try {
      await onDelete(deleteDialog.noteId)
    } finally {
      setDeletingId(null)
    }
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, noteId: null })
  }

  if (notes.length === 0) {
    return (
      <div className="p-4 text-center">
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet</p>
        <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">Create your first note to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`group relative flex items-center space-x-3 rounded-lg px-3 py-2 cursor-pointer transition-colors border-l-2 ${
            selectedNoteId === note.id
              ? 'bg-orange-50 border-orange-500 dark:bg-orange-950/20 dark:border-orange-400'
              : 'hover:bg-gray-100 border-transparent dark:hover:bg-[#0f1115]'
          }`}
          onClick={() => onSelect(note)}
        >
          {/* Note Icon */}
          <div className="flex-shrink-0">
            <FileText className="h-4 w-4 text-gray-500" />
          </div>

          {/* Note Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
              {note.title}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
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
                  className="h-6 w-6 p-0 dark:text-gray-300 dark:hover:bg-[#0f1115]"
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
                    handleDeleteClick(note.id)
                  }}
                  disabled={deletingId === note.id}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  {deletingId === note.id ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone and will also remove any associated flashcards."
        confirmText="Delete Note"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

