import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUpload } from './components/FileUpload'
import { ActionSelector } from './components/ActionSelector'
import { ResultDisplay } from './components/ResultDisplay'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { RecaptchaWrapper, useRecaptcha } from './components/RecaptchaWrapper'
import { RecaptchaProvider } from './components/RecaptchaProvider'
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent } from './components/animated/AnimatedCard'
import { Toaster } from '@/components/ui/sonner'
import { useScrollAnimation, useReducedMotion } from './hooks/useAnimations'
import { pageVariants, staggerContainer, staggerItem } from './animations/variants'
import './App.css'

function App() {
  const [uploadedContent, setUploadedContent] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { ref: mainRef, isInView } = useScrollAnimation()
  const prefersReducedMotion = useReducedMotion()

    // reCAPTCHA hook
  const recaptcha = useRecaptcha()

  const handleFileUpload = (content) => {
    setUploadedContent(content)
    setResult(null)
    setError(null)
    setSelectedAction('')
  }

  const handleActionSelect = (action) => {
    setSelectedAction(action)
    setResult(null)
    setError(null)
  }

   const handleProcess = async (textContent, action, additionalInstructions = '', recaptchaToken = '') => {
    setIsLoading(true)
    setError(null)
    setResult(null)

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

  const containerVariants = prefersReducedMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  } : {
    ...staggerContainer,
    animate: {
      ...staggerContainer.animate,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const sectionVariants = prefersReducedMotion ? {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 }
  } : staggerItem

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
          
          <main 
            ref={mainRef}
            className="container mx-auto px-4 py-8 max-w-6xl"
          >
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="space-y-12"
            >
              {/* Hero Section */}
              <motion.section
                variants={sectionVariants}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-4"
                >
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Student AI Toolkit
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Transform your study materials with AI-powered tools. Summarize, generate questions, 
                    create study plans, and build flashcards—all in one place.
                  </p>
                </motion.div>
              </motion.section>

              {/* File Upload Section */}
              <motion.section
                variants={sectionVariants}
                className="space-y-6"
              >
                <AnimatedCard className="glass-card">
                  <AnimatedCardHeader>
                    <h2 className="text-2xl font-semibold text-foreground">Upload Your Content</h2>
                    <p className="text-muted-foreground">
                      Upload a document or paste text to get started
                    </p>
                  </AnimatedCardHeader>
                  <AnimatedCardContent>
                    <FileUpload onFileUpload={handleFileUpload} />
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.section>

              {/* Action Selector Section */}
              {uploadedContent && (
                <motion.section
                  variants={sectionVariants}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground">Choose Your AI Action</h2>
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
                </motion.section>
              )}

              {/* Results Section */}
              <AnimatePresence mode="wait">
                {(result || error || isLoading) && (
                  <motion.section
                    variants={sectionVariants}
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <ResultDisplay
                      result={result}
                      error={error}
                      isLoading={isLoading}
                    />
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
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
