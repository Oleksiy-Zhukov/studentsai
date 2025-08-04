import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dashboard } from './Dashboard'
import { Auth } from './Auth'
import { api, isTokenExpired } from '../utils/api'

export const StudyFlow = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Token is expired, clear it and show auth
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          setShowAuth(true)
        } else {
          // Token is valid, verify by making a test request
          try {
            const response = await api.getNotes()
            if (response.ok) {
              setIsAuthenticated(true)
            } else {
              // Token is invalid, clear it and show auth
              localStorage.removeItem('authToken')
              localStorage.removeItem('user')
              setShowAuth(true)
            }
          } catch (error) {
            console.error('Auth check failed:', error)
            setShowAuth(true)
          }
        }
      } else {
        // No auth found, try auto-demo login
        await autoDemoLogin()
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Auto demo login for testing
  const autoDemoLogin = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@studentsai.com',
          password: 'demo123',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setIsAuthenticated(true)
        console.log('Auto demo login successful')
      } else {
        setShowAuth(true)
      }
    } catch (error) {
      console.error('Auto demo login failed:', error)
      setShowAuth(true)
    }
  }

  // Auth handlers
  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setShowAuth(false)
  }

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

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not authenticated
  if (showAuth) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  // Show study flow if authenticated
  if (isAuthenticated) {
    return (
      <Dashboard 
        onLogout={handleLogout}
        onNavigateToMain={handleNavigateToMain}
        onNavigateToProfile={handleNavigateToProfile}
      />
    )
  }

  return null
} 