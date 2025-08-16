/**
 * Design rationale: Central numeric tile with quiet chrome, inspired by monkeytype's calm stats.
 * Uses shadcn Card and consistent spacing/radius from existing UI.
 */
'use client'

import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
}

export function StatsCard({ label, value, sub }: StatsCardProps) {
  return (
    <Card className="border border-gray-200/60 bg-white/60 backdrop-blur-sm transition-colors hover:border-gray-300/80 dark:border-[#232a36] dark:bg-[#141820]/60 dark:hover:border-[#2a3442]">
      <CardContent className="p-4 text-center">
        <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">{label}</div>
        <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100 md:text-3xl">
          {value}
        </div>
        {sub ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div> : null}
      </CardContent>
    </Card>
  )
}


