import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  return (
    <nav className="bg-slate-800 fixed bottom-0 left-0 right-0 p-4 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        <Link 
          to="/"
          className={`flex flex-col items-center ${
            location.pathname === '/' ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <span className="text-2xl">🗺️</span>
          <span className="text-sm">Map</span>
        </Link>
        
        <Link 
          to="/stats"
          className={`flex flex-col items-center ${
            location.pathname === '/stats' ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <span className="text-2xl">📊</span>
          <span className="text-sm">Stats</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-red-400 hover:text-red-500"
        >
          <span className="text-2xl">🚪</span>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </nav>
  )
}