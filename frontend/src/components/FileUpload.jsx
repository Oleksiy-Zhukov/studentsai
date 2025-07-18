import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { AnimatedButton, AnimatedIconButton } from './animated/AnimatedButton'
import { LoadingSpinner, ProgressSpinner } from './animated/LoadingSpinner'
import { useReducedMotion, useProgressAnimation } from '@/hooks/useAnimations'
import { uploadZoneVariants, successVariants, errorVariants } from '@/animations/variants'

export const FileUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const animatedProgress = useProgressAnimation(uploadProgress, 1000)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = async (selectedFile) => {
    setError('')
    setSuccess('')
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, TXT, or DOCX file.')
      return
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    setFile(selectedFile)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 20
        })
      }, 200)

      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data = await response.json()
      setSuccess('File uploaded successfully!')
      onFileUpload(data.text_content)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleTextSubmit = () => {
    if (textContent.trim()) {
      setError('')
      setSuccess('Text content loaded!')
      onFileUpload(textContent)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const clearFile = () => {
    setFile(null)
    setUploadProgress(0)
    setError('')
    setSuccess('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearText = () => {
    setTextContent('')
    setError('')
    setSuccess('')
  }

  const uploadZoneProps = prefersReducedMotion ? {} : {
    variants: uploadZoneVariants,
    initial: "initial",
    animate: dragActive ? "dragOver" : "initial",
    whileHover: { scale: 1.01 },
    transition: { duration: 0.2 }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Zone */}
      <motion.div
        {...uploadZoneProps}
        className={`upload-zone relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          dragActive ? 'border-primary bg-primary/5 scale-102' : 'border-muted-foreground/30'
        } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-primary/50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.docx"
          onChange={handleFileInputChange}
          disabled={isUploading}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <LoadingSpinner size="lg" variant="spin" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Uploading file...</p>
                <div className="max-w-xs mx-auto">
                  <Progress value={animatedProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(animatedProgress)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ) : file ? (
            <motion.div
              key="file-selected"
              variants={successVariants}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-6 h-6 text-green-500" />
                <File className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  clearFile()
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </AnimatedButton>
            </motion.div>
          ) : (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <motion.div
                className="float"
                animate={prefersReducedMotion ? {} : {
                  y: [-5, 5, -5],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Upload className="w-12 h-12 text-primary mx-auto" />
              </motion.div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drop your file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports PDF, TXT, and DOCX files up to 10MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Text Input Alternative */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <div className="h-px bg-border flex-1" />
            <span className="text-sm text-muted-foreground px-2">Or enter text directly</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="space-y-3">
            <Textarea
              placeholder="Paste your content here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isUploading}
            />
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {textContent.length} characters
              </p>
              
              <div className="flex space-x-2">
                {textContent && (
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={clearText}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </AnimatedButton>
                )}
                
                <AnimatedIconButton
                  icon={Check}
                  variant="default"
                  size="sm"
                  onClick={handleTextSubmit}
                  disabled={!textContent.trim() || isUploading}
                >
                  Use This Text
                </AnimatedIconButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            variants={errorVariants}
            initial="initial"
            animate="animate"
            exit="initial"
            className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            variants={successVariants}
            initial="initial"
            animate="animate"
            exit="initial"
            className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <Check className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

