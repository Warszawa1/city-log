import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Achievement } from '../types/user'

interface AchievementsResponse {
  achievements: Achievement[];
  user_stats: {
    total_points: number;
    rank: string;
    reports_count: number;
    achievements_earned: number;
  };
}

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!token) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      try {
        console.log('Fetching achievements with token:', token) // Debug log
        const response = await fetch('/api/users/achievements/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Response status:', response.status) // Debug log

        if (!response.ok) {
          const errorData = await response.text()
          console.error('Error response:', errorData) // Debug log
          throw new Error(errorData || 'Failed to fetch achievements')
        }

        const data: AchievementsResponse = await response.json()
        console.log('Achievements data:', data) // Debug log
        setAchievements(data.achievements)
        setError(null)
      } catch (error) {
        console.error('Error fetching achievements:', error)
        setError(error instanceof Error ? error.message : 'Failed to load achievements')
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [token])

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-red-400">
          <h2 className="text-lg font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">Achievements</h2>
      {achievements.length === 0 ? (
        <p className="text-slate-400">No achievements available yet</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg ${
                achievement.earned_at ? 'bg-blue-900/50 border border-blue-500/30' : 'bg-slate-700/50'
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
              
              <p className="text-sm mt-1 text-yellow-400 flex items-center gap-1">
                <span>+{achievement.points}</span>
                <span className="text-xs text-slate-400">points</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}