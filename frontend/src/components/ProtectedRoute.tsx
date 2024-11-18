import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'


interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth()
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated)
  
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      return <Navigate to="/login" replace />
    }
  
    console.log('Authenticated, rendering children')
    return <>{children}</>
  }
