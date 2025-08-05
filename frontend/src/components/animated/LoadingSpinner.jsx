import React from 'react'

import { useReducedMotion } from '@/hooks/useAnimations'

export const LoadingSpinner = ({ 
  size = 'md', 
  className = '',
  color = 'primary',
  variant = 'spin'
}) => {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    muted: 'border-muted-foreground',
    white: 'border-white'
  }

  if (variant === 'spin') {
    return (
      <motion.div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full ${className}`}
        animate={{ rotate: prefersReducedMotion ? 0 : 360 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 1,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "linear"
        }}
      />
    )
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} bg-primary rounded-full ${className}`}
        animate={{ 
          scale: prefersReducedMotion ? 1 : [1, 1.2, 1],
          opacity: prefersReducedMotion ? 1 : [1, 0.7, 1]
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 1.5,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut"
        }}
      />
    )
  }

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 bg-primary rounded-full`}
            animate={{ 
              y: prefersReducedMotion ? 0 : [-4, 4, -4],
              opacity: prefersReducedMotion ? 1 : [1, 0.5, 1]
            }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              repeat: prefersReducedMotion ? 0 : Infinity,
              delay: prefersReducedMotion ? 0 : index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'bars') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="w-1 bg-primary rounded-full"
            style={{ height: '16px' }}
            animate={{ 
              scaleY: prefersReducedMotion ? 1 : [1, 2, 1],
              opacity: prefersReducedMotion ? 1 : [1, 0.7, 1]
            }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.8,
              repeat: prefersReducedMotion ? 0 : Infinity,
              delay: prefersReducedMotion ? 0 : index * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    )
  }

  return null
}

export const LoadingOverlay = ({ 
  isVisible, 
  message = 'Loading...', 
  className = '' 
}) => {
  const prefersReducedMotion = useReducedMotion()

  const overlayVariants = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  } : {
    hidden: { 
      opacity: 0,
      backdropFilter: 'blur(0px)'
    },
    visible: { 
      opacity: 1,
      backdropFilter: 'blur(4px)',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const contentVariants = prefersReducedMotion ? {
    hidden: { opacity: 0, scale: 1 },
    visible: { opacity: 1, scale: 1 }
  } : {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "backOut",
        delay: 0.1
      }
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}
    >
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="bg-card p-6 rounded-lg shadow-lg border flex flex-col items-center space-y-4"
      >
        <LoadingSpinner size="lg" variant="spin" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </motion.div>
    </motion.div>
  )
}

export const LoadingText = ({ 
  text = 'Loading', 
  className = '',
  variant = 'dots'
}) => {
  const prefersReducedMotion = useReducedMotion()

  if (variant === 'dots') {
    return (
      <div className={`flex items-center ${className}`}>
        <span>{text}</span>
        <div className="flex ml-1">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              animate={{ 
                opacity: prefersReducedMotion ? 1 : [0, 1, 0]
              }}
              transition={{
                duration: prefersReducedMotion ? 0 : 1.5,
                repeat: prefersReducedMotion ? 0 : Infinity,
                delay: prefersReducedMotion ? 0 : index * 0.5,
                ease: "easeInOut"
              }}
            >
              .
            </motion.span>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'typing') {
    return (
      <motion.span
        className={`typing ${className}`}
        animate={{ opacity: prefersReducedMotion ? 1 : [1, 1, 0] }}
        transition={{
          duration: prefersReducedMotion ? 0 : 1,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut"
        }}
      >
        {text}
      </motion.span>
    )
  }

  return <span className={className}>{text}</span>
}

export const ProgressSpinner = ({ 
  progress = 0, 
  size = 'md', 
  className = '',
  showPercentage = true
}) => {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 50 50"
      >
        {/* Background circle */}
        <circle
          cx="25"
          cy="25"
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx="25"
          cy="25"
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="text-primary"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: prefersReducedMotion ? strokeDashoffset : circumference
          }}
          animate={{
            strokeDashoffset: strokeDashoffset
          }}
          transition={{
            duration: prefersReducedMotion ? 0.1 : 0.5,
            ease: "easeOut"
          }}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-xs font-medium"
            animate={{ opacity: prefersReducedMotion ? 1 : [0, 1] }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      )}
    </div>
  )
}

