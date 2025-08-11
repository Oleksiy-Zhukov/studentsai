const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  summary?: string
  created_at: string
  updated_at: string
  tags?: string[]
}

export interface Flashcard {
  id: string
  question: string
  answer: string
  difficulty: number
  last_reviewed?: string
  created_at: string
}

export interface GraphNode {
  id: string
  title: string
  content_preview: string
  created_at: string
  word_count: number
}

export interface GraphConnection {
  source_id: string
  target_id: string
  similarity: number
  connection_type: string
}

export interface GraphData {
  nodes: GraphNode[]
  connections: GraphConnection[]
  total_nodes: number
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

class APIClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        response.status,
        errorData.detail || errorData.error || 'An error occurred'
      )
    }

    return response.json()
  }

  // Auth endpoints
  async register(email: string, password: string) {
    const response = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    this.setToken(response.access_token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    
    return response
  }

  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    this.setToken(response.access_token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    
    return response
  }

  // Note endpoints
  async getNotes(): Promise<{ notes: Note[] }> {
    return this.request('/notes')
  }

  async getNote(id: string): Promise<Note> {
    return this.request(`/notes/${id}`)
  }

  async createNote(title: string, content: string): Promise<Note> {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    })
  }

  async updateNote(id: string, data: Partial<Pick<Note, 'title' | 'content' | 'summary'>>): Promise<Note> {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteNote(id: string): Promise<void> {
    await this.request(`/notes/${id}`, {
      method: 'DELETE',
    })
  }

  // AI endpoints
  async summarizeText(content: string): Promise<{ summary: string; word_count: number; original_length: number }> {
    return this.request('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async generateFlashcards(content: string, count: number = 5): Promise<{ flashcards: Array<{ question: string; answer: string }>; count: number }> {
    return this.request('/ai/flashcards', {
      method: 'POST',
      body: JSON.stringify({ content, count }),
    })
  }

  async summarizeNote(id: string): Promise<Note> {
    return this.request(`/notes/${id}/summarize`, {
      method: 'POST',
    })
  }

  // Flashcard endpoints
  async getNoteFlashcards(noteId: string): Promise<Flashcard[]> {
    return this.request(`/notes/${noteId}/flashcards`)
  }

  async generateNoteFlashcards(noteId: string, count: number = 5): Promise<Flashcard[]> {
    return this.request(`/notes/${noteId}/flashcards/generate?count=${count}`, {
      method: 'POST',
    })
  }

  // Graph endpoint
  async getNotesGraph(): Promise<GraphData> {
    return this.request('/graph')
  }

  // Keywords/tags/backlinks
  async getSuggestedKeywords(noteId: string): Promise<{ note_id: string; keywords: string[] }> {
    return this.request(`/notes/${noteId}/keywords`)
  }

  async updateTags(noteId: string, tags: string[]): Promise<Note> {
    return this.request(`/notes/${noteId}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tags }),
    })
  }

  async getBacklinks(noteId: string): Promise<Array<{ note_id: string; title: string; excerpt?: string; created_at: string }>> {
    return this.request(`/notes/${noteId}/backlinks`)
  }

  async createManualLink(noteId: string, targetNoteId: string): Promise<{ message: string }> {
    return this.request(`/notes/${noteId}/links?target_note_id=${encodeURIComponent(targetNoteId)}`, {
      method: 'POST',
    })
  }

  async deleteManualLink(noteId: string, targetNoteId: string): Promise<{ message: string }> {
    return this.request(`/notes/${noteId}/links/${encodeURIComponent(targetNoteId)}`, {
      method: 'DELETE',
    })
  }
}

export const api = new APIClient(API_BASE_URL)

export { APIError }

