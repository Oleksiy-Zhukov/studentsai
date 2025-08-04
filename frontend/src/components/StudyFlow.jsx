import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dashboard } from './Dashboard'
import { Auth } from './Auth'

export const StudyFlow = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsAuthenticated(true)
    } else {
      setShowAuth(true)
    }
  }, [])

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
      />
    )
  }

  return null
} 