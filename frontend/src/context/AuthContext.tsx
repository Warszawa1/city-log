import { useState, useEffect, ReactNode } from 'react'
import { AuthContext, User } from './AuthContext.types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const verifyToken = async () => {
        if (token) {
          try {
            const response = await fetch('http://localhost:8000/api/auth/verify/', {
              method: 'POST', // Changed from GET to POST
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token }) // Add this
            })
            if (!response.ok) {
              logout()
            }
          } catch {
            logout()
          }
        }
      }

    verifyToken()
  }, [token])

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        user, 
        login, 
        logout,
        isAuthenticated: !!token 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}