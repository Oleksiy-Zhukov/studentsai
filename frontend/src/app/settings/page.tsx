/**
 * Settings Page: Comprehensive settings management with sidebar navigation
 * Inspired by Obsidian, Monkeytype, and Notion's clean, organized approach
 */
'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { SettingsSidebar } from '@/components/settings/SettingsSidebar'
import { SettingsContent } from '@/components/settings/SettingsContent'
import { api, type User } from '@/lib/api'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await api.getProfileSettings()
        setUser(userData)
      } catch (error) {
        console.error('Failed to load user profile:', error)
      }
    }
    loadUser()
  }, [])

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0f1115]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500 dark:text-gray-400">Loading settings...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f1115]">
      {/* Header with context-aware navigation */}
      <Header 
        user={{ id: user.id, email: user.email, created_at: user.created_at }} 
        onLogout={() => { localStorage.clear(); window.location.replace('/landing') }}
        context="settings"
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Settings Sidebar */}
        <SettingsSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {/* Settings Content */}
        <SettingsContent 
          activeTab={activeTab}
          user={user}
          onUserUpdate={setUser}
          searchQuery={searchQuery}
        />
      </div>
    </main>
  )
}


