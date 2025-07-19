import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/animations/variants'
import { useReducedMotion } from '@/hooks/useAnimations'

export const AnimatedButton = ({ 
  children, 
  className = '', 
  isLoading = false,
  variant = 'default',
  size = 'default',
  disabled = false,
  ...props 
}) => {
  const prefersReducedMotion = useReducedMotion()

  const variants = prefersReducedMotion ? {
    initial: { scale: 1 },
    hover: { scale: 1 },
    tap: { scale: 1 },
    loading: { scale: 1 }
  } : buttonVariants

  const animationProps = {
    variants,
    initial: "initial",
    whileHover: !disabled && !isLoading ? "hover" : undefined,
    whileTap: !disabled && !isLoading ? "tap" : undefined,
    animate: isLoading ? "loading" : "initial"
  }

  return (
    <motion.div {...animationProps}>
      <Button
        className={`btn-interactive ${className}`}
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: prefersReducedMotion ? 0 : 360 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 1,
                repeat: prefersReducedMotion ? 0 : Infinity,
                ease: "linear"
              }}
            />
            <span>Processing...</span>
          </div>
        ) : (
          children
        )}
      </Button>
    </motion.div>
  )
}

export const AnimatedIconButton = ({ 
  icon: Icon, 
  children, 
  className = '', 
  iconClassName = '',
  isLoading = false,
  ...props 
}) => {
  const prefersReducedMotion = useReducedMotion()

  const iconVariants = prefersReducedMotion ? {
    initial: { rotate: 0, scale: 1 },
    hover: { rotate: 0, scale: 1 },
    loading: { rotate: 0 }
  } : {
    initial: { rotate: 0, scale: 1 },
    hover: { rotate: 2, scale: 1.05 },
    loading: { rotate: 360 }
  }

  return (
    <AnimatedButton
      className={className}
      isLoading={isLoading}
      {...props}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <motion.div
            variants={iconVariants}
            initial="initial"
            whileHover="hover"
            animate={isLoading ? "loading" : "initial"}
            transition={{
              duration: isLoading ? (prefersReducedMotion ? 0 : 1.2) : 0.15,
              repeat: isLoading ? (prefersReducedMotion ? 0 : Infinity) : 0,
              ease: isLoading ? "linear" : "easeOut"
            }}
          >
            <Icon className={`w-4 h-4 ${iconClassName}`} />
          </motion.div>
        )}
        {children}
      </div>
    </AnimatedButton>
  )
}

export const AnimatedFloatingButton = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const prefersReducedMotion = useReducedMotion()

  const floatingVariants = prefersReducedMotion ? {
    animate: { y: 0 }
  } : {
    animate: {
      y: [-2, 2, -2],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      variants={floatingVariants}
      animate="animate"
    >
      <AnimatedButton
        className={`shadow-lg ${className}`}
        {...props}
      >
        {children}
      </AnimatedButton>
    </motion.div>
  )
}

export const AnimatedPulseButton = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const prefersReducedMotion = useReducedMotion()

  const pulseVariants = prefersReducedMotion ? {
    animate: { scale: 1 }
  } : {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      variants={pulseVariants}
      animate="animate"
    >
      <AnimatedButton
        className={`pulse-glow ${className}`}
        {...props}
      >
        {children}
      </AnimatedButton>
    </motion.div>
  )
}

