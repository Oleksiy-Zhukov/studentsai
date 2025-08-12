/**
 * Design rationale: Compact feature card with thin border, soft shadow, and subtle hover lift.
 * Matches shadcn card/button rhythm and the app's spacing/rounded tokens.
 */
'use client'

import { Card, CardContent } from '@/components/ui/card'

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <Card className="transition-transform hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-orange-600">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}


