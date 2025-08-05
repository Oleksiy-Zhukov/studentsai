import React from 'react'

import { Card } from '@/components/ui/card'
import { cardVariants } from '@/animations/variants'
import { useScrollAnimation, useHoverAnimation } from '@/hooks/useAnimations'

export const AnimatedCard = ({ 
  children, 
  className = '', 
  delay = 0,
  enableHover = true,
  enableScroll = true,
  ...props 
}) => {
  const { ref, isInView, prefersReducedMotion } = useScrollAnimation()
  const { hoverProps } = useHoverAnimation()

  const variants = prefersReducedMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  } : cardVariants

  const animationProps = {
    ref,
    variants,
    initial: "initial",
    animate: enableScroll ? (isInView ? "animate" : "initial") : "animate",
    whileHover: enableHover ? "hover" : undefined,
    whileTap: enableHover ? "tap" : undefined,
    transition: {
      delay: prefersReducedMotion ? 0 : delay,
      duration: prefersReducedMotion ? 0.1 : 0.5
    },
    ...hoverProps
  }

  return (
    <motion.div {...animationProps}>
      <Card 
        className={`${className} ${enableHover ? 'hover-lift' : ''}`}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
}

export const AnimatedCardHeader = ({ children, className = '', ...props }) => {
  const { prefersReducedMotion } = useScrollAnimation()
  
  const variants = prefersReducedMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  } : {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.1, duration: 0.4 }
    }
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedCardContent = ({ children, className = '', ...props }) => {
  const { prefersReducedMotion } = useScrollAnimation()
  
  const variants = prefersReducedMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  } : {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.2, duration: 0.4 }
    }
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedCardFooter = ({ children, className = '', ...props }) => {
  const { prefersReducedMotion } = useScrollAnimation()
  
  const variants = prefersReducedMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3, duration: 0.4 }
    }
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

