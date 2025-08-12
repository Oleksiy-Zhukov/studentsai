/**
 * Design rationale: Minimal, modern hero with a subtle Japanese 90s nod via thin borders and gentle motion.
 * It reuses the project's Tailwind + shadcn tokens (spacing, radius, orange #f97316 accent via Button) and typography.
 */
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeroProps {
  headline?: string
  subhead?: string
}

export function Hero({
  headline = 'Think better. Study lighter.',
  subhead = 'StudentsAI helps you take notes, discover backlinks, and drill flashcards with a clean, modern flow.'
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* subtle geometric pattern (thin grid lines) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="animate-in fade-in slide-in-from-bottom-2 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {headline}
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-2 delay-100 mt-4 text-lg text-gray-600">
            {subhead}
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-2 delay-200 mt-8 flex items-center justify-center gap-3">
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500">
                Start Free
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                See Notes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}


