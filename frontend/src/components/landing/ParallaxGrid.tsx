'use client'

import { useEffect, useRef } from 'react'

interface ParallaxGridProps {
  children: React.ReactNode
  strength?: number // max px shift
  className?: string
  opacity?: number // 0..1 for grid lines
}

export function ParallaxGrid({ children, strength = 6, className = '', opacity = 0.06 }: ParallaxGridProps) {
  const bgRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = bgRef.current
    if (!el) return

    let raf: number | null = null
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onScroll = () => {
      if (reduce) return
      if (raf != null) return
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0
        const shift = Math.max(-strength, Math.min(strength, (y % (strength * 10)) / 10 - strength / 2))
        el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`
        raf = null
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [strength])

  const line = `rgba(148,163,184,${opacity})` // slate-400-ish at low opacity

  return (
    <div className={`relative ${className}`}>
      <div
        ref={bgRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      {children}
    </div>
  )
}
