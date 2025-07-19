import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Github, Moon, Sun, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedButton } from './animated/AnimatedButton'
import { useReducedMotion } from '@/hooks/useAnimations'

export const Header = () => {
  const [isDark, setIsDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const headerVariants = prefersReducedMotion ? {
    initial: { y: 0 },
    scrolled: { y: 0 }
  } : {
    initial: { 
      y: 0,
      backdropFilter: 'blur(0px)',
      backgroundColor: 'rgba(255, 255, 255, 0)'
    },
    scrolled: { 
      y: 0,
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const logoVariants = prefersReducedMotion ? {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1, rotate: 0 }
  } : {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.05, 
      rotate: 5,
      transition: { duration: 0.2 }
    }
  }

  const sparkleVariants = prefersReducedMotion ? {
    animate: { scale: 1, rotate: 0 }
  } : {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate={scrolled ? "scrolled" : "initial"}
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-background'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-3"
            variants={logoVariants}
            initial="initial"
            whileHover="hover"
          >
            <div className="relative">
              <motion.div
                className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg"
                whileHover={prefersReducedMotion ? {} : {
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
                  transition: { duration: 0.2 }
                }}
              >
                <Brain className="w-6 h-6 text-primary" />
              </motion.div>
              
              {/* Floating sparkle */}
              <motion.div
                variants={sparkleVariants}
                animate="animate"
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-3 h-3 text-yellow-500" />
              </motion.div>
            </div>
            
            <div>
              <motion.h1 
                className="text-xl font-bold gradient-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Student AI Toolkit
              </motion.h1>
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Your intelligent study companion
              </motion.p>
            </div>
          </motion.div>

          {/* Version Badge - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2"
          >
            <div className="flex items-center space-x-1 px-3 py-1 bg-primary/10 rounded-full">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">MVP Version</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Theme Toggle */}
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              <motion.div
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.div>
            </AnimatedButton>

            {/* GitHub Link */}
            <AnimatedButton
              variant="ghost"
              size="sm"
              asChild
              className="p-2"
            >
              <a 
                href="https://github.com/Oleksiy-Zhukov/students-ai-toolkit" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            </AnimatedButton>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
          initial={{ width: "0%" }}
          animate={{ width: scrolled ? "100%" : "0%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.header>
  )
}

