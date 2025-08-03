import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export const ProgressPanel = () => {
  const [progressStats, setProgressStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch progress stats
      const statsResponse = await fetch('http://localhost:8001/api/v1/study/progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch recommendations
      const recsResponse = await fetch('http://localhost:8001/api/v1/study/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setProgressStats(stats);
      }

      if (recsResponse.ok) {
        const recs = await recsResponse.json();
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Progress & Insights</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Progress Stats */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Your Progress</h3>
        
        {progressStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {progressStats.total_notes}
                </div>
                <div className="text-xs text-muted-foreground">Total Notes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {formatTime(progressStats.total_study_time)}
                </div>
                <div className="text-xs text-muted-foreground">Study Time</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Average Mastery</span>
                <span>{Math.round(progressStats.average_mastery)}%</span>
              </div>
              <Progress value={progressStats.average_mastery} className="h-2" />
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {progressStats.study_streak}
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No progress data yet</p>
            <p className="text-xs mt-1">Start studying to see your stats</p>
          </div>
        )}
      </Card>

      {/* Recommendations */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">AI Recommendations</h3>
        
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(rec.priority)}
                  >
                    {rec.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {rec.type}
                  </Badge>
                </div>
                
                <h4 className="font-medium text-foreground text-sm mb-1">
                  {rec.title}
                </h4>
                
                <p className="text-xs text-muted-foreground mb-3">
                  {rec.description}
                </p>
                
                <Button size="sm" className="w-full japanese-button">
                  {rec.type === 'review' ? 'Review Now' :
                   rec.type === 'continue' ? 'Continue' : 'Start'}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No recommendations yet</p>
            <p className="text-xs mt-1">Create more notes for personalized suggestions</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => {/* TODO: Start study session */}}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Study Session
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => {/* TODO: Export data */}}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Notes
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => {/* TODO: View analytics */}}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
}; 