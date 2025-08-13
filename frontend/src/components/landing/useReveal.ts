'use client'

import { useEffect } from 'react'

export function useRevealOnScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (elements.length === 0) return

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.1 })

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}


