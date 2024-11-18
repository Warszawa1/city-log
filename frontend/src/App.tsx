// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthForm } from './components/AuthForm'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Map } from './components/Map'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Navigation } from './components/Navigation'
import { StatsView } from './components/StatsView'
import { Suspense } from 'react'

// Verify token is set
const token = import.meta.env.VITE_MAPBOX_TOKEN
if (!token) {
  console.error('Mapbox token not found!')
}
mapboxgl.accessToken = token



function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
     <Router>
       <div className="min-h-screen bg-slate-900">
         <Routes>
           <Route path="/login" element={<AuthForm />} />
           <Route path="/" element={
             <ProtectedRoute>
               <>
                 <Navigation />
                 <Map />
               </>
             </ProtectedRoute>
           } />
           <Route path="/stats" element={
             <ProtectedRoute>
               <>
                 <Navigation />
                 <StatsView />
               </>
             </ProtectedRoute>
           } />
         </Routes>
       </div>
     </Router>
   </AuthProvider>
   </Suspense>
 )
}
    
export default App