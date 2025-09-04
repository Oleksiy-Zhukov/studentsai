'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEffect, useCallback } from 'react'

interface WysiwygEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function WysiwygEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...", 
  className = "",
  autoFocus = false 
}: WysiwygEditorProps) {
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable code blocks for now as they might interfere with markdown
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg shadow-md border border-gray-200 dark:border-gray-600 my-4',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      // Get HTML content and convert to markdown-like format if needed
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: `prose prose-orange max-w-none dark:prose-invert prose-lg focus:outline-none ${className}`,
        style: `
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          font-size: 16px;
          min-height: 200px;
          max-height: 70vh;
          overflow-y: auto;
          padding: 1rem;
        `,
        spellcheck: 'true',
        autocorrect: 'on',
        autocapitalize: 'sentences',
      },
    },
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  // Auto-focus if requested
  useEffect(() => {
    if (editor && autoFocus) {
      editor.commands.focus()
    }
  }, [editor, autoFocus])

  // Handle paste events for images
  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    if (!editor) return

    const items = event.clipboardData?.items
    if (!items) return

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        event.preventDefault()
        const file = item.getAsFile()
        if (!file) continue

        try {
          // You can integrate your existing image upload API here
          const formData = new FormData()
          formData.append('file', file)
          
          // For now, we'll use a placeholder - you can replace this with your actual API call
          // const response = await api.uploadImage(file)
          // editor.commands.setImage({ src: response.url })
          
          // Placeholder implementation
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result) {
              editor.commands.setImage({ src: e.target.result as string })
            }
          }
          reader.readAsDataURL(file)
        } catch (error) {
          console.error('Failed to upload image:', error)
        }
      }
    }
  }, [editor])

  useEffect(() => {
    const editorElement = editor?.view?.dom
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste)
      return () => editorElement.removeEventListener('paste', handlePaste)
    }
  }, [editor, handlePaste])

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    )
  }

  return (
    <div className="wysiwyg-editor">
      <EditorContent 
        editor={editor} 
        className="min-h-[300px] focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-opacity-50 rounded-lg transition-all"
      />
      
      {/* Custom styles for the editor */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          margin-top: 2rem;
          color: rgb(17 24 39);
        }
        
        .ProseMirror h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          color: rgb(17 24 39);
        }
        
        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
          margin-top: 1.25rem;
          color: rgb(17 24 39);
        }
        
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        
        .ProseMirror blockquote {
          border-left: 4px solid rgb(249 115 22);
          padding-left: 1rem;
          font-style: italic;
          color: rgb(75 85 99);
          background-color: rgb(249 250 251);
          padding: 0.5rem 1rem;
          margin: 1rem 0;
          border-radius: 0 0.375rem 0.375rem 0;
        }
        
        .ProseMirror code {
          background-color: rgb(243 244 246);
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          color: rgb(249 115 22);
        }
        
        .ProseMirror strong {
          font-weight: 600;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        /* Dark mode styles */
        .dark .ProseMirror h1,
        .dark .ProseMirror h2,
        .dark .ProseMirror h3 {
          color: rgb(243 244 246);
        }
        
        .dark .ProseMirror blockquote {
          color: rgb(209 213 219);
          background-color: rgb(31 41 55);
          border-left-color: rgb(249 115 22);
        }
        
        .dark .ProseMirror code {
          background-color: rgb(31 41 55);
          color: rgb(251 146 60);
        }
        
        .dark .ProseMirror p.is-editor-empty:first-child::before {
          color: rgb(107 114 128);
        }
      `}</style>
    </div>
  )
}
