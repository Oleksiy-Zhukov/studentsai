'use client'

import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { LogOut, Brain } from 'lucide-react'

interface HeaderProps {
  user?: { email: string } | null
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const handleLogout = () => {
    api.clearToken()
    onLogout()
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">StudentsAI</h1>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Your intelligent study companion
            </span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

