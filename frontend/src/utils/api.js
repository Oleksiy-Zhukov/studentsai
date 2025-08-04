/**
 * API utility functions with automatic token refresh and retry logic
 */

const API_BASE_URL = 'http://localhost:8001';

// Function to refresh the JWT token
const refreshToken = async () => {
  try {
    const currentToken = localStorage.getItem('authToken');
    if (!currentToken) {
      throw new Error('No token to refresh');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/study/refresh-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear invalid tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    throw error;
  }
};

// Function to make authenticated API calls with automatic retry
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: defaultHeaders,
    });

    // If token is expired, try to refresh and retry once
    if (response.status === 401) {
      try {
        const newToken = await refreshToken();
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...defaultHeaders,
            'Authorization': `Bearer ${newToken}`,
          },
        });

        if (!retryResponse.ok) {
          throw new Error(`API call failed: ${retryResponse.status}`);
        }

        return retryResponse;
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/study';
        throw new Error('Authentication expired. Please log in again.');
      }
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Notes
  getNotes: () => apiCall('/api/v1/study/notes'),
  createNote: (noteData) => apiCall('/api/v1/study/notes', {
    method: 'POST',
    body: JSON.stringify(noteData),
  }),
  updateNote: (noteId, noteData) => apiCall(`/api/v1/study/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  }),
  deleteNote: (noteId) => apiCall(`/api/v1/study/notes/${noteId}`, {
    method: 'DELETE',
  }),

  // Graph
  getGraph: () => apiCall('/api/v1/study/graph'),

  // Connections
  createConnection: (connectionData) => apiCall('/api/v1/study/connections', {
    method: 'POST',
    body: JSON.stringify(connectionData),
  }),

  // Study Sessions
  createSession: (sessionData) => apiCall('/api/v1/study/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  }),
  getSessions: () => apiCall('/api/v1/study/sessions'),

  // Progress
  getProgress: () => apiCall('/api/v1/study/progress'),

  // Recommendations
  getRecommendations: () => apiCall('/api/v1/study/recommendations'),
};

// Check if token is expired (without making API call)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
}; 