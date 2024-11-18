// src/components/Map.tsx
import { useEffect, useState } from 'react'
import useMapbox from '../hooks/useMapbox'
import mapboxgl from 'mapbox-gl'

export function Map() {
  const { markers } = useMapbox()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if mapbox is available
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      setError('Mapbox token missing')
      return
    }

    // Give map a moment to initialize
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 bg-slate-800">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">RatLogger</h1>
            <span className="text-sm bg-slate-700 px-3 py-1 rounded">
              Rats reported: {markers?.length || 0}
            </span>
          </div>
        </header>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
              <div className="text-white">Loading map...</div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
              <div className="text-red-500">{error}</div>
            </div>
          )}

          <div 
            id="map" 
            className="w-full h-full"
            style={{ 
              visibility: isLoading ? 'hidden' : 'visible',
              minHeight: '300px'  // Ensure minimum height on mobile
            }}
          />
        </div>

        {/* Debug Panel - only in development */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-slate-800 text-xs">
            <h2 className="font-bold mb-2">Debug Info:</h2>
            <pre className="overflow-auto">
              {JSON.stringify({
                markersCount: markers?.length || 0,
                mapContainerExists: !!document.getElementById('map'),
                windowSize: {
                  width: window.innerWidth,
                  height: window.innerHeight
                },
                isLoading,
                error: error || 'none',
                mapboxToken: !!mapboxgl.accessToken
              }, null, 2)}
            </pre>
          </div>
        )} */}
      </div>
    </main>
  )
}