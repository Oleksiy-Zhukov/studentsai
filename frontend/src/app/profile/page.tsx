/**
 * Design rationale (Profile): Centered, low-chrome layout reminiscent of monkeytype.
 * Reuses shadcn Cards and Tailwind spacing; accents in #f97316 are used sparingly for focus.
 */
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { StatsCard } from '@/components/profile/StatsCard'
import { SettingsPanel } from '@/components/profile/SettingsPanel'

// Mock dev data for stats; replace via real API later
const stats = {
  notes: 42,
  backlinks: 128,
  flashcards: 87,
  streak: 5,
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f1115]">
      <section className="mx-auto max-w-3xl px-6 py-14">
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-700">
              {/* Simple monogram avatar */}
              <span className="text-lg font-semibold">SA</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your Profile</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">you@example.com</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <StatsCard label="Notes" value={stats.notes} />
          <StatsCard label="Backlinks" value={stats.backlinks} />
          <StatsCard label="Flashcards" value={stats.flashcards} />
          <StatsCard label="Streak" value={`${stats.streak} days`} />
        </div>

        <div className="mt-6">
          <SettingsPanel />
        </div>
      </section>
    </main>
  )
}


