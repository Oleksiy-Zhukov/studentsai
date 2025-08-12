/**
 * Design rationale: Central numeric tile with quiet chrome, inspired by monkeytype’s calm stats.
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
    <Card>
      <CardContent className="p-5 text-center">
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
        {sub ? <div className="mt-1 text-xs text-gray-500">{sub}</div> : null}
      </CardContent>
    </Card>
  )
}


