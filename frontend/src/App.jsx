import React, { useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { ActionSelector } from './components/ActionSelector'
import { ResultDisplay } from './components/ResultDisplay'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { RecaptchaWrapper } from './components/RecaptchaWrapper'
import { RecaptchaProvider } from './components/RecaptchaProvider'
import { Toaster } from '@/components/ui/sonner'
import './App.css'

function App() {
  const [uploadedContent, setUploadedContent] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Progressive disclosure state
  const [showHero, setShowHero] = useState(true)
  const [showFileUpload, setShowFileUpload] = useState(true)
  const [showActionSelector, setShowActionSelector] = useState(true)
  const [showResults, setShowResults] = useState(false)
  
  const handleFileUpload = (content) => {
    setUploadedContent(content)
    setResult(null)
    setError(null)
    setSelectedAction('')
    setShowResults(false)
    setShowActionSelector(true)
  }

  const handleActionSelect = (action) => {
    setSelectedAction(action)
    setResult(null)
    setError(null)
    setShowResults(false)
  }

  const handleProcess = async (textContent, action, additionalInstructions = '', recaptchaToken = '') => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    
    // Progressive disclosure: collapse previous sections
    setShowHero(false)
    setShowFileUpload(false)
    setShowActionSelector(false)
    setShowResults(true)

    try {
       const requestBody = {
        action: action,
        text_content: textContent,
        additional_instructions: additionalInstructions
      }

      // Add reCAPTCHA token if provided
      if (recaptchaToken) {
        requestBody.recaptcha_token = recaptchaToken
      }
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Processing failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setUploadedContent('')
    setSelectedAction('')
    setResult(null)
    setError(null)
    setIsLoading(false)
    setShowHero(true)
    setShowFileUpload(true)
    setShowActionSelector(true)
    setShowResults(false)
  }

  return (
    <RecaptchaProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-8">
            {/* Hero Section */}
            {showHero && (
              <section className="min-h-screen flex items-center justify-center py-20">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                  {/* Main Title */}
                  <div className="space-y-6 animate-fade-in-up">
                    <h1 className="text-6xl md:text-8xl font-bold text-foreground tracking-tight">
                      StudentsAI
                    </h1>
                    <div className="w-24 h-1 bg-foreground mx-auto"></div>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed">
                      Transform your study materials with intelligent AI tools
                    </p>
                  </div>

                  {/* Feature Grid - 90s Style */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    <div className="japanese-card space-y-4 p-6 animate-slide-in-left animate-delay-1">
                      <div className="text-3xl japanese-text text-foreground">01</div>
                      <h3 className="text-lg japanese-text text-foreground">Summarize</h3>
                      <p className="text-sm text-muted-foreground">
                        Extract key insights from your content
                      </p>
                    </div>
                    <div className="japanese-card space-y-4 p-6 animate-fade-in-up animate-delay-2">
                      <div className="text-3xl japanese-text text-foreground">02</div>
                      <h3 className="text-lg japanese-text text-foreground">Generate</h3>
                      <p className="text-sm text-muted-foreground">
                        Create study questions and flashcards
                      </p>
                    </div>
                    <div className="japanese-card space-y-4 p-6 animate-slide-in-right animate-delay-3">
                      <div className="text-3xl japanese-text text-foreground">03</div>
                      <h3 className="text-lg japanese-text text-foreground">Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        Build structured study plans
                      </p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="mt-16 space-y-6 animate-fade-in-up animate-delay-3">
                    <p className="text-lg text-muted-foreground">
                      Ready to enhance your learning experience?
                    </p>
                    <button
                      onClick={() => {
                        setShowHero(false)
                        setShowFileUpload(true)
                      }}
                      className="japanese-button text-lg"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* File Upload Section */}
            {showFileUpload && (
              <section className="space-y-4 animate-fade-in-up">
                <div className="japanese-card p-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl japanese-text text-foreground">Upload Your Content</h2>
                    <div className="w-16 h-1 bg-foreground mx-auto"></div>
                    <p className="text-muted-foreground">
                      Upload a document or paste text to get started
                    </p>
                  </div>
                  <div className="mt-8">
                    <FileUpload onFileUpload={handleFileUpload} />
                  </div>
                </div>
              </section>
            )}

            {/* Action Selector Section */}
            {showActionSelector && uploadedContent && (
              <section className="space-y-6 animate-fade-in-up">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl japanese-text text-foreground">Choose Your AI Action</h2>
                  <div className="w-16 h-1 bg-foreground mx-auto"></div>
                  <p className="text-muted-foreground">
                    Select how you'd like to process your content
                  </p>
                </div>
                <ActionSelector
                  onActionSelect={handleActionSelect}
                  selectedAction={selectedAction}
                  textContent={uploadedContent}
                  onProcess={handleProcess}
                  isLoading={isLoading}
                />
              </section>
            )}

            {/* Results Section */}
            {showResults && (result || error || isLoading) && (
              <section className="space-y-6 animate-fade-in-up">
                <div className="text-center mb-6">
                  <button
                    onClick={handleReset}
                    className="japanese-button"
                  >
                    Start Over
                  </button>
                </div>
                <ResultDisplay
                  result={result}
                  error={error}
                  isLoading={isLoading}
                />
              </section>
            )}
          </div>
        </main>

        <Footer />
        <Toaster />
        <RecaptchaWrapper />
      </div>
    </RecaptchaProvider>
  )
}

export default App
