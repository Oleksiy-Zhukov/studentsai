import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Github, ExternalLink, Sparkles, Linkedin, Coffee, User } from 'lucide-react'
import { useIntersectionAnimation, useReducedMotion } from '@/hooks/useAnimations'

export const Footer = () => {
  const { ref, isVisible } = useIntersectionAnimation({ threshold: 0.5 })
  const prefersReducedMotion = useReducedMotion()

  const footerVariants = prefersReducedMotion ? {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  } : {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = prefersReducedMotion ? {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  } : {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  const heartVariants = prefersReducedMotion ? {
    animate: { scale: 1 }
  } : {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const sparkleVariants = prefersReducedMotion ? {
    animate: { rotate: 0, scale: 1 }
  } : {
    animate: {
      rotate: [0, 360],
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  return (
    <motion.footer
      ref={ref}
      variants={footerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="bg-muted/30 border-t mt-16"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Project Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-2">
              <motion.div
                variants={sparkleVariants}
                animate="animate"
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
              <h3 className="font-semibold text-foreground">Student AI Toolkit</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A modern, extensible web-based AI toolkit designed specifically for students. 
              Built with React, FastAPI, and powered by cutting-edge AI models.
            </p>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>MVP - Extensible & Open Source</span>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-semibold text-foreground">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <motion.li 
                className="flex items-center space-x-2"
                whileHover={prefersReducedMotion ? {} : { x: 5, transition: { duration: 0.2 } }}
              >
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>AI-powered content summarization</span>
              </motion.li>
              <motion.li 
                className="flex items-center space-x-2"
                whileHover={prefersReducedMotion ? {} : { x: 5, transition: { duration: 0.2 } }}
              >
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>Intelligent question generation</span>
              </motion.li>
              <motion.li 
                className="flex items-center space-x-2"
                whileHover={prefersReducedMotion ? {} : { x: 5, transition: { duration: 0.2 } }}
              >
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>Personalized study planning</span>
              </motion.li>
              <motion.li 
                className="flex items-center space-x-2"
                whileHover={prefersReducedMotion ? {} : { x: 5, transition: { duration: 0.2 } }}
              >
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>Dual AI backend support</span>
              </motion.li>
            </ul>
          </motion.div>

          {/* Tech Stack */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-semibold text-foreground">Built With</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="space-y-1">
                <div>React 19</div>
                <div>Framer Motion</div>
                <div>Tailwind CSS</div>
                <div>shadcn/ui</div>
              </div>
              <div className="space-y-1">
                <div>FastAPI</div>
                <div>OpenAI API</div>
                <div>HuggingFace</div>
                <div>Vite</div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <motion.a
                href="https://github.com/Oleksiy-Zhukov/students-ai-toolkit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <Github className="w-4 h-4" />
                <span>Source Code</span>
                <ExternalLink className="w-3 h-3" />
              </motion.a>
            </div>
          </motion.div>

          {/* Author Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Author</h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Created by <span className="font-medium text-foreground">Oleksii Zhukov</span>
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This project is open source and I'm paying for API calls and hosting from my own pocket. 
                Your support helps keep this tool free for students!
              </p>
              
              {/* Social Links */}
              <div className="flex flex-col space-y-2">
                <motion.a
                  href="https://github.com/Oleksiy-Zhukov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05, x: 5 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
                
                <motion.a
                  href="https://www.linkedin.com/in/oleksiizhukov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05, x: 5 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
                
                <motion.a
                  href="https://buymeacoffee.com/oleksiizh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 hover:text-yellow-700 transition-colors px-3 py-2 rounded-lg border border-yellow-500/20"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  <Coffee className="w-4 h-4" />
                  <span>Buy me a coffee</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Built with</span>
            <motion.div variants={heartVariants} animate="animate">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
            <span>for students everywhere by Oleksii Zhukov</span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Backend: OpenAI</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span>© 2025 Student AI Toolkit</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}

