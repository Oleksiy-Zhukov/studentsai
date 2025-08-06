import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { User, Mail, Calendar, Edit, Save, X, Camera, Settings, BookOpen, Brain, Crown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const UserProfile = () => {
  const navigate = useNavigate()
  
  const onLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/')
  }

  const onNavigateToMain = () => {
    navigate('/study')
  }

  const onNavigateToStudy = () => {
    navigate('/study')
  }

  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState({
    username: 'Student',
    email: 'student@example.com',
    joinDate: '2024-01-01',
    bio: 'Passionate learner exploring the world of knowledge.',
    avatar: null,
    subscription_tier: 'free'
  })
  const [editForm, setEditForm] = useState({ ...user })
  const [isUpdatingTier, setIsUpdatingTier] = useState(false)

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

  const toggleSubscriptionTier = async () => {
    setIsUpdatingTier(true)
    try {
      const token = localStorage.getItem('authToken')
      const newTier = user.subscription_tier === 'pro' ? 'free' : 'pro'
      
      const response = await fetch('http://localhost:8001/api/v1/auth/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_tier: newTier
        }),
      })

      if (response.ok) {
        const updatedUser = { ...user, subscription_tier: newTier }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        console.log(`✅ Switched to ${newTier} tier`)
      } else {
        console.error('Failed to update subscription tier')
      }
    } catch (error) {
      console.error('Error updating subscription tier:', error)
    } finally {
      setIsUpdatingTier(false)
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
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-semibold japanese-text">{user.username}</h2>
                        {user.subscription_tier === 'pro' && (
                          <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            <Crown className="w-3 h-3" />
                            <span>PRO</span>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {user.subscription_tier === 'pro' ? 'Premium Learner' : 'Active Learner'}
                    </p>
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

                {/* Development Toggle - Only for testing */}
                <div className="border-t pt-4 mt-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800 font-medium mb-2">🔧 Development Mode</p>
                    <p className="text-xs text-blue-700 mb-3">Toggle subscription tier for testing</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleSubscriptionTier}
                      disabled={isUpdatingTier}
                      className="w-full text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      {isUpdatingTier ? (
                        'Updating...'
                      ) : (
                        `Switch to ${user.subscription_tier === 'pro' ? 'Free' : 'Pro'}`
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card className="japanese-card">
              <CardHeader>
                <CardTitle className="japanese-text text-lg flex items-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>Subscription</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <div className="flex items-center space-x-1">
                    {user.subscription_tier === 'pro' ? (
                      <>
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-yellow-600">Pro</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-600">Free</span>
                      </>
                    )}
                  </div>
                </div>
                {user.subscription_tier === 'pro' ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 font-medium">Premium Features Active</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      • Unlimited AI Analysis<br/>
                      • Advanced Study Plans<br/>
                      • Enhanced Quiz Generation<br/>
                      • Priority Support
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-800 font-medium">Free Plan</p>
                    <p className="text-xs text-gray-700 mt-1">
                      • Basic AI Features<br/>
                      • Limited Daily Usage<br/>
                      • Standard Support
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 hover:from-yellow-500 hover:to-orange-600"
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

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