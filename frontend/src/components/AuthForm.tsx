import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AlertCircle } from 'lucide-react'

interface LoginResponse {
  access: string;
  user: {
    id: number;
    username: string;
    points: number;
    rank: string;
    reports_count: number;
  };
}

interface AuthError {
  detail: string;
}

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? 'login' : 'register'
      const url = `/api/auth/${endpoint}/`
      
      console.log('Starting auth request to:', url)
      
      const requestData = mode === 'login' 
        ? { username, password }
        : { username, password, password_confirm: passwordConfirm }

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      const text = await response.text()
      console.log('Raw response text:', text)

      if (!text) {
        throw new Error('Server returned an empty response')
      }

      let data: LoginResponse | AuthError
      try {
        data = JSON.parse(text)
        console.log('Parsed response data:', data)
      } catch (e) {
        console.error('JSON parse error:', e)
        throw new Error('Invalid response format from server')
      }

      if (!response.ok) {
        const errorData = data as AuthError
        throw new Error(errorData.detail || 'Authentication failed')
      }

      // Type guard to ensure we have LoginResponse
      if ('access' in data && 'user' in data) {
        console.log('Login successful, navigating...')
        login(data.access, data.user)
        navigate('/')
      } else {
        throw new Error('Invalid response format: missing token or user data')
      }
    } catch (error) {
      console.error('Auth error:', error)
      if (error.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm text-slate-300">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm text-slate-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              disabled={loading}
            />
          </div>
          
          {mode === 'register' && (
            <div className="space-y-1">
              <label htmlFor="confirm-password" className="text-sm text-slate-300">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                disabled={loading}
              />
            </div>
          )}
          
          <button 
            type="submit"
            disabled={loading}
            className={`w-full p-3 bg-blue-600 text-white rounded font-medium
              hover:bg-blue-700 transition-colors
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
          className="w-full mt-4 p-3 text-blue-400 hover:text-blue-300 transition-colors text-sm"
          disabled={loading}
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}