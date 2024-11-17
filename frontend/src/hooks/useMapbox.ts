import { useState, useEffect, useCallback, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useAuth } from './useAuth'


interface Sighting {
  id: number;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  description: string;
  created_at: string;
}


export default function useMapbox() {
  const mapContainer = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([])
  const [selectedPosition, setSelectedPosition] = useState<mapboxgl.LngLat | null>(null)
  const { token } = useAuth()

  // Add this cleanup effect first, before other effects
  useEffect(() => {
    return () => {
      // Cleanup markers when component unmounts
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, []);


  useEffect(() => {
    const loadExistingMarkers = async () => {
      if (token && map) {
        try {
          console.log('Loading existing markers...');
          const response = await fetch('http://localhost:8000/api/sightings/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data: Sighting[] = await response.json();
            console.log(`Loaded ${data.length} sightings`);
            
            // Clear existing markers
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            // Add new markers
            data.forEach((sighting: Sighting) => {
              if (map) {
                const marker = new mapboxgl.Marker({
                  color: '#F43F5E'
                })
                  .setLngLat([sighting.location.coordinates[0], sighting.location.coordinates[1]])
                  .setPopup(
                    new mapboxgl.Popup({ offset: 25 })
                      .setHTML('<h3>Rat spotted!</h3>')
                  )
                  .addTo(map);

                markersRef.current.push(marker);
              }
            });
            setMarkers([...markersRef.current]);
          }
        } catch (error) {
          console.error('Error loading markers:', error);
        }
      }
    };

    loadExistingMarkers();
  }, [token, map]);
  

  const addMarker = useCallback(async (lngLat: mapboxgl.LngLat) => {
    if (mapContainer.current && token) {
      try {
        console.log('Sending data:', {
          longitude: lngLat.lng,
          latitude: lngLat.lat,
        });
  
        const response = await fetch('http://localhost:8000/api/sightings/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            longitude: lngLat.lng,
            latitude: lngLat.lat,
            description: 'Rat spotted here'
          })
        });
  
        const data = await response.json();
        console.log('Response data:', data);
  
        if (response.ok) {
          const marker = new mapboxgl.Marker({
            color: '#F43F5E'
          })
            .setLngLat(lngLat)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML('<h3>Rat spotted!</h3>')
            )
            .addTo(mapContainer.current);
  
          markersRef.current.push(marker);
          setMarkers([...markersRef.current]);
        } else {
          throw new Error(data.message || 'Failed to save marker');
        }
      } catch (error) {
        console.error('Error saving marker:', error);
      }
    }
  }, [token]);
  

  const initMap = useCallback((center: [number, number]) => {
    console.log('Initializing map...')
    try {
      if (mapContainer.current) {
        console.log('Map already initialized')
        return
      }

      console.log('Creating new map instance')
      const mapInstance = new mapboxgl.Map({
        container: 'map',
        // style: 'mapbox://styles/mapbox/dark-v11',
        center,
        zoom: 13,
        preserveDrawingBuffer: true
      })

      mapInstance.once('load', () => {
        console.log('Map loaded successfully')
      })

      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e)
      })

      mapInstance.on('click', (e) => {
        console.log('Map clicked:', e.lngLat)
        setSelectedPosition(e.lngLat)
        addMarker(e.lngLat)
      })

      mapContainer.current = mapInstance
      setMap(mapInstance)
    } catch (error) {
      console.error('Map creation error:', error)
    }
  }, [addMarker])

  // Geolocation effect
useEffect(() => {
  console.log('Geolocation effect starting...')
  let isActive = true  // Flag to prevent updates after unmount

  const setupMap = async () => {
      console.log('Setting up map...')
      navigator.geolocation.getCurrentPosition(
          (position) => {
              if (!isActive) return
              console.log('Geolocation success:', {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
              })
              initMap([position.coords.longitude, position.coords.latitude])
          },
          (error) => {
              if (!isActive) return
              console.log('Geolocation error:', error.message)
              console.log('Using default Barcelona location')
              initMap([2.154007, 41.390205])
          },
          {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
          }
      )
  }

  setupMap()

  return () => {
      console.log('Cleanup: Geolocation effect')
      isActive = false
      if (mapContainer.current) {
          console.log('Removing map instance')
          mapContainer.current.remove()
          mapContainer.current = null
      }
  }
}, [initMap])

  return { map, markers, setMarkers, selectedPosition, setSelectedPosition }
}