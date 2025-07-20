import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Download, CheckCircle, AlertCircle, FileText, HelpCircle, Calendar, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedButton, AnimatedIconButton } from './animated/AnimatedButton'
import { LoadingSpinner, LoadingText } from './animated/LoadingSpinner'
import { useTypingAnimation, useReducedMotion } from '@/hooks/useAnimations'
import { resultVariants, successVariants, errorVariants } from '@/animations/variants'

const actionIcons = {
  summarize: FileText,
  generate_questions: HelpCircle,
  plan_study: Calendar
}

const actionTitles = {
  summarize: 'Summary',
  generate_questions: 'Study Questions',
  plan_study: 'Study Plan'
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
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner size="lg" variant="spin" />
              <LoadingText text="Processing your content" variant="dots" />
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Our AI is analyzing your content and generating the requested output. 
                This may take a few moments.
              </p>
            </div>
          </CardContent>
        </Card>
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
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-destructive">Processing Error</h3>
                <p className="text-sm text-destructive/80">{error}</p>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="mt-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </AnimatedButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (!result) {
    return null
  }

  const ActionIcon = actionIcons[result.action] || FileText
  const actionTitle = actionTitles[result.action] || 'Result'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result.action}
        variants={resultVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6"
      >
        {/* Result Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={prefersReducedMotion ? {} : { 
                scale: 1.1, 
                rotate: 5,
                transition: { duration: 0.2 }
              }}
              className="p-2 bg-primary/10 rounded-lg"
            >
              <ActionIcon className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{actionTitle}</h3>
              <p className="text-sm text-muted-foreground">
                Generated on {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <AnimatedIconButton
              icon={Copy}
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className={copySuccess ? 'bg-green-50 border-green-200' : ''}
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </AnimatedIconButton>
            
            <AnimatedIconButton
              icon={Download}
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className={downloadSuccess ? 'bg-green-50 border-green-200' : ''}
            >
              {downloadSuccess ? 'Downloaded!' : 'Download'}
            </AnimatedIconButton>
          </div>
        </motion.div>

        {/* Result Content */}
        <Card>
          <CardContent className="p-6">
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="prose prose-sm max-w-none dark:prose-invert"
            >
              {prefersReducedMotion ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="text-foreground leading-relaxed"
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-foreground" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 text-foreground" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2 text-foreground" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 text-foreground leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="text-foreground" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-foreground" {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline ? (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props} />
                      ) : (
                        <code className="block bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
                      ),
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-3" {...props} />
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
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-foreground" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 text-foreground" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2 text-foreground" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 text-foreground leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="text-foreground" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-foreground" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? (
                          <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props} />
                        ) : (
                          <code className="block bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
                        ),
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-3" {...props} />
                      ),
                    }}
                  >
                    {displayText}
                  </ReactMarkdown>
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 bg-primary ml-1"
                    />
                  )}
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>

        {/* Backend Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between text-xs text-muted-foreground"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Generated successfully</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Backend: {result.backend}</span>
            <span>Characters: {result.result.length.toLocaleString()}</span>
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
              className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {copySuccess ? 'Copied to clipboard!' : 'Downloaded successfully!'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

