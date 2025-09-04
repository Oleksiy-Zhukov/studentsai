'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api, type Note } from '@/lib/api'
import { Save, FileText, X, Eye, Edit, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import Image from 'next/image'
import { getWordCount } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface NoteEditorProps {
  note?: Note
  onSave: (note: Note) => void
  onCancel: () => void
  onNavigateByTitle?: (title: string) => void
  showNotesPanel?: boolean
  onToggleNotesPanel?: () => void
}

export function NoteEditor({ note, onSave, onCancel, onNavigateByTitle, showNotesPanel, onToggleNotesPanel }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [loading, setLoading] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const wordCount = getWordCount(content)
  const isEditing = !!note

  // Auto-save functionality
  const performAutoSave = async () => {
    if (!title.trim() || !content.trim() || !isEditing) return

    setAutoSaving(true)
    try {
      const savedNote = await api.updateNote(note.id, { title, content })
      setLastSaved(new Date())
      onSave(savedNote)
    } catch (err) {
      console.error('Auto-save failed:', err)
    } finally {
      setAutoSaving(false)
    }
  }

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!isEditing || (!title.trim() && !content.trim())) return

    const autoSaveTimer = setTimeout(() => {
      performAutoSave()
    }, 3000) // Auto-save after 3 seconds of no typing

    return () => clearTimeout(autoSaveTimer)
  }, [title, content, isEditing])

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

  const transformWikiLinksToMarkdown = (text: string): string =>
    text.replace(/\[\[([^\[\]]+)\]\]/g, (_m, p1) => `[${p1}](#note=${encodeURIComponent(String(p1).trim())})`)

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
    <div className="h-full flex flex-col bg-white dark:bg-[#141820]">
      {/* Editor Header */}
      <div className="border-b border-gray-200 px-6 py-3 dark:border-[#232a36]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {isEditing ? 'Edit Note' : 'Create New Note'}
            </span>
            {/* Auto-save status indicator */}
            {isEditing && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                {autoSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-500"></div>
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                ) : null}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Panel Toggle Button */}
            {onToggleNotesPanel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleNotesPanel}
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                title={showNotesPanel ? "Hide notes panel" : "Show notes panel"}
              >
                {showNotesPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-[#0f1115]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'edit' | 'preview')} className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-6 py-2 dark:border-[#232a36]">
            <TabsList className="bg-gray-100 dark:bg-[#0f1115] dark:border dark:border-[#232a36]">
              <TabsTrigger value="edit" className="flex items-center space-x-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600 dark:data-[state=active]:text-white">
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center space-x-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600 dark:data-[state=active]:text-white">
                <Eye className="h-3 w-3" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="h-full m-0 flex-1">
          <div className="h-full flex flex-col p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Title Input */}
            <div className="mb-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="text-2xl font-semibold border-0 border-b border-gray-200 rounded-none px-0 py-2 focus:ring-0 focus:border-gray-400 dark:bg-[#141820] dark:text-gray-100 dark:border-[#232a36] dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                spellCheck={true}
                autoCorrect="on"
                autoCapitalize="words"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              />
            </div>

            {/* Content Textarea */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Content</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{wordCount} words</span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={async (e) => {
                  if (!e.clipboardData) return
                  const item = Array.from(e.clipboardData.items).find(it => it.type.startsWith('image/'))
                  if (!item) return
                  e.preventDefault()
                  const file = item.getAsFile()
                  if (!file) return
                  try {
                    const { url } = await api.uploadImage(file)
                    const md = `\n\n![](${url})\n\n`
                    const target = e.target as HTMLTextAreaElement
                    const start = target.selectionStart || content.length
                    const end = target.selectionEnd || content.length
                    const next = content.slice(0, start) + md + content.slice(end)
                    setContent(next)
                  } catch {
                    setError('Image upload failed')
                  }
                }}
                placeholder="Start writing your notes here..."
                className="flex-1 resize-none border-0 focus:ring-0 text-gray-700 leading-relaxed dark:bg-[#0f1115] dark:text-gray-100 dark:placeholder:text-gray-500"
                spellCheck={true}
                autoCorrect="on"
                autoCapitalize="sentences"
                style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#232a36]">
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={loading || !title.trim() || !content.trim()}
                  className="flex items-center space-x-1"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSummarize}
                  disabled={summarizing || !content.trim()}
                  className="flex items-center space-x-1 dark:bg-[#0f1318] dark:hover:bg-[#1d2430] dark:border-gray-700 dark:text-gray-200"
                >
                  <Image src="/icons/summary-icon.svg" alt="Summary" width={16} height={16} />
                  <span>{summarizing ? 'Summarizing...' : 'AI Summary'}</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="h-full m-0">
          <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">{title || 'Untitled Note'}</h1>
              
              {note?.summary && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 dark:bg-orange-950/30 dark:border-orange-900/40">
                  <h4 className="font-medium text-orange-900 mb-2 dark:text-orange-300">AI Summary</h4>
                  <p className="text-orange-800 dark:text-orange-200">{note.summary}</p>
                </div>
              )}
              
              <div 
                className="prose prose-orange max-w-none dark:prose-invert prose-lg"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  lineHeight: '1.6'
                }}
              >
                {content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ href, children, ...props }) => {
                        if (href && href.startsWith('#note=')) {
                          const title = decodeURIComponent(href.replace('#note=', ''))
                          return (
                            <a
                              href={href}
                              className="text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                              onClick={(e) => {
                                e.preventDefault()
                                if (typeof window !== 'undefined') {
                                  window.location.hash = `note=${encodeURIComponent(title)}`
                                }
                                onNavigateByTitle?.(title)
                              }}
                              {...props}
                            >
                              {children}
                            </a>
                          )
                        }
                        return <a className="text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors" href={href} {...props}>{children}</a>
                      },
                      p: ({ children }) => <p className="leading-relaxed mb-4 text-gray-800 dark:text-gray-200">{children}</p>,
                      h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-medium mb-3 text-gray-900 dark:text-gray-100">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-800 dark:text-gray-200">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-2 my-4 rounded-r">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-orange-600 dark:text-orange-400">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto mb-4 border border-gray-200 dark:border-gray-700">
                          {children}
                        </pre>
                      ),
                      img: (props) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img {...props} alt={props.alt || ''} className="max-w-full rounded-lg shadow-md border border-gray-200 dark:border-[#232a36] my-4" />
                      ),
                    }}
                  >
                    {transformWikiLinksToMarkdown(content)}
                  </ReactMarkdown>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Start writing to see your preview here...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

