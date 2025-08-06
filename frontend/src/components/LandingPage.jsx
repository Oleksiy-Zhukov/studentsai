import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, BookOpen, User, ArrowRight, Sparkles, Target, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const LandingPage = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/study')
    } else {
      navigate('/auth')
    }
  }

  const handleGoToMain = () => {
    navigate('/main')
  }

  const handleGoToProfile = () => {
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-accent-blue-600" />
              <h1 className="text-2xl font-bold text-ink-900">StudentsAI</h1>
            </div>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-ink-600">Welcome back, {user?.username || 'Student'}!</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoToProfile}
                  className="japanese-button"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-ink-900 mb-6">
            Your AI-Powered
            <span className="text-accent-blue-600"> Study Companion</span>
          </h1>
          <p className="text-xl text-ink-600 mb-8 max-w-3xl mx-auto">
            Transform your learning with intelligent note-taking, knowledge graphs, and personalized study plans powered by AI.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-12">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="japanese-button text-lg px-8 py-3"
            >
              {isAuthenticated ? 'Continue Learning' : 'Get Started'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            {isAuthenticated && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleGoToMain}
                className="text-lg px-8 py-3"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Main App
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="japanese-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-accent-blue-600" />
              </div>
              <CardTitle className="japanese-text">AI-Powered Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-600">
                Create intelligent notes with AI suggestions, automatic connections, and smart summaries.
              </p>
            </CardContent>
          </Card>

          <Card className="japanese-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-accent-green-600" />
              </div>
              <CardTitle className="japanese-text">Knowledge Graphs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-600">
                Visualize your knowledge with interactive graphs that show connections between concepts.
              </p>
            </CardContent>
          </Card>

          <Card className="japanese-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent-red-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent-red-600" />
              </div>
              <CardTitle className="japanese-text">Smart Study Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-600">
                Generate personalized study plans and quizzes based on your learning progress.
              </p>
            </CardContent>
          </Card>

          <Card className="japanese-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-accent-purple-600" />
              </div>
              <CardTitle className="japanese-text">Auto Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-600">
                Automatically discover relationships between your notes and build a connected knowledge base.
              </p>
            </CardContent>
          </Card>

          <Card className="japanese-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent-yellow-600" />
              </div>
              <CardTitle className="japanese-text">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-600">
                Track your learning progress with detailed analytics and mastery levels.
              </p>
            </CardContent>
          </Card>

          <Card className="japanese-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-accent-cyan-600" />
              </div>
              <CardTitle className="japanese-text">Rich Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-600">
                Write beautiful notes with markdown support, formatting tools, and real-time preview.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-paper-100 rounded-2xl p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-ink-900 mb-2">24/7</div>
              <div className="text-ink-600">AI Learning Assistant</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-ink-900 mb-2">100%</div>
              <div className="text-ink-600">Privacy Focused</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-ink-900 mb-2">∞</div>
              <div className="text-ink-600">Knowledge Possibilities</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-ink-900 mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg text-ink-600 mb-8">
            Join thousands of students who are already using AI to enhance their study experience.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="japanese-button text-lg px-8 py-3"
          >
            Start Your AI Learning Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-paper-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-ink-600">
            © 2024 StudentsAI. Built with ❤️ for learners everywhere.
          </p>
        </div>
      </footer>
    </div>
  )
} 