// src/components/RatForm.tsx
import { useState } from 'react'
import { LngLat } from 'mapbox-gl'
import { CameraCapture } from './CameraCapture'

interface RatFormProps {
  position: LngLat | null;
  onSubmit: (data: FormData) => void;
}

export function RatForm({ position, onSubmit }: RatFormProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleCapture = (file: File) => {
    setPhoto(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 p-4">
        <div className="max-w-md mx-auto">
          {previewUrl && (
            <div className="mb-4 relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded"
              />
              <button
                onClick={() => {
                  setPhoto(null)
                  setPreviewUrl(null)
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowCamera(true)}
              className="flex-1 bg-blue-500 text-white p-3 rounded"
            >
              {photo ? 'Retake Photo' : 'Take Photo'}
            </button>
            <button
              onClick={() => {
                const formData = new FormData()
                if (position) {
                  formData.append('longitude', position.lng.toString())
                  formData.append('latitude', position.lat.toString())
                }
                if (photo) {
                  formData.append('photo', photo)
                }
                onSubmit(formData)
              }}
              disabled={!position}
              className="flex-1 bg-green-500 text-white p-3 rounded disabled:opacity-50"
            >
              Report Rat
            </button>
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  )
}