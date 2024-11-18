import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'


// Console log at the start of the component to verify it's loading
console.log('AuthForm component loading')

export function AuthForm() {
    console.log('AuthForm rendering')
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const navigate = useNavigate()
    const { login } = useAuth()
  
    // Add a simple click handler to test button functionality
    const handleTestClick = () => {
      console.log('Test button clicked')
      alert('Test button clicked')
    }
  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted')
        
        try {
          alert('Starting login process...')
          
          const endpoint = mode === 'login' ? 'login' : 'register'
          const url = `/api/auth/${endpoint}/`
          
          const requestData = mode === 'login' ? 
            { username, password } : 
            { username, password, password_confirm: passwordConfirm }
      
          console.log('Sending request:', { url, requestData })
      
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
          })
      
          console.log('Response received:', response.status)
      
          const data = await response.text()
          console.log('Raw response data:', data)
      
          if (response.ok) {
            try {
              const jsonData = JSON.parse(data)
              console.log('Parsed JSON data:', jsonData)
              
              if (mode === 'login' && jsonData.access) {
                console.log('Login successful, calling login() with token')
                login(jsonData.access)
                console.log('Login complete, attempting navigation')
                navigate('/')
                console.log('Navigation called')
              } else {
                console.log('Switching to login mode')
                setMode('login')
              }
            } catch (parseError) {
              console.error('JSON parse error:', parseError)
              alert('Error parsing server response')
            }
          } else {
            console.error('Login failed:', data)
            alert(`Login failed: ${data}`)
          }
        } catch (error) {
          console.error('Request error:', error)
          alert(`Error: ${error}`)
        }
      }
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-white">
            {mode === 'login' ? 'Login' : 'Register'}
          </h2>
  
          {/* Test button outside the form */}
          <button
            onClick={handleTestClick}
            className="w-full p-4 mb-4 bg-green-600 text-white rounded text-lg"
          >
            Test Button (Click Me!)
          </button>
          
          <form 
            onSubmit={(e) => {
              console.log('Form submit triggered')
              handleSubmit(e)
            }} 
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                console.log('Username changed:', e.target.value)
                setUsername(e.target.value)
              }}
              className="w-full p-4 rounded bg-slate-700 text-white text-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                console.log('Password changed:', e.target.value)
                setPassword(e.target.value)
              }}
              className="w-full p-4 rounded bg-slate-700 text-white text-lg"
            />
            {mode === 'register' && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full p-4 rounded bg-slate-700 text-white text-lg"
              />
            )}
            <button 
              type="submit"
              className="w-full p-4 bg-blue-600 text-white rounded text-lg"
            >
              {mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
          
          <button
            onClick={() => {
              console.log('Mode changed')
              setMode(mode === 'login' ? 'register' : 'login')
            }}
            className="w-full mt-4 p-4 text-blue-400 hover:text-blue-300 text-lg"
          >
            {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
          </button>
        </div>
      </div>
    )
  }