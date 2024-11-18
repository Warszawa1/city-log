import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ReportsList } from './ReportsList'
import { User } from '../types/user'
import { Achievements } from './Achievements'


interface GlobalStats {
 totalReports: number
 topAreas: Array<{
   area: string
   count: number
 }>
}


export function StatsView() {
 const [view, setView] = useState<'personal' | 'global'>('personal')
 const [stats, setStats] = useState<GlobalStats | null>(null)
 const { token, user } = useAuth()

 useEffect(() => {
   const fetchStats = async () => {
     try {
       const response = await fetch('http://192.168.0.121:8000/api/sightings/stats/', {
         headers: {
           'Authorization': `Bearer ${token}`
         }
       })
       if (response.ok) {
         const data = await response.json()
         setStats(data)
       }
     } catch (error) {
       console.error('Error fetching stats:', error)
     }
   }
   fetchStats()
 }, [token])

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

     <div className="p-4">
       {view === 'personal' ? (
         <div>
           <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-slate-800 p-4 rounded-lg">
               <h3 className="text-sm font-medium text-slate-400">Your Reports</h3>
               <p className="text-2xl mt-1">{user?.reports_count || 0}</p>
             </div>
             <div className="bg-slate-800 p-4 rounded-lg">
               <h3 className="text-sm font-medium text-slate-400">Rank</h3>
               <p className="text-2xl mt-1">{user?.rank || 'Novice'}</p>
             </div>
           </div>
           <ReportsList />
         </div>
       ) : (
         <div>
           <div className="bg-slate-800 rounded-lg p-4 mb-6">
             <h2 className="text-lg font-bold mb-4">Global Statistics</h2>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <h3 className="text-sm font-medium text-slate-400">Total Reports</h3>
                 <p className="text-2xl mt-1">{stats?.totalReports || 0}</p>
               </div>
               <div>
                 <h3 className="text-sm font-medium text-slate-400">Hot Spots</h3>
                 <div className="mt-2 text-sm">
                   {stats?.topAreas.map(area => (
                     <div key={area.area} className="flex justify-between mb-1">
                       <span>{area.area}</span>
                       <span>{area.count}</span>
                     </div>
                   ))}
                 </div>
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