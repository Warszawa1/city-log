import { useEffect, useState, useCallback } from 'react'
import useMapbox from '../hooks/useMapbox'
import { PinDropDialog } from './PinDropDialog'
import mapboxgl from 'mapbox-gl'
import { useLocation } from 'react-router-dom'


interface LocationState {
    focusCoordinates?: [number, number]
    zoom?: number
  }

export function Map() {
  const { markers, map, reloadMarkers } = useMapbox() // Added reloadMarkers
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [clickedPosition, setClickedPosition] = useState<{lat: number; lng: number} | null>(null)
  const location = useLocation()
  const state = location.state as LocationState | null
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if mapbox is available
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      setError('Mapbox token missing')
      return
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])
  

  // Memoized click handler to prevent recreating on every render
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    console.log('Map clicked at:', e.lngLat)
    setClickedPosition({
      lat: e.lngLat.lat,
      lng: e.lngLat.lng
    })
    setShowDialog(true)
  }, [])

  // Set up map click listener
  useEffect(() => {
    if (!isLoading && map) {
      map.on('click', handleMapClick)
      return () => {
        map.off('click', handleMapClick)
      }
    }
  }, [isLoading, map, handleMapClick])

  useEffect(() => {
    if (state?.focusCoordinates && map) {
      map.flyTo({
        center: state.focusCoordinates,
        zoom: state.zoom || 15,
        duration: 1500 // Animation duration in milliseconds
      })
      
      // Optional: Add a temporary highlight marker
      const marker = new mapboxgl.Marker({
        color: '#FFD700', // Gold color
        scale: 1.2
      })
        .setLngLat(state.focusCoordinates)
        .addTo(map)

      // Remove highlight after a few seconds
      setTimeout(() => marker.remove(), 5000)
    }
  }, [map, state?.focusCoordinates, state?.zoom])

  

  // Memoized confirm handler
  const handleConfirm = useCallback(async (useGeolocation: boolean) => {
    try {
      let latitude: number, longitude: number
  
      if (useGeolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        })
        latitude = position.coords.latitude
        longitude = position.coords.longitude
      } else if (clickedPosition) {
        latitude = clickedPosition.lat
        longitude = clickedPosition.lng
      } else {
        throw new Error('No location selected')
      }
  
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }
  
      const response = await fetch('http://192.168.0.121:8000/api/sightings/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude,
          longitude,
          description: 'Rat spotted here'
        })
      })
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to save sighting')
      }
  
      await reloadMarkers()
      console.log('Sighting added successfully!')
      
    } catch (error) {
      console.error('Error adding sighting:', error)
      setError(error instanceof Error ? error.message : 'Failed to add sighting')
    } finally {
      setShowDialog(false)
      setClickedPosition(null)
    }
  }, [clickedPosition, reloadMarkers])


  // Reset error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error])


  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="h-screen flex flex-col">
        <header className="p-4 bg-slate-800">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">RatLogger</h1>
            <span className="text-sm bg-slate-700 px-3 py-1 rounded">
              Rats reported: {markers?.length || 0}
            </span>
          </div>
        </header>

        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
              <div className="text-white">Loading map...</div>
            </div>
          )}
          
          {error && (
            <div className="absolute bottom-24 left-4 right-4 bg-red-500/90 p-3 rounded-lg text-white text-sm text-center z-50">
              {error}
            </div>
          )}

          <div 
            id="map" 
            className="w-full h-full"
            style={{ 
              visibility: isLoading ? 'hidden' : 'visible',
              minHeight: '300px'
            }}
          />

          <PinDropDialog
            isOpen={showDialog}
            onClose={() => {
              setShowDialog(false)
              setClickedPosition(null)
            }}
            onConfirm={handleConfirm}
            coordinates={clickedPosition}
          />

<div className="fixed left-4 bottom-20 z-50">
  {/* Bouncing rat button */}
  <button
    onClick={() => setShowTooltip(true)}
    className="bg-slate-100 p-3 rounded-full hover:bg-transparent transition-all
      animate-bounce-slow" // We'll add this animation
  >
    <span className="text-2xl text-slate-800">+🐀</span>
  </button>

  {/* Tooltip message */}
  {showTooltip && (
    <div 
      className="absolute left-16 bottom-0 bg-slate-800/90 px-4 py-2 rounded-lg
        text-white text-sm whitespace-nowrap
        animate-fade-in"
    >
      Tap anywhere on the map to report
      <button
        onClick={() => setShowTooltip(false)}
        className="ml-2 opacity-75 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )}
</div>
        </div>
      </div>
    </main>
  )
}