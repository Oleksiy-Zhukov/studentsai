import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Download, CheckCircle, AlertCircle, FileText, HelpCircle, Calendar, RefreshCw, CreditCard, ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { EnhancedCard, CardContent, CardHeader, CardTitle } from './ui/enhanced-card'
import { AnimatedButton, AnimatedIconButton } from './animated/AnimatedButton'
import { LoadingSpinner, LoadingText } from './animated/LoadingSpinner'
import { useTypingAnimation, useReducedMotion } from '@/hooks/useAnimations'
import { resultVariants, successVariants, errorVariants } from '@/animations/variants'
import { formatDate } from '@/lib/utils'

const actionIcons = {
  summarize: FileText,
  generate_questions: HelpCircle,
  plan_study: Calendar,
  flashcards: CreditCard
}

const actionTitles = {
  summarize: 'Summary',
  generate_questions: 'Study Questions',
  plan_study: 'Study Plan',
  flashcards: 'Flashcards'
}

const actionColors = {
  summarize: 'text-blue-600 bg-blue-50 border-blue-200',
  generate_questions: 'text-green-600 bg-green-50 border-green-200',
  plan_study: 'text-purple-600 bg-purple-50 border-purple-200',
  flashcards: 'text-orange-600 bg-orange-50 border-orange-200'
}

