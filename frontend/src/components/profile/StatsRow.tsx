/**
 * StatsRow: organized stat tiles grouped by activity type for better UX.
 */
'use client'

import { StatsCard } from './StatsCard'

interface StatsRowProps {
  notesCreated: number
  notesReviewed: number
  flashcardsCreated: number
  flashcardsReviewed: number
  currentStreak: number
  activity7d: number
  activity30d: number
}

export function StatsRow(props: StatsRowProps) {
  const {
    notesCreated,
    notesReviewed,
    flashcardsCreated,
    flashcardsReviewed,
    currentStreak,
    activity7d,
    activity30d,
  } = props

  return (
    <div className="space-y-6">
      {/* Notes Activity Group */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 px-1">Notes Activity</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatsCard label="Created" value={notesCreated} />
          <StatsCard label="Reviewed" value={notesReviewed} />
        </div>
      </div>

      {/* Flashcards Activity Group */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 px-1">Flashcards Activity</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatsCard label="Created" value={flashcardsCreated} />
          <StatsCard label="Reviewed" value={flashcardsReviewed} />
        </div>
      </div>

      {/* Streak & Activity Group */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 px-1">Progress & Streaks</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard label="Current Streak" value={`${currentStreak}d`} />
          <StatsCard label="7-Day Activity" value={activity7d} />
          <StatsCard label="30-Day Activity" value={activity30d} />
        </div>
      </div>
    </div>
  )
}


