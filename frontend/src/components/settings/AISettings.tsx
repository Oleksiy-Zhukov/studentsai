/**
 * AISettings: AI feature configuration
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain } from 'lucide-react'

export function AISettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Features</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your AI-powered study assistant preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-500 dark:text-gray-400">
            AI feature settings will be implemented in the next iteration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
