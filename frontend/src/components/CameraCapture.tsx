// src/components/CameraCapture.tsx
import { useRef, useEffect, useState } from 'react'

interface CameraCaptureProps {
 onCapture: (file: File) => void
 onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
 const videoRef = useRef<HTMLVideoElement>(null)
 const streamRef = useRef<MediaStream | null>(null)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
   startCamera()
   return () => stopCamera()
 }, [])

 const startCamera = async () => {
   try {
     const stream = await navigator.mediaDevices.getUserMedia({
       video: { 
         facingMode: 'environment',
         width: { ideal: 1280 },
         height: { ideal: 720 }
       }
     })
     
     if (videoRef.current) {
       videoRef.current.srcObject = stream
       streamRef.current = stream
     }
   } catch (err) {
     setError('Could not access camera')
     console.error('Camera error:', err)
   }
 }

 const stopCamera = () => {
   if (streamRef.current) {
     streamRef.current.getTracks().forEach(track => track.stop())
     streamRef.current = null
   }
 }

 const takePhoto = () => {
   if (videoRef.current) {
     const canvas = document.createElement('canvas')
     canvas.width = videoRef.current.videoWidth
     canvas.height = videoRef.current.videoHeight
     
     const ctx = canvas.getContext('2d')
     if (ctx) {
       ctx.drawImage(videoRef.current, 0, 0)
       canvas.toBlob((blob) => {
         if (blob) {
           const file = new File([blob], 'rat-photo.jpg', { type: 'image/jpeg' })
           onCapture(file)
           stopCamera()
           onClose()
         }
       }, 'image/jpeg', 0.8)
     }
   }
 }

 if (error) {
   return (
     <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4">
       <div className="bg-slate-800 p-4 rounded-lg max-w-md w-full">
         <p className="text-red-500 mb-4">{error}</p>
         <button
           onClick={onClose}
           className="w-full bg-blue-500 text-white p-3 rounded"
         >
           Close
         </button>
       </div>
     </div>
   )
 }

 return (
   <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4">
     <div className="relative w-full max-w-md">
       <video
         ref={videoRef}
         autoPlay
         playsInline
         className="w-full rounded-lg"
       />
       
       <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
         <button
           onClick={onClose}
           className="bg-red-500 text-white p-4 rounded-full"
         >
           Cancel
         </button>
         <button
           onClick={takePhoto}
           className="bg-white w-16 h-16 rounded-full border-4 border-blue-500"
         />
       </div>
     </div>
   </div>
 )
}