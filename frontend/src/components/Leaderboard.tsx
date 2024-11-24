import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Trophy, Target, Award, MapPin } from 'lucide-react'

interface LeaderboardUser {
  username: string
  points: number
  rank: string
  reports_count: number
}

interface StatsData {
  totalReports: number
  userReports: number
  topAreas: Array<{
    area: string
    count: number
  }>
}

export function Leaderboard() {
    const [users, setUsers] = useState<LeaderboardUser[]>([])
    const [stats, setStats] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { token, user } = useAuth()
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true)
          setError(null)
          
          // Fetch leaderboard
          const leaderboardResponse = await fetch('/api/leaderboard/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
  
          // Fetch stats
          const statsResponse = await fetch('/api/sightings/stats/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
  
          if (!leaderboardResponse.ok || !statsResponse.ok) {
            throw new Error('Failed to fetch data')
          }
  
          const [leaderboardData, statsData] = await Promise.all([
            leaderboardResponse.json(),
            statsResponse.json()
          ])
          
          setUsers(leaderboardData)
          setStats(statsData)
        } catch (error) {
          console.error('Error fetching data:', error)
          setError('Failed to load leaderboard data')
        } finally {
          setLoading(false)
        }
      }
  
      if (token) {
        fetchData()
      }
    }, [token])

  const statsCards = [
    {
      icon: <Trophy className="w-6 h-6 text-yellow-400" />,
      title: "Your Rank",
      value: user?.rank || "Novice",
      subtitle: `${user?.points || 0} points`
    },
    {
      icon: <Target className="w-6 h-6 text-blue-400" />,
      title: "Your Reports",
      value: user?.reports_count || 0,
      subtitle: "Sightings reported"
    },
    {
      icon: <Award className="w-6 h-6 text-green-400" />,
      title: "Total Reports",
      value: stats?.totalReports || 0,
      subtitle: "By all hunters"
    }
  ]

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'master':
        return 'text-yellow-400'
      case 'expert':
        return 'text-blue-400'
      case 'hunter':
        return 'text-green-400'
      default:
        return 'text-slate-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-700/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700/50 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-[#1a2234] rounded-lg p-4">
            <div className="flex items-center gap-3">
              {card.icon}
              <div>
                <h3 className="text-sm font-medium text-slate-400">{card.title}</h3>
                <p className="text-xl font-bold">{card.value}</p>
                <p className="text-sm text-slate-400">{card.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-[#1a2234] rounded-lg p-4">
        <h2 className="text-lg font-bold mb-4">Top Rat Hunters</h2>
        <div className="space-y-2">
          {users.map((leaderboardUser, index) => (
            <div 
              key={leaderboardUser.username}
              className={`flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 transition-colors ${
                leaderboardUser.username === user?.username ? 'border border-blue-500/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-400">
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {leaderboardUser.username}
                    {leaderboardUser.username === user?.username && 
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">You</span>
                    }
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <span className="text-slate-400">{leaderboardUser.reports_count} reports</span>
                    <span className="text-slate-400">•</span>
                    <span className={getRankColor(leaderboardUser.rank)}>{leaderboardUser.rank}</span>
                  </p>
                </div>
              </div>
              <div className="text-yellow-400 font-bold">
                {leaderboardUser.points} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Spots */}
      {stats?.topAreas && stats.topAreas.length > 0 && (
        <div className="bg-[#1a2234] rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Hot Spots</h2>
          <div className="space-y-2">
            {stats.topAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span className="text-sm">{area.area}</span>
                </div>
                <span className="text-sm text-slate-400">{area.count} sightings</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}