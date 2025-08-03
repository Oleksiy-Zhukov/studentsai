import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Auth } from './Auth';
import { Dashboard } from './Dashboard';

export const AppRouter = () => {
  const [user, setUser] = useState(null);
  const [currentApp, setCurrentApp] = useState('main'); // 'main' or 'study'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-foreground">StudentsAI</h1>
              
              <nav className="flex space-x-4">
                <Button
                  variant={currentApp === 'main' ? 'default' : 'ghost'}
                  onClick={() => setCurrentApp('main')}
                  className="japanese-button"
                >
                  AI Tools
                </Button>
                <Button
                  variant={currentApp === 'study' ? 'default' : 'ghost'}
                  onClick={() => setCurrentApp('study')}
                  className="japanese-button"
                >
                  Smart Study Flow
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* App Content */}
      <main>
        {currentApp === 'main' ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              StudentsAI - AI Tools
            </h2>
            <p className="text-muted-foreground mb-8">
              The original StudentsAI application with file processing and AI actions.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="japanese-button"
            >
              Go to Main App
            </Button>
          </div>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}; 