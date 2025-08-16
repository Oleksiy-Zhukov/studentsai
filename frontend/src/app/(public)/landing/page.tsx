/**
 * Design rationale (Landing): Minimal hero + three concise features with a subtle Japanese 90s grid.
 * Uses existing shadcn components, Tailwind utilities, and accent #f97316 for CTAs.
 */
'use client'

import { PublicHeader } from '@/components/landing/PublicHeader'
import { Hero } from '@/components/landing/Hero'
import { Section } from '@/components/landing/Section'
import { MediaFrame } from '@/components/landing/MediaFrame'
import MiniGraph from '@/components/landing/MiniGraph'
import { TwoUp } from '@/components/landing/TwoUp'
import { FinalCta } from '@/components/landing/FinalCta'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { FileText } from 'lucide-react'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useRevealOnScroll } from '@/components/landing/useReveal'

export default function LandingPage() {
  // If user already logged in, route them to notes
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (token) {
      // naive check; main page will fully validate
      window.location.replace('/')
    }
  }, [])
  useRevealOnScroll()
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f1115]" id="main">
      <PublicHeader />
      <Hero />

      {/* SECTION A: Graph screenshot with alternate typography and keyline */}
      <Section
        id="features"
        variant="alt"
        label="DISCOVER CONNECTIONS"
        title="See how your ideas connect"
        body="Backlinks and a visual graph help you jump between related concepts without losing context."
      >
        <div>
          <MiniGraph />
          <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            Interactive mini graph — drag to explore
            <span className="ml-2 inline-block w-6 h-[2px] align-middle bg-orange-500" aria-hidden />
          </div>
        </div>
      </Section>

      {/* SECTION B1: Summary */}
      <Section
        title="Turn long notes into clear summaries"
        body="Summarize dense material into clean, structured sections that are easy to review."
      >
        <div className="max-w-5xl mx-auto">
          <MediaFrame src="/screens/summary.png" alt="Summary view screenshot" sizes="(min-width: 1024px) 900px, 100vw" className="shadow-md" />
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">AI Summary — extract key ideas, definitions, and context without losing nuance.</p>
        </div>
      </Section>

      {/* SECTION B2: Flashcards */}
      <Section
        variant="alt"
        title="Drill smarter with flashcards"
        body="Generate focused flashcards straight from your notes. Review quickly and track progress over time."
        mirrored
      >
        <div className="max-w-md mx-auto">
          <MediaFrame src="/screens/Flashcard.png" alt="Flashcards view screenshot" sizes="(min-width: 1024px) 420px, 100vw" className="shadow-md" />
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Flashcards — spaced practice made simple, created from your own content.</p>
        </div>
      </Section>

      {/* SECTION C: Account tracking & progress */}
      <Section
        title="Your account tracks your learning"
        body="See streaks, daily activity, and totals. Notes created, reviews completed, flashcards studied — all recorded in UTC and visualized in your profile."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100 uppercase">Activity</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">A 180‑day heatmap shows your daily note and flashcard work, aligned to UTC.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100 uppercase">Streaks</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Track current and best streaks to stay consistent without pressure.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100 uppercase">Totals & Export</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Totals for notes and flashcards at a glance, plus one‑click JSON export.</p>
          </div>
        </div>
      </Section>

      <FinalCta title="Explore plans and options" subtext="Free includes all core features. Upgrade for higher AI quotas and priority speed." buttonLabel="More options" buttonHref="/auth" />

      <SiteFooter />
    </main>
  )
}


