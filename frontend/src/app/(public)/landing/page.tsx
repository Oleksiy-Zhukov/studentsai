/**
 * Design rationale (Landing): Minimal hero + three concise features with a subtle Japanese 90s grid.
 * Uses existing shadcn components, Tailwind utilities, and accent #f97316 for CTAs.
 */
'use client'

import { Hero } from '@/components/landing/Hero'
import { FeatureCard } from '@/components/landing/FeatureCard'
import { FileText, Network, Layers } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Hero />

      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Notes & Backlinks"
            description="Write clean Markdown and connect ideas with [[wiki]] links. Backlinks reveal context across notes."
            icon={<FileText className="h-4 w-4" />}
          />
          <FeatureCard
            title="Flashcards"
            description="Generate and review flashcards with a steady rhythm. Stable card size keeps focus on content."
            icon={<Layers className="h-4 w-4" />}
          />
          <FeatureCard
            title="Graph View"
            description="Explore relationships with a tidy, responsive graph. Zoom, drag, and discover connections."
            icon={<Network className="h-4 w-4" />}
          />
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-md border border-gray-200 bg-white p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Start in seconds</h2>
          <p className="mt-2 text-gray-600">Capture a thought, link a note, and see the shape of your study.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500">Start Free</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Open Notes</Button>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}


