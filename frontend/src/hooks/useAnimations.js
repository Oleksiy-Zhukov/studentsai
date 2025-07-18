import { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

// Hook to detect if user prefers reduced motion
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    amount: threshold,
    margin: "0px 0px -100px 0px"
  })
  const prefersReducedMotion = useReducedMotion()

  return {
    ref,
    isInView: prefersReducedMotion ? true : isInView,
    prefersReducedMotion
  }
}

// Hook for staggered animations
export const useStaggeredAnimation = (itemCount, delay = 0.1) => {
  const [visibleItems, setVisibleItems] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleItems(itemCount)
      return
    }

    const timer = setInterval(() => {
      setVisibleItems(prev => {
        if (prev >= itemCount) {
          clearInterval(timer)
          return prev
        }
        return prev + 1
      })
    }, delay * 1000)

    return () => clearInterval(timer)
  }, [itemCount, delay, prefersReducedMotion])

  return visibleItems
}

// Hook for typing animation
export const useTypingAnimation = (text, speed = 50) => {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text)
      return
    }

    if (!text) {
      setDisplayText('')
      return
    }

    setIsTyping(true)
    setDisplayText('')
    
    let index = 0
    const timer = setInterval(() => {
      setDisplayText(text.slice(0, index + 1))
      index++
      
      if (index >= text.length) {
        clearInterval(timer)
        setIsTyping(false)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, prefersReducedMotion])

  return { displayText, isTyping }
}

// Hook for progress animation
export const useProgressAnimation = (targetProgress, duration = 1000) => {
  const [progress, setProgress] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(targetProgress)
      return
    }

    const startTime = Date.now()
    const startProgress = progress

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progressRatio = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3)
      
      const currentProgress = startProgress + (targetProgress - startProgress) * easedProgress
      setProgress(currentProgress)

      if (progressRatio < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [targetProgress, duration, prefersReducedMotion])

  return progress
}

// Hook for hover animations
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const hoverProps = prefersReducedMotion ? {} : {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false)
  }

  return { isHovered, hoverProps }
}

// Hook for loading animations
export const useLoadingAnimation = (isLoading) => {
  const [showLoading, setShowLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Loading')
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
      
      if (!prefersReducedMotion) {
        const texts = ['Loading', 'Loading.', 'Loading..', 'Loading...']
        let index = 0
        
        const timer = setInterval(() => {
          setLoadingText(texts[index % texts.length])
          index++
        }, 500)

        return () => clearInterval(timer)
      } else {
        setLoadingText('Loading...')
      }
    } else {
      // Delay hiding to allow exit animations
      const timer = setTimeout(() => setShowLoading(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading, prefersReducedMotion])

  return { showLoading, loadingText }
}

// Hook for intersection observer with animation triggers
export const useIntersectionAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (options.once) {
            observer.unobserve(entry.target)
          }
        } else if (!options.once) {
          setIsVisible(false)
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px'
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [options.threshold, options.rootMargin, options.once, prefersReducedMotion])

  return { ref, isVisible }
}

// Hook for sequential animations
export const useSequentialAnimation = (steps, delay = 500) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentStep(steps.length - 1)
      setIsComplete(true)
      return
    }

    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, delay)

      return () => clearTimeout(timer)
    } else {
      setIsComplete(true)
    }
  }, [currentStep, steps.length, delay, prefersReducedMotion])

  const reset = () => {
    setCurrentStep(0)
    setIsComplete(false)
  }

  return { currentStep, isComplete, reset }
}

// Hook for drag animations
export const useDragAnimation = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const prefersReducedMotion = useReducedMotion()

  const dragProps = prefersReducedMotion ? {} : {
    drag: true,
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => {
      setIsDragging(false)
      setDragOffset({ x: 0, y: 0 })
    },
    onDrag: (event, info) => {
      setDragOffset({ x: info.offset.x, y: info.offset.y })
    },
    dragElastic: 0.1,
    dragConstraints: { left: -50, right: 50, top: -50, bottom: 50 }
  }

  return { isDragging, dragOffset, dragProps }
}

// Hook for particle animations
export const useParticleAnimation = (count = 10) => {
  const [particles, setParticles] = useState([])
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setParticles([])
      return
    }

    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }))

    setParticles(newParticles)
  }, [count, prefersReducedMotion])

  return particles
}

// Hook for responsive animations
export const useResponsiveAnimation = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile }
}

