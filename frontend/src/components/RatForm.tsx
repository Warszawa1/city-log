import { useState } from 'react'
import { LngLat } from 'mapbox-gl'
import { CameraCapture } from './CameraCapture'

interface RatFormProps {
  position: LngLat | null;
  onSubmit: (formData: FormData) => void;
}

export function RatForm({ position, onSubmit }: RatFormProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!position) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('longitude', position.lng.toString())
      formData.append('latitude', position.lat.toString())
      if (photo) {
        formData.append('photo', photo)
      }

      await onSubmit(formData)
      setPhoto(null)
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 p-4">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div className="text-sm text-gray-300">Optional: Add a photo</div>
        <CameraCapture onPhotoCapture={setPhoto} />
        <button 
          type="submit"
          disabled={!position || isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Reporting...' : 'Report Rat'}
        </button>
      </form>
    </div>
  )
}