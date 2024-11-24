// src/components/StatsView.tsx
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ReportsList } from './ReportsList'
import { Achievement } from '../types/user'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'


const token = import.meta.env.VITE_MAPBOX_TOKEN
mapboxgl.accessToken = token



interface GlobalStats {
  totalReports: number;
  topAreas: Array<{
    area: string;
    count: number;
  }>;
}


interface AchievementsResponse {
  achievements: Achievement[];
  user_stats: {
    total_points: number;
    rank: string;
    reports_count: number;
    achievements_earned: number;
  };
}


export function StatsView() {
  const [view, setView] = useState<'personal' | 'global'>('personal')
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const { token, user } = useAuth()
  // const [ setUserReports] = useState(0)  // Add this state
  const [setError] = useState<string | null>(null)

  
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        console.log('Fetching stats with token:', token) // Debug log
        const response = await fetch('http://localhost:8000/api/sightings/stats/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Stats error:', errorText)
          throw new Error(errorText)
        }
        
        const data = await response.json()
        console.log('Stats data:', data) // Debug log
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Failed to load stats')
      }
    }

    

    const fetchAchievements = async () => {
      if (!token) return;
      
      try {
        console.log('Fetching achievements with token:', token) // Debug log
        const response = await fetch('http://localhost:8000/api/users/achievements/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Achievements error:', errorText)
          throw new Error(errorText)
        }
        
        const data: AchievementsResponse = await response.json()
        console.log('Achievements data:', data) // Debug log
        setAchievements(data.achievements)
      } catch (error) {
        console.error('Error fetching achievements:', error)
        setError('Failed to load achievements')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchStats()
      fetchAchievements()
    }
  }, [token, setError])


  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="sticky top-0 bg-slate-800 z-10">
        <div className="flex border-b border-slate-700">
          <button
            className={`flex-1 px-4 py-3 ${
              view === 'personal' ? 'border-b-2 border-blue-500' : ''
            }`}
            onClick={() => setView('personal')}
          >
            My Reports
          </button>
          <button
            className={`flex-1 px-4 py-3 ${
              view === 'global' ? 'border-b-2 border-blue-500' : ''
            }`}
            onClick={() => setView('global')}
          >
            All Reports
          </button>
        </div>
      </div>


      <div className="p-4 space-y-6">
        {view === 'personal' ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1a2234] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400">Your Reports</h3>
                <p className="text-2xl mt-1">{user?.reports_count || 0}</p>
              </div>
              <div className="bg-[#1a2234] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400">Points & Rank</h3>
                <div className="flex items-center gap-2">
                  <p className="text-2xl mt-1">{user?.points || 0}</p>
                  <span className="text-sm text-yellow-400">•</span>
                  <p className="text-sm text-slate-400">{user?.rank || 'Novice'}</p>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4">Achievements</h2>
              {loading ? (
                <div className="animate-pulse">
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              ) : achievements.length === 0 ? (
                <p className="text-slate-400">Report your first rat to start earning achievements!</p>
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

            <ReportsList />
          </>
        ) : (
          <div>
  <div className="bg-slate-800 rounded-lg p-4 mb-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold">Global Statistics</h2>
      <div className="bg-slate-700/50 px-4 py-2 rounded-lg">
        <span className="text-sm text-slate-400">Total Reports: </span>
        <span className="text-xl font-bold text-white">{stats?.totalReports || 0}</span>
      </div>
    </div>

    <div>
  <h3 className="text-sm font-medium text-slate-400 mb-3">Hot Spots</h3>
  <div className="space-y-2">
    {stats?.topAreas.map(area => (
      <div 
        key={area.area}
        className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg"
      >
        <span className="text-sm">{area.area}</span>
        <span className="text-yellow-400">{area.count} reports</span>
      </div>
    ))}
  </div>
</div>
  </div>
            
  <div className="bg-slate-800 rounded-lg p-4">
    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
    <ReportsList />
  </div>
</div>

        )}
      </div>
    </div>
  )
}

