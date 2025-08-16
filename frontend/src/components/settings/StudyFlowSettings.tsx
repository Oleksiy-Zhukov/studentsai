/**
 * StudyFlowSettings: Study flow and learning preferences
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export function StudyFlowSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Study Flow</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your learning experience and study habits
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Learning Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-500 dark:text-gray-400">
            Study flow settings will be implemented in the next iteration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
