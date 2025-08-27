/**
 * GraphSettings: Graph view customization options
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, Eye, Zap, Target } from 'lucide-react'

export function GraphSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Graph View</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize how your knowledge graph is displayed and behaves
        </p>
      </div>

      {/* Core Features */}
      <Card className="bg-white dark:bg-[#141820] border-gray-200 dark:border-[#232a36]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <Eye className="h-5 w-5" />
            <span>Visual Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <Target className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium">Graph Visualization Active</p>
                <p className="mt-1">Your knowledge graph automatically adjusts for optimal viewing and interaction.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card className="bg-white dark:bg-[#141820] border-gray-200 dark:border-[#232a36]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <Zap className="h-5 w-5" />
            <span>Advanced Customization</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <Network className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium">Coming Soon</p>
                <p className="mt-1">Advanced graph customization options will be available in future updates.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Visual Controls</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Edge thickness, node spacing, and layout options</p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Behavior Settings</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Physics, clustering, and interaction preferences</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
