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
    <Card className="transition-transform hover:-translate-y-1 hover:shadow-lg dark:border-[#232a36]">
      <CardContent className="p-7">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-orange-600 dark:border-[#232a36]">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-2 text-[15px] text-gray-600 leading-relaxed dark:text-gray-300">{description}</p>
      </CardContent>
    </Card>
  )
}


