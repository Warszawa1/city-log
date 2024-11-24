import { useState, useEffect } from 'react'

export function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 2000) // Show splash for 2 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center">
      <div className="animate-fade-in flex flex-col items-center">
        {/* Logo */}
        <div className="w-24 h-24 mb-4">
          <img 
            src="/pwa-192x192.png" 
            alt="RatLogger" 
            className="w-full h-full"
          />
        </div>
        
        {/* App Name */}
        <h1 className="text-2xl font-bold text-white mb-8">
          RatLogger
        </h1>
        
        {/* Loading indicator */}
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}