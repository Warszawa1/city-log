import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthForm } from './components/AuthForm'
import { ProtectedRoute } from './components/ProtectedRoute'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Map } from './components/Map'


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthForm />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Map />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App