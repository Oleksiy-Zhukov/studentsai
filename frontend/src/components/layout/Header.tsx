'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { type User } from '@/lib/api'
import { LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

interface HeaderProps {
  user: User
  onLogout: () => void
  context?: 'notes' | 'profile' | 'settings' | 'flashcards'
}

export function Header({ user, onLogout, context = 'notes' }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 dark:bg-[#141820] dark:border-[#232a36]">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">StudentsAI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered note-taking & studying</p>
          </div>
        </div>

        {/* Nav + User Menu */}
        <div className="flex items-center space-x-3">
          <nav className="hidden sm:flex items-center gap-4 mr-2 text-sm text-gray-700 dark:text-gray-300">
            {context !== 'notes' && (
              <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-1">
                Notes
              </Link>
            )}
            {context !== 'flashcards' && (
              <Link href="/flashcards" className="hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-1">
                Flashcards
              </Link>
            )}
            {context !== 'profile' && (
              <Link href="/profile" className="hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-1">
                Profile
              </Link>
            )}
            {context !== 'settings' && (
              <Link href="/settings" className="hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-1">
                Settings
              </Link>
            )}
          </nav>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <span className="hidden sm:inline text-gray-700 dark:text-gray-300">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

