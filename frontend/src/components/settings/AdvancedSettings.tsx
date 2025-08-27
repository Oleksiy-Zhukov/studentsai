/**
 * AdvancedSettings: Advanced configuration and account management
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, AlertTriangle, Download, BarChart3, UserX } from 'lucide-react'

export function AdvancedSettings() {
  const handleAccountDeletion = () => {
    if (confirm('Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers.')) {
      alert('Account deletion request submitted. You will receive a confirmation email.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Advanced</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced configuration options and account management
        </p>
      </div>

      {/* Coming Soon Features */}
      <Card className="bg-white dark:bg-[#141820] border-gray-200 dark:border-[#232a36]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <Settings className="h-5 w-5" />
            <span>Advanced Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <Download className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium">Coming Soon</p>
                <p className="mt-1">Data export, analytics, and advanced configuration options will be available in future updates.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Data Export</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Export your notes, flashcards, and learning data</p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Analytics</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Learning insights and progress tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-[#141820]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base text-red-600 dark:text-red-400">Delete Account</span>
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <button
                onClick={handleAccountDeletion}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm rounded-md border-0 shadow-sm transition-colors"
              >
                <UserX className="h-4 w-4 inline mr-2" />
                Delete Account
              </button>
            </div>
            
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-medium">Warning</p>
                  <p className="mt-1">This action cannot be undone. All your notes, flashcards, progress, and account data will be permanently deleted.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
