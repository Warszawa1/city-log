import { useState, useRef } from 'react'

interface CameraCaptureProps {
  onPhotoCapture: (photo: File) => void
}

export function CameraCapture({ onPhotoCapture }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on phones
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCapturing(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const takePhoto = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'rat-photo.jpg', { type: 'image/jpeg' })
            setPreview(URL.createObjectURL(blob))
            onPhotoCapture(file)
            stopCamera()
          }
        }, 'image/jpeg')
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setIsCapturing(false)
    }
  }

  return (
    <div className="relative">
      {!isCapturing && !preview && (
        <button
          type="button"
          onClick={startCamera}
          className="w-full p-2 bg-blue-600 text-white rounded"
        >
          Open Camera
        </button>
      )}

      {isCapturing && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-[200px] object-cover rounded"
          />
          <button
            type="button"
            onClick={takePhoto}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2
                     w-12 h-12 bg-white rounded-full border-4 border-blue-600"
          />
        </div>
      )}

      {preview && (
        <div className="relative">
          <img 
            src={preview} 
            alt="Captured photo" 
            className="w-full h-[200px] object-cover rounded"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null)
              startCamera()
            }}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full"
          >
            ↺
          </button>
        </div>
      )}
    </div>
  )
}