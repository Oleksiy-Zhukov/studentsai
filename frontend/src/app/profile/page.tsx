/**
 * Design rationale (Profile): Centered, low-chrome layout reminiscent of monkeytype.
 * Reuses shadcn Cards and Tailwind spacing; accents in #f97316 are used sparingly for focus.
 */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { StatsRow } from '@/components/profile/StatsRow'
import { Heatmap } from '@/components/profile/Heatmap'
import { ActivityList } from '@/components/profile/ActivityList'
import { api, type ActivityDayCount, type EventItem, type ProfileSummary } from '@/lib/api'

export default function ProfilePage() {
  const [summary, setSummary] = useState<ProfileSummary | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [heatmap, setHeatmap] = useState<ActivityDayCount[]>([])
  const user = useMemo(() => {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) as { id: string; email: string } : null
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        const s = await api.getProfileSummary()
        setSummary(s)
      } catch {}
      try {
        const recent = await api.getRecentEvents()
        setEvents(recent)
      } catch {}
      try {
        // last 180 days UTC continuous grid, even if no activity
        const today = new Date()
        const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
        const start = new Date(end)
        start.setUTCDate(end.getUTCDate() - 179)
        const fmt = (d: Date) => d.toISOString().slice(0, 10)
        const data = await api.getProfileActivity(fmt(start), fmt(end), 'all')
        // ensure continuity if backend returns gaps
        const map = new Map(data.days.map(d => [d.date, d]))
        const days: ActivityDayCount[] = []
        const cur = new Date(start)
        while (cur <= end) {
          const key = fmt(cur)
          days.push(map.get(key) || { date: key, count: 0 })
          cur.setUTCDate(cur.getUTCDate() + 1)
        }
        setHeatmap(days)
      } catch {}
    }
    run()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f1115]">
      {/* Shared header, context=profile to show Notes/Settings */}
      {user && <Header user={{ id: user.id, email: user.email, created_at: '' } as any} onLogout={() => { localStorage.clear(); window.location.replace('/landing') }} context="profile" />}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <ProfileHeader email={user?.email || 'you@example.com'} />
        {summary && (
          <div className="mb-6">
            <StatsRow
              notesCreated={summary.notes_created}
              notesReviewed={summary.notes_reviewed}
              flashcardsCreated={summary.flashcards_created}
              flashcardsReviewed={summary.flashcards_reviewed}
              currentStreak={summary.current_streak}
              activity7d={summary.activity_7d}
              activity30d={summary.activity_30d}
            />
          </div>
        )}
        <div className="mt-8">
          <Heatmap days={heatmap} />
        </div>
        <div className="mt-8">
          <ActivityList events={events} />
        </div>
      </section>
    </main>
  )
}


