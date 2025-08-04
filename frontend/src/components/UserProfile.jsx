import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Calendar, Edit, Save, X, Camera, Settings, BookOpen, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const UserProfile = ({ onLogout, onNavigateToMain, onNavigateToStudy }) => {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState({
    username: 'Student',
    email: 'student@example.com',
    joinDate: '2024-01-01',
    bio: 'Passionate learner exploring the world of knowledge.',
    avatar: null
  })
  const [editForm, setEditForm] = useState({ ...user })

  useEffect(() => {
    // Load user data from localStorage or API
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setEditForm(parsedUser)
    }
  }, [])

  const handleSave = () => {
    setUser(editForm)
    localStorage.setItem('user', JSON.stringify(editForm))
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm(user)
    setIsEditing(false)
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditForm({ ...editForm, avatar: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-foreground">User Profile</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToStudy}
                className="japanese-button"
              >
                <Brain className="w-4 h-4 mr-2" />
                Study Flow
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToMain}
                className="japanese-button"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Main App
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="p-2"
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="japanese-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="japanese-text">Profile Information</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-background rounded-full p-1 cursor-pointer hover:bg-muted transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="japanese-textarea text-lg font-semibold"
                      />
                    ) : (
                      <h2 className="text-lg font-semibold japanese-text">{user.username}</h2>
                    )}
                    <p className="text-sm text-muted-foreground">Active Learner</p>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground">Email</label>
                      {isEditing ? (
                        <Input
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="japanese-textarea"
                        />
                      ) : (
                        <p className="japanese-text">{user.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground">Member Since</label>
                      <p className="japanese-text">{user.joinDate}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Bio</label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="japanese-textarea"
                        rows={3}
                      />
                    ) : (
                      <p className="japanese-text">{user.bio}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleSave} className="japanese-button">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="japanese-card">
              <CardHeader>
                <CardTitle className="japanese-text text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Notes Created</span>
                  <span className="font-semibold japanese-text">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Study Sessions</span>
                  <span className="font-semibold japanese-text">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hours Studied</span>
                  <span className="font-semibold japanese-text">48.5</span>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="japanese-card">
              <CardHeader>
                <CardTitle className="japanese-text text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Study Preferences
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 