/**
 * Design rationale (Landing): Minimal hero + three concise features with a subtle Japanese 90s grid.
 * Uses existing shadcn components, Tailwind utilities, and accent #f97316 for CTAs.
 */
'use client'

import { PublicHeader } from '@/components/landing/PublicHeader'
import { Hero } from '@/components/landing/Hero'
import { Section } from '@/components/landing/Section'
import { MediaFrame } from '@/components/landing/MediaFrame'
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
          <MediaFrame src="/screens/Graph.png" alt="Graph view screenshot" sizes="(min-width: 768px) 50vw, 100vw" />
          <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            Graph view — relationships at a glance
            <span className="ml-2 inline-block w-6 h-[2px] align-middle bg-orange-500" aria-hidden />
          </div>
        </div>
      </Section>

      {/* SECTION B: Summary + Flashcards two-up */}
      <Section
        title="Summarize fast. Drill smarter."
        body="Generate clean summaries and flashcards right from your notes."
      >
        <TwoUp
          items={[
            { src: '/screens/Summary.png', alt: 'Summary view screenshot', caption: 'AI-generated summary' },
            { src: '/screens/Flashcard.png', alt: 'Flashcards view screenshot', caption: 'Flashcards generated from notes' },
          ]}
        />
      </Section>

      <FinalCta title="Explore plans and options" subtext="Free includes all core features. Upgrade for higher AI quotas and priority speed." buttonLabel="More options" buttonHref="/auth" />

      <SiteFooter />
    </main>
  )
}


