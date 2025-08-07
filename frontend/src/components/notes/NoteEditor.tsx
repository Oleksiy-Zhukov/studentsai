'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api, type Note } from '@/lib/api'
import { Save, Sparkles, FileText } from 'lucide-react'
import { getWordCount } from '@/lib/utils'

interface NoteEditorProps {
  note?: Note
  onSave: (note: Note) => void
  onCancel: () => void
}

export function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [loading, setLoading] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [error, setError] = useState('')

  const wordCount = getWordCount(content)
  const isEditing = !!note

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      let savedNote: Note
      if (isEditing) {
        savedNote = await api.updateNote(note.id, { title, content })
      } else {
        savedNote = await api.createNote(title, content)
      }
      onSave(savedNote)
    } catch (err) {
      setError('Failed to save note')
    } finally {
      setLoading(false)
    }
  }

  const handleSummarize = async () => {
    if (!content.trim()) {
      setError('Add some content to summarize')
      return
    }

    setSummarizing(true)
    setError('')

    try {
      if (isEditing) {
        const updatedNote = await api.summarizeNote(note.id)
        onSave(updatedNote)
      } else {
        const result = await api.summarizeText(content)
        // For new notes, we'll show the summary in an alert for now
        alert(`Summary: ${result.summary}`)
      }
    } catch (err) {
      setError('Failed to generate summary')
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>{isEditing ? 'Edit Note' : 'Create New Note'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="text-lg"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <span className="text-sm text-gray-500">
              {wordCount} words
            </span>
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your notes here..."
            className="min-h-[300px] resize-y"
          />
        </div>

        {note?.summary && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">AI Summary</h4>
            <p className="text-orange-800 text-sm">{note.summary}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={loading || !title.trim() || !content.trim()}
              className="flex items-center space-x-1"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Note'}</span>
            </Button>

            <Button
              variant="secondary"
              onClick={handleSummarize}
              disabled={summarizing || !content.trim()}
              className="flex items-center space-x-1"
            >
              <Sparkles className="h-4 w-4" />
              <span>{summarizing ? 'Summarizing...' : 'AI Summary'}</span>
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

