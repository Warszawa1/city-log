import { useState, useEffect, useCallback, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useAuth } from './useAuth'


interface Sighting {
  id: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
  description: string;
  created_at: string;
}

export default function useMapbox() {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([])
  const { token } = useAuth()

  const loadMarkers = useCallback(async () => {
    if (!mapRef.current || !token) return

    try {
      const response = await fetch('http://192.168.0.121:8000/api/sightings/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!mapRef.current) return

      if (response.ok) {
        const data: Sighting[] = await response.json()
        
        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []

        // Batch marker creation
        const newMarkers = data.map(sighting => {
          const marker = new mapboxgl.Marker({ color: '#F43F5E' })
            .setLngLat(sighting.location.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div style="color: black;">
                    <h3>Rat spotted!</h3>
                    <p>Reported: ${new Date(sighting.created_at).toLocaleString()}</p>
                  </div>
                `)
            )
            .addTo(mapRef.current!)
          
          return marker
        })

        markersRef.current = newMarkers
        setMarkers(newMarkers)
      }
    } catch (error) {
      console.error('Error loading markers:', error)
    }
  }, [token])

  const initMap = useCallback(() => {
    const mapDiv = document.getElementById('map')
    if (!mapDiv || mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [4.3517, 50.8503], // Default center
      zoom: 13,
      trackResize: true,
      fadeDuration: 0
    })

    mapRef.current.on('load', () => {
      // Get user location after map loads
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapRef.current) {
            mapRef.current.setCenter([
              position.coords.longitude,
              position.coords.latitude
            ])
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Keep default center if location access fails
          if (mapRef.current) {
            mapRef.current.setCenter([4.3517, 50.8503]) // Brussels
          }
        }
      )
      loadMarkers()
    })

    return mapRef.current
  }, [loadMarkers])

  // Initialize once
  useEffect(() => {
    initMap()

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [initMap])

  // Periodic reload
  useEffect(() => {
    if (!mapRef.current || !token) return

    const interval = setInterval(loadMarkers, 30000)
    return () => clearInterval(interval)
  }, [token, loadMarkers])

  
  
  


  return {
    markers,
    map: mapRef.current,
    reloadMarkers: loadMarkers
  }
}