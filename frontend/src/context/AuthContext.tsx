// src/context/AuthContext.tsx
import { useState, ReactNode } from 'react'
import { AuthContext } from './AuthContext.context'
import { User } from './AuthContext.types'

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)

  const login = (newToken: string) => {
    console.log('Login called with token:', newToken)
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    console.log('Logout called')
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

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