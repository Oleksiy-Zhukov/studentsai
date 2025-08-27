'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api, type Flashcard, type FlashcardReviewResult } from '@/lib/api'
import { 
  Search, 
  Filter, 
  RefreshCw,
  Play,
  Tag,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react'

// SVG Icons for mastery indicators
const MasteryIcon = ({ level }: { level: number }) => {
  if (level >= 80) {
    return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
  } else if (level >= 50) {
    return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
  } else {
    return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
  }
}

const VerdictIcon = ({ verdict }: { verdict: string }) => {
  if (verdict === 'correct') {
    return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
  } else if (verdict === 'partial') {
    return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
  } else {
    return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
  }
}

export default function FlashcardDashboard() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [studyMode, setStudyMode] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewResult, setReviewResult] = useState<FlashcardReviewResult | null>(null)
  const [qualityRating, setQualityRating] = useState(3) // Default quality rating
  // Remove emojis from AI feedback or other text to meet branding requirements
  const removeEmojis = (text: string) =>
    text.replace(/[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{2700}-\u{27BF}\u{2600}-\u{26FF}\u{FE0F}]/gu, '')

  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    loadFlashcards()
  }, [])

  useEffect(() => {
    // Update filtered flashcards when search or tags change
    filterFlashcards()
  }, [flashcards, searchQuery, selectedTags])

  useEffect(() => {
    // Reset current card index when filters change
    if (studyMode) {
      setCurrentCardIndex(0)
      setShowAnswer(false)
      setUserAnswer('')
      setReviewResult(null)
      setQualityRating(3)
    }
  }, [filteredFlashcards])

  const loadFlashcards = async () => {
    try {
      setLoading(true)
      const response = await api.getUserFlashcards(selectedTags, searchQuery)
      setFlashcards(response)
      
      // Extract unique tags from all flashcards
      const allTags = new Set<string>()
      response.forEach(flashcard => {
        if (flashcard.tags) {
          flashcard.tags.forEach(tag => allTags.add(tag))
        }
      })
      setAvailableTags(Array.from(allTags).sort())
    } catch (error) {
      console.error('Failed to load flashcards:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterFlashcards = () => {
    let filtered = [...flashcards]
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(flashcard => 
        flashcard.question.toLowerCase().includes(query) ||
        flashcard.answer.toLowerCase().includes(query)
      )
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(flashcard => 
        flashcard.tags && selectedTags.some(tag => flashcard.tags!.includes(tag))
      )
    }
    
    setFilteredFlashcards(filtered)
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const response = await api.getUserFlashcards(selectedTags, searchQuery)
      setFlashcards(response)
    } catch (error) {
      console.error('Failed to search flashcards:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
  }

  const startStudyMode = () => {
    if (filteredFlashcards.length === 0) return
    setStudyMode(true)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setUserAnswer('')
    setReviewResult(null)
    setQualityRating(3) // Reset quality rating
  }

  const exitStudyMode = () => {
    setStudyMode(false)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setUserAnswer('')
    setReviewResult(null)
    setQualityRating(3) // Reset quality rating
  }

  const nextCard = () => {
    if (currentCardIndex < filteredFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
      setUserAnswer('')
      setReviewResult(null)
      setQualityRating(3) // Reset quality rating
    }
  }

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
      setUserAnswer('')
      setReviewResult(null)
      setQualityRating(3) // Reset quality rating
    }
  }

  const handleReview = async () => {
    if (!userAnswer.trim() || !filteredFlashcards[currentCardIndex]) return

    try {
      setIsReviewing(true)
      const result = await api.reviewFlashcardEnhanced(
        filteredFlashcards[currentCardIndex].id,
        userAnswer,
        undefined // Don't send quality rating initially - let AI evaluate first
      )
      setReviewResult(result)
      // Automatically show the answer after review
      setShowAnswer(true)
    } catch (err) {
      console.error('Failed to review flashcard:', err)
    } finally {
      setIsReviewing(false)
    }
  }

  const overrideRating = (rating: number) => {
    setQualityRating(rating)
    // TODO: Send updated rating to backend
  }

  if (studyMode && filteredFlashcards.length > 0) {
    const currentCard = filteredFlashcards[currentCardIndex]
    const isFirst = currentCardIndex === 0
    const isLast = currentCardIndex === filteredFlashcards.length - 1

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Study Header */}
        <Card className="bg-white dark:bg-[#141820] border-gray-200 dark:border-[#232a36] shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[#232a36]">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                Study Mode
              </CardTitle>
              <Button
                variant="outline"
                onClick={exitStudyMode}
                className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shadow-sm bg-white dark:bg-gray-800"
              >
                Exit Study Mode
              </Button>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Card {currentCardIndex + 1} of {filteredFlashcards.length}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Mastery: {currentCard.mastery_level || 0}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Reviews: {currentCard.review_count || 0}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!showAnswer ? (
              <div className="space-y-6">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    Question
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                    {currentCard.question}
                  </h3>
                  
                  <div className="max-w-md mx-auto space-y-4">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="text-center text-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-colors"
                    />
                    <Button
                      onClick={handleReview}
                      disabled={!userAnswer.trim() || isReviewing}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors border-0"
                    >
                      {isReviewing ? 'Analyzing...' : 'Submit Answer'}
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Beta feature: AI will analyze your answer and provide feedback
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                  Answer
                </div>
                <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                  {currentCard.answer}
                </h3>

                {/* Review Result */}
                {reviewResult && (
                  <div className="max-w-md mx-auto p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">AI Feedback</h4>
                    <p className="text-blue-800 dark:text-blue-200 mb-3">{removeEmojis(reviewResult.feedback)}</p>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">Score:</span>
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                          {reviewResult.ai_score}/100
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">Quality:</span>
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                          {reviewResult.verdict === 'correct' ? '5/5' : 
                           reviewResult.verdict === 'partial' ? '3/5' : '1/5'}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">Mastery:</span>
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                          {currentCard.mastery_level || 0}%
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                        <VerdictIcon verdict={reviewResult.verdict} />
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                          {reviewResult.verdict === 'correct' ? 'Excellent' : 
                           reviewResult.verdict === 'partial' ? 'Good' : 'Needs Work'}
                        </span>
                      </div>
                    </div>

                    {/* SRS Progress */}
                    {reviewResult.srs_data && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learning Progress</h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">E-Factor:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {reviewResult.srs_data.efactor.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Next Review:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {new Date(reviewResult.srs_data.next_review_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Repetitions:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {reviewResult.srs_data.repetitions}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Interval:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {reviewResult.srs_data.interval_days} days
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAnswer(!showAnswer)}
              variant="outline"
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shadow-sm bg-white dark:bg-gray-800"
            >
              {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </Button>

            {/* Quality Rating */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rate your performance:</span>
              <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant="outline"
                        size="sm"
                        onClick={() => overrideRating(rating)}
                        disabled={isReviewing}
                        className={`w-8 h-8 p-0 transition-all ${
                          qualityRating === rating 
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm hover:bg-orange-700' 
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800'
                        }`}
                      >
                        {rating}
                      </Button>
                    ))}
              </div>
              {reviewResult && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  AI: {reviewResult.verdict === 'correct' ? '5/5' : 
                       reviewResult.verdict === 'partial' ? '3/5' : '1/5'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={previousCard}
              disabled={isFirst}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm bg-white dark:bg-gray-800"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={nextCard}
              disabled={isLast}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shadow-sm bg-white dark:bg-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <Card className="bg-white dark:bg-[#141820] border-gray-200 dark:border-[#232a36] shadow-sm">
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[#232a36]">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Filter className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Flashcards ({flashcards.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Button 
            variant="outline" 
            onClick={loadFlashcards}
            className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shadow-sm bg-white dark:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Flashcards List */}
      {flashcards.length === 0 ? (
        <Card className="bg-white dark:bg-[#141820] border-gray-200 dark:border-[#232a36] shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <img src="/icons/flashcards-icon.svg" alt="Flashcards" className="w-full h-full opacity-60" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No flashcards yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create flashcards from your notes to start studying
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and Filter Controls */}
          <Card className="bg-white dark:bg-[#141820] border-gray-200 dark:border-[#232a36] shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[#232a36]">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Search className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Search Input */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search flashcards by question or answer..."
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800"
                >
                  Clear
                </Button>
              </div>

              {/* Available Tags */}
              {availableTags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Filter by Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        onClick={() => toggleTag(tag)}
                        className={`cursor-pointer transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Showing {filteredFlashcards.length} of {flashcards.length} flashcards
                </span>
                {selectedTags.length > 0 && (
                  <span>
                    Filtered by: {selectedTags.join(', ')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Flashcards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlashcards.map((flashcard) => (
              <Card 
                key={flashcard.id} 
                className="hover:shadow-md transition-all duration-200 cursor-pointer bg-white dark:bg-[#141820] border-gray-200 dark:border-[#232a36] hover:border-orange-300 dark:hover:border-orange-600"
              >
                <CardContent className="p-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 line-clamp-2">
                    {flashcard.question}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MasteryIcon level={flashcard.mastery_level || 0} />
                      <span>{flashcard.mastery_level || 0}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{flashcard.review_count || 0}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {flashcard.tags && flashcard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {flashcard.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={startStudyMode}
                    className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shadow-sm bg-white dark:bg-gray-800"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Study
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

