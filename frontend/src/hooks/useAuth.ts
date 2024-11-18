import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.context'

export function useAuth() {
  const context = useContext(AuthContext)
  console.log('useAuth hook called, context:', context)
  
  if (!context) {
    console.error('Auth context is null')
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}