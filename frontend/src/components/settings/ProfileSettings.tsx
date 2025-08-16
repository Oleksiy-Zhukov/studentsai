/**
 * ProfileSettings: User profile management with username, email, and password
 */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/form-label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { api, type User, type UserProfileUpdate } from '@/lib/api'

interface ProfileSettingsProps {
  user: User
  onUserUpdate: (user: User) => void
}

export function ProfileSettings({ user, onUserUpdate }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean
    available: boolean | null
    message: string
  }>({ checking: false, available: null, message: '' })
  
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Check username availability when username changes
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username === user.username) {
        setUsernameStatus({ checking: false, available: null, message: '' })
        return
      }

      if (formData.username.length < 3) {
        setUsernameStatus({ checking: false, available: false, message: 'Username must be at least 3 characters' })
        return
      }

      setUsernameStatus({ checking: true, available: null, message: 'Checking availability...' })
      
      try {
        const result = await api.checkUsernameAvailability(formData.username)
        setUsernameStatus({
          checking: false,
          available: result.available,
          message: result.available ? 'Username available!' : 'Username already taken'
        })
      } catch (error) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: 'Error checking username'
        })
      }
    }

    const timeoutId = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.username, user.username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match' })
          setIsLoading(false)
          return
        }
        if (formData.newPassword.length < 8) {
          setMessage({ type: 'error', text: 'New password must be at least 8 characters' })
          setIsLoading(false)
          return
        }
      }

      // Prepare update data
      const updateData: UserProfileUpdate = {}
      if (formData.username !== user.username) updateData.username = formData.username
      if (formData.email !== user.email) updateData.email = formData.email
      if (formData.newPassword) {
        updateData.current_password = formData.currentPassword
        updateData.new_password = formData.newPassword
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'error', text: 'No changes to save' })
        setIsLoading(false)
        return
      }

      // Update profile
      const updatedUser = await api.updateProfileSettings(updateData)
      onUserUpdate(updatedUser)
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setPasswordVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Profile Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information and security settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Username</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="pr-20"
                  placeholder="Enter username"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {usernameStatus.checking && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                  {!usernameStatus.checking && usernameStatus.available === true && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {!usernameStatus.checking && usernameStatus.available === false && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {usernameStatus.message && (
                <div className="mt-2">
                  <Badge 
                    variant={usernameStatus.available ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {usernameStatus.message}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={passwordVisible.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {passwordVisible.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={passwordVisible.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {passwordVisible.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={passwordVisible.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {passwordVisible.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
