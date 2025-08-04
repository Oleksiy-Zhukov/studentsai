import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainApp } from './components/MainApp'
import { StudyFlow } from './components/StudyFlow'
import { UserProfileWrapper } from './components/UserProfileWrapper'
import { RecaptchaProvider } from './components/RecaptchaProvider'
import { RecaptchaWrapper } from './components/RecaptchaWrapper'
import { Toaster } from '@/components/ui/sonner'
import './App.css'

function App() {
  return (
    <RecaptchaProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/study" element={<StudyFlow />} />
            <Route path="/profile" element={<UserProfileWrapper />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster />
        <RecaptchaWrapper />
      </Router>
    </RecaptchaProvider>
  )
}

export default App
