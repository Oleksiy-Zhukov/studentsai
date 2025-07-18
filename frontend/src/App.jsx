import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUpload } from './components/FileUpload'
import { ActionSelector } from './components/ActionSelector'
import { ResultDisplay } from './components/ResultDisplay'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
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

  const handleProcess = async (textContent, action, additionalInstructions = '') => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          text_content: textContent,
          additional_instructions: additionalInstructions
        })
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
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <motion.main 
        ref={mainRef}
        variants={pageVariants}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        className="container mx-auto px-6 py-12 max-w-4xl"
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
            className="text-center space-y-4 py-8"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold gradient-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Transform Your Learning
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Upload your study materials and let AI help you summarize, create questions, 
              and plan your learning journey with intelligent insights.
            </motion.p>
          </motion.section>

          {/* File Upload Section */}
          <motion.section 
            variants={sectionVariants} 
            className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto"
          >
            <AnimatedCard className="overflow-hidden border border-border shadow-sm rounded-2xl">
              <AnimatedCardHeader className="px-6 pt-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={prefersReducedMotion ? {} : {
                      rotate: [0, 10, -10, 0],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                    className="text-2xl"
                  >
                    📁
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Upload Your Content
                  </h2>
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  Start by uploading a document or pasting your text content
                </p>
              </AnimatedCardHeader>
              <AnimatedCardContent className="px-6 pb-6 pt-2">
                <FileUpload onFileUpload={handleFileUpload} />
              </AnimatedCardContent>
            </AnimatedCard>
          </motion.section>


          {/* Action Selection Section */}
          <AnimatePresence>
            {uploadedContent && (
              <motion.section 
                variants={sectionVariants} 
                initial="initial" 
                animate="animate" 
                exit="exit"
                className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto"
              >
                <AnimatedCard className="overflow-hidden border border-border shadow-sm rounded-2xl" delay={0.2}>
                  <AnimatedCardHeader className="px-6 pt-6">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={prefersReducedMotion ? {} : {
                          scale: [1, 1.1, 1],
                          transition: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                        className="text-2xl"
                      >
                        🎯
                      </motion.div>
                      <h2 className="text-2xl font-semibold text-foreground">
                        Choose Your Action
                      </h2>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm">
                      Select how you'd like AI to help with your content
                    </p>
                  </AnimatedCardHeader>

                  <AnimatedCardContent className="px-6 pb-6 pt-2">
                    <ActionSelector 
                      onActionSelect={handleActionSelect}
                      selectedAction={selectedAction}
                      textContent={uploadedContent}
                      onProcess={handleProcess}
                      isLoading={isLoading}
                    />
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.section>
            )}
          </AnimatePresence>


          {/* Results Section */}
          <AnimatePresence>
            {(result || error || isLoading) && (
              <motion.section 
                variants={sectionVariants} 
                initial="initial" 
                animate="animate" 
                exit="exit"
                className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto"
              >
                <AnimatedCard className="overflow-hidden border border-border shadow-sm rounded-2xl" delay={0.3}>
                  <AnimatedCardHeader className="px-6 pt-6">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={prefersReducedMotion ? {} : {
                          rotate: [0, 360],
                          transition: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }
                        }}
                        className="text-2xl"
                      >
                        ✨
                      </motion.div>
                      <h2 className="text-2xl font-semibold text-foreground">
                        Results
                      </h2>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm">
                      {isLoading 
                        ? 'AI is processing your content...' 
                        : "Here's what AI generated for you"}
                    </p>
                  </AnimatedCardHeader>

                  <AnimatedCardContent className="px-6 pb-6 pt-2">
                    <ResultDisplay 
                      result={result}
                      error={error}
                      isLoading={isLoading}
                    />
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.section>
            )}
          </AnimatePresence>


          {/* Getting Started Guide */}
          {!uploadedContent && (
            <motion.section 
              variants={sectionVariants}
              className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto"
            >
              <AnimatedCard className="overflow-hidden border border-border shadow-sm rounded-2xl bg-primary/5">
                <AnimatedCardHeader className="px-6 pt-6">
                  <motion.div
                    animate={prefersReducedMotion ? {} : {
                      y: [-5, 5, -5],
                      transition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                    className="text-3xl mb-4 text-center"
                  >
                  🚀
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-primary text-center">
                    Ready to Get Started?
                  </h2>
                  <p className="text-muted-foreground mt-3 text-sm text-center">
                    Upload a document or paste your text above to begin your AI-powered learning journey.
                  </p>
                </AnimatedCardHeader>

                <AnimatedCardContent className="px-6 pb-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    {["Upload content", "Choose action", "Get AI insights"].map((step, index) => (
                      <div key={step} className="flex items-center space-x-3">
                        <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>
            </motion.section>
          )}


        </motion.div>
      </motion.main>

      <Footer />
      <Toaster />
    </div>
  )
}

export default App

