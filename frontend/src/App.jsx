import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './components/LandingPage'
import { StudyFlow } from './components/StudyFlow'
import { UserProfile } from './components/UserProfile'
import { Auth } from './components/Auth'
import { Toaster } from '@/components/ui/sonner'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/study" element={<StudyFlow />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster />
    </Router>
  )
}

export default App
