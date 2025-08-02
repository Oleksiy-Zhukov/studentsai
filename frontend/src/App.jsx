import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <Header />
          
          <main className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-12">
              {/* Hero Section with Progressive Disclosure */}
              <AnimatePresence>
                {showHero && (
                  <motion.section 
                    className="text-center space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <motion.h1 
                    className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    Student AI Toolkit
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    Transform your study materials with AI-powered tools. 
                    <span className="text-primary font-medium"> Summarize</span>, 
                    <span className="text-purple-500 font-medium"> generate questions</span>, 
                    <span className="text-blue-500 font-medium"> create study plans</span>, and 
                    <span className="text-cyan-500 font-medium"> build flashcards</span>—all in one place.
                  </motion.p>
                </motion.div>
              </motion.section>
                )}
              </AnimatePresence>

              {/* File Upload Section */}
              <AnimatePresence>
                {showFileUpload && (
                  <motion.section 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                <motion.div 
                  className="glass-card p-6"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground">Upload Your Content</h2>
                    <p className="text-muted-foreground">
                      Upload a document or paste text to get started
                    </p>
                  </div>
                  <div className="mt-6">
                    <FileUpload onFileUpload={handleFileUpload} />
                  </div>
                </motion.div>
              </motion.section>
                )}
              </AnimatePresence>

              {/* Action Selector Section */}
              <AnimatePresence>
                {showActionSelector && uploadedContent && (
                  <motion.section 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                  <motion.div 
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <h2 className="text-2xl font-semibold text-foreground">Choose Your AI Action</h2>
                    <p className="text-muted-foreground">
                      Select how you'd like to process your content
                    </p>
                  </motion.div>
                  <ActionSelector
                    onActionSelect={handleActionSelect}
                    selectedAction={selectedAction}
                    textContent={uploadedContent}
                    onProcess={handleProcess}
                    isLoading={isLoading}
                  />
                </motion.section>
                )}
              </AnimatePresence>

              {/* Results Section */}
              <AnimatePresence>
                {showResults && (result || error || isLoading) && (
                  <motion.section 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="text-center mb-6">
                      <motion.button
                        onClick={handleReset}
                        className="px-6 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ← Start Over
                      </motion.button>
                    </div>
                    <ResultDisplay
                      result={result}
                      error={error}
                      isLoading={isLoading}
                    />
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          </main>

          <Footer />
        </div>

        <Toaster />
        <RecaptchaWrapper />
      </div>
    </RecaptchaProvider>
  )
}

export default App
