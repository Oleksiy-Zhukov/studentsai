'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api, type Flashcard, type Note } from '@/lib/api'
import { RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

interface FlashcardViewerProps {
  note: Note
  onClose: () => void
}

export function FlashcardViewer({ note, onClose }: FlashcardViewerProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const loadFlashcards = useCallback(async () => {
    try {
      setLoading(true)
      const cards = await api.getNoteFlashcards(note.id)
      setFlashcards(cards)
      setCurrentIndex(0)
      setShowAnswer(false)
    } catch (err) {
      setError('Failed to load flashcards')
    } finally {
      setLoading(false)
    }
  }, [note.id])

  useEffect(() => {
    loadFlashcards()
  }, [loadFlashcards])

  

  const generateFlashcards = async () => {
    try {
      setGenerating(true)
      setError('')
      const newCards = await api.generateNoteFlashcards(note.id, 5)
      setFlashcards(newCards)
      setCurrentIndex(0)
      setShowAnswer(false)
    } catch (err) {
      setError('Failed to generate flashcards')
    } finally {
      setGenerating(false)
    }
  }

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowAnswer(false)
    }
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300">
          {error}
        </div>
        <Button onClick={loadFlashcards}>Try Again</Button>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <Image src="/icons/flashcards-icon.svg" alt="Flashcards" width={48} height={48} className="mx-auto mb-4 opacity-80" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">No flashcards yet</h3>
          <p className="text-gray-600 mb-6 dark:text-gray-400">
            Generate AI-powered flashcards from your note content to enhance your studying.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={generateFlashcards}
            disabled={generating}
            className="mx-auto"
          >
            {generating ? 'Generating...' : 'Generate Flashcards'}
          </Button>
          
          <Button variant="outline" onClick={onClose} className="mx-auto">
            Back to Notes
          </Button>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Flashcards: {note.title}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentIndex + 1} of {flashcards.length}
          </span>
          <Button variant="outline" onClick={onClose}>
            Back to Notes
          </Button>
        </div>
      </div>

      <Card className="mb-6 h-[420px] md:h-[480px] dark:border-[#232a36]">
        <CardContent className="p-0 h-full">
          <div className="flex flex-col h-full">
            {/* Content area with fixed height and internal scroll to prevent layout shift */}
            <div className="relative flex-1">
              {/* Question view */}
              <div className={`absolute inset-0 overflow-auto p-8 ${showAnswer ? 'hidden' : 'block'}`}>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Question</h3>
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap dark:text-gray-200">
                    {currentCard.question}
                  </p>
                </div>
              </div>
              {/* Answer view */}
              <div className={`absolute inset-0 overflow-auto p-8 ${showAnswer ? 'block' : 'hidden'}`}>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Answer</h3>
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap dark:text-gray-200">
                    {currentCard.answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions pinned under content to keep height consistent */}
            <div className="border-t p-4 flex items-center justify-center dark:border-[#232a36]">
              <Button onClick={toggleAnswer} className="flex items-center space-x-2">
                {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showAnswer ? 'Hide Answer' : 'Show Answer'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={generateFlashcards}
            disabled={generating}
            className="flex items-center space-x-1"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{generating ? 'Generating...' : 'Regenerate'}</span>
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
          className="flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

