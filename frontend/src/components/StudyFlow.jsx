import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dashboard } from './Dashboard'
import { api, isTokenExpired } from '../utils/api'

export const StudyFlow = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Token is expired, redirect to auth
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          navigate('/auth')
          return
        }
        
        // Token is valid, verify by making a test request
        try {
          const response = await api.getNotes()
          // If we get here, the API call was successful
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Auth check failed:', error)
          // Token is invalid, redirect to auth
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          navigate('/auth')
          return
        }
      } else {
        // No auth found, redirect to auth
        navigate('/auth')
        return
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [navigate])

  // Auth handlers
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    navigate('/')
  }

  const handleNavigateToMain = () => {
    navigate('/')
  }

  const handleNavigateToProfile = () => {
    navigate('/profile')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to auth
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      onNavigateToMain={handleNavigateToMain}
      onNavigateToProfile={handleNavigateToProfile}
    />
  )
} 