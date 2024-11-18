import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Achievement } from '../types/user'

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const { token } = useAuth()

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('http://192.168.0.121:8000/api/users/achievements/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setAchievements(data)
        }
      } catch (error) {
        console.error('Error fetching achievements:', error)
      }
    }

    fetchAchievements()
  }, [token])

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">Achievements</h2>
      <div className="grid grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`p-4 rounded-lg ${
              achievement.earned_at 
                ? 'bg-blue-900/50' 
                : 'bg-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <h3 className="font-medium">{achievement.name}</h3>
                <p className="text-sm text-slate-400">{achievement.description}</p>
              </div>
            </div>
            {achievement.earned_at && (
              <p className="text-xs text-slate-400 mt-2">
                Earned: {new Date(achievement.earned_at).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm mt-1 text-yellow-400">+{achievement.points} points</p>
          </div>
        ))}
      </div>
    </div>
  )
}