export const ResultDisplay = ({ result, error, isLoading }) => {
  const [copySuccess, setCopySuccess] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const contentRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  
  // Use typing animation for the result text
  const { displayText, isTyping } = useTypingAnimation(
    result?.result || '', 
    prefersReducedMotion ? 0 : 15
  )

  const handleCopy = async () => {
    if (result?.result) {
      try {
        await navigator.clipboard.writeText(result.result)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
    }
  }

  const handleDownload = () => {
    if (result?.result) {
      const actionTitle = actionTitles[result.action] || 'Result'
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${actionTitle.toLowerCase().replace(' ', '_')}_${timestamp}.txt`
      
      const blob = new Blob([result.result], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <motion.div
        variants={resultVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <EnhancedCard variant="elevated">
          <CardContent className="p-12">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <LoadingSpinner size="lg" variant="spin" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                />
              </div>
              <div className="text-center space-y-3">
                <LoadingText text="Processing your content" variant="dots" />
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  Our AI is analyzing your content and generating the requested output. 
                  This may take a few moments.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Using {result?.backend || 'AI'} backend</span>
              </div>
            </div>
          </CardContent>
        </EnhancedCard>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        variants={errorVariants}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        <EnhancedCard variant="default" className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xl font-semibold text-destructive mb-2">Processing Error</h3>
                  <p className="text-sm text-destructive/80 leading-relaxed">{error}</p>
                </div>
                <div className="flex space-x-3">
                  <AnimatedButton
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-destructive/20 text-destructive hover:bg-destructive/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </CardContent>
        </EnhancedCard>
      </motion.div>
    )
  }

  if (!result) {
    return null
  }

  const ActionIcon = actionIcons[result.action] || FileText
  const actionTitle = actionTitles[result.action] || 'Result'
  const actionColor = actionColors[result.action] || actionColors.summarize

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result.action}
        variants={resultVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
      >
        {/* Result Header */}
        <EnhancedCard variant="elevated">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { 
                    scale: 1.1, 
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                  className={`p-3 rounded-xl ${actionColor}`}
                >
                  <ActionIcon className="w-6 h-6" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl">{actionTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generated on {formatDate(new Date())}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <AnimatedIconButton
                  icon={Copy}
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={`${
                    copySuccess 
                      ? 'bg-green-50 border-green-200 text-green-600' 
                      : 'hover:bg-primary/5'
                  } transition-all duration-200`}
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </AnimatedIconButton>
                
                <AnimatedIconButton
                  icon={Download}
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className={`${
                    downloadSuccess 
                      ? 'bg-green-50 border-green-200 text-green-600' 
                      : 'hover:bg-primary/5'
                  } transition-all duration-200`}
                >
                  {downloadSuccess ? 'Downloaded!' : 'Download'}
                </AnimatedIconButton>
              </div>
            </div>
          </CardHeader>
        </EnhancedCard>

        {/* Result Content */}
        <EnhancedCard variant="default" className="overflow-hidden">
          <CardContent className="p-8">
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="prose prose-lg max-w-none dark:prose-invert"
            >
              {prefersReducedMotion ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="text-foreground leading-relaxed"
                  components={{
                    h1: ({node, ...props}) => (
                      <h1 className="text-3xl font-bold mb-6 text-foreground border-b border-border pb-2" {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8 first:mt-0" {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 className="text-xl font-medium mb-3 text-foreground mt-6" {...props} />
                    ),
                    p: ({node, ...props}) => (
                      <p className="mb-4 text-foreground leading-relaxed" {...props} />
                    ),
                    ul: ({node, ...props}) => (
                      <ul className="list-disc list-inside mb-4 space-y-2 ml-4" {...props} />
                    ),
                    ol: ({node, ...props}) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2 ml-4" {...props} />
                    ),
                    li: ({node, ...props}) => (
                      <li className="text-foreground leading-relaxed" {...props} />
                    ),
                    strong: ({node, ...props}) => (
                      <strong className="font-semibold text-foreground" {...props} />
                    ),
                    em: ({node, ...props}) => (
                      <em className="italic text-foreground" {...props} />
                    ),
                    code: ({node, inline, ...props}) => 
                      inline ? (
                        <code className="bg-muted px-2 py-1 rounded-md text-sm font-mono text-primary" {...props} />
                      ) : (
                        <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto border" {...props} />
                      ),
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4 bg-muted/30 py-2 rounded-r-lg" {...props} />
                    ),
                    a: ({node, ...props}) => (
                      <a className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors" {...props} />
                    ),
                  }}
                >
                  {result.result}
                </ReactMarkdown>
              ) : (
                <div className="relative">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="text-foreground leading-relaxed"
                    components={{
                      h1: ({node, ...props}) => (
                        <h1 className="text-3xl font-bold mb-6 text-foreground border-b border-border pb-2" {...props} />
                      ),
                      h2: ({node, ...props}) => (
                        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8 first:mt-0" {...props} />
                      ),
                      h3: ({node, ...props}) => (
                        <h3 className="text-xl font-medium mb-3 text-foreground mt-6" {...props} />
                      ),
                      p: ({node, ...props}) => (
                        <p className="mb-4 text-foreground leading-relaxed" {...props} />
                      ),
                      ul: ({node, ...props}) => (
                        <ul className="list-disc list-inside mb-4 space-y-2 ml-4" {...props} />
                      ),
                      ol: ({node, ...props}) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2 ml-4" {...props} />
                      ),
                      li: ({node, ...props}) => (
                        <li className="text-foreground leading-relaxed" {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className="font-semibold text-foreground" {...props} />
                      ),
                      em: ({node, ...props}) => (
                        <em className="italic text-foreground" {...props} />
                      ),
                      code: ({node, inline, ...props}) => 
                        inline ? (
                          <code className="bg-muted px-2 py-1 rounded-md text-sm font-mono text-primary" {...props} />
                        ) : (
                          <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto border" {...props} />
                        ),
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4 bg-muted/30 py-2 rounded-r-lg" {...props} />
                      ),
                      a: ({node, ...props}) => (
                        <a className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors" {...props} />
                      ),
                    }}
                  >
                    {displayText}
                  </ReactMarkdown>
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-6 bg-primary ml-1"
                    />
                  )}
                </div>
              )}
            </motion.div>
          </CardContent>
        </EnhancedCard>

        {/* Backend Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Generated successfully</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Backend:</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                {result.backend}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Characters:</span>
              <span className="px-2 py-1 bg-muted text-foreground rounded-md text-xs font-medium">
                {result.result.length.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Success Feedback */}
        <AnimatePresence>
          {(copySuccess || downloadSuccess) && (
            <motion.div
              variants={successVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                {copySuccess ? 'Copied to clipboard!' : 'Downloaded successfully!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

