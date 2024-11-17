import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const endpoint = mode === 'login' ? 'login' : 'register'
      const apiUrl = `http://192.168.0.121:8000/api/auth/${endpoint}/`
      
      console.log('Sending request to:', apiUrl, {
        username,
        password,
        mode
      })

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(mode === 'login' ? 
          { username, password } : 
          { username, password, password_confirm: passwordConfirm }
        )
      })

      // Log everything about the response
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      const data = await response.text()
      console.log('Response data:', data)

      if (response.ok) {
        const jsonData = JSON.parse(data)
        console.log('Login successful:', jsonData)
        if (mode === 'login') {
          login(jsonData.access)
          navigate('/')
        } else {
          setMode('login')
        }
      } else {
        console.error('Login failed:', data)
      }
    } catch (error) {
      console.error('Request error:', error)
    }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white"
          />
          {mode === 'register' && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full p-2 rounded bg-slate-700 text-white"
            />
          )}
          <button 
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full mt-4 text-blue-400 hover:text-blue-300"
        >
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
        </button>
      </div>
    </div>
  )
}