import { useEffect } from 'react'
import useMapbox from '../hooks/useMapbox'

export function Map() {
  const { markers } = useMapbox()
  
  useEffect(() => {
    console.log('Map container rendered')
  }, [])

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">RatLogger</h1>
        <div 
          id="map" 
          className="w-full h-[600px] rounded-lg relative bg-slate-800"
          style={{ minHeight: '600px' }}
        />
        <p className="mt-4">Rats reported: {markers.length}</p>
      </div>
    </main>
  )
}