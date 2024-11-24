// src/context/AuthContext.tsx
import { useState, ReactNode, useEffect } from 'react'
import { AuthContext } from './AuthContext.context'
import { User } from './AuthContext.types'

interface AuthProviderProps {
  children: ReactNode;
}



export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = async (newToken: string) => {
    console.log('Login called with token:', newToken)
    localStorage.setItem('token', newToken)
    setToken(newToken)

    try {
      // Fetch user data after login
      const response = await fetch('http://192.168.0.121:8000/api/users/me/', {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const logout = () => {
    console.log('Logout called')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // Fetch user data whenever token changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return

      try {
        const response = await fetch('http://192.168.0.121:8000/api/users/me/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const userData = await response.json()
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
        } else if (response.status === 401) {
          // Token is invalid or expired
          logout()
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [token])

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token
  }

  console.log('AuthProvider state:', value)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}