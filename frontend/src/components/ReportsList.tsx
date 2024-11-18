import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface Report {
  id: number
  location: {
    coordinates: [number, number]
  }
  created_at: string
  description: string
}

export function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const { token } = useAuth()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://192.168.0.121:8000/api/sightings/my/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setReports(data)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      }
    }
    fetchReports()
  }, [token])

  return (
    <div className="space-y-4">
      {reports.map(report => (
        <div key={report.id} className="bg-slate-800 p-4 rounded">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400">
                {new Date(report.created_at).toLocaleString()}
              </p>
              <p className="mt-1">{report.description}</p>
            </div>
            <button 
              onClick={() => {
                // Will add map centering later
              }}
              className="text-blue-400 text-sm"
            >
              View on map
            </button>
          </div>
          <div className="mt-2 text-sm text-slate-400">
            Coordinates: {report.location.coordinates.join(', ')}
          </div>
        </div>
      ))}
    </div>
  )
}