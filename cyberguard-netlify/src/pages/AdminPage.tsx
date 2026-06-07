// src/pages/AdminPage.tsx
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { api } from '../api/client'
import { sevColor } from '../utils/severity'

interface Stats {
  totalUsers: number
  totalUploads: number
  threatBreakdown: { severity: string; cnt: string }[]
}
interface User {
  id: string; username: string; email: string;
  verified: boolean; role: string; created_at: string; last_login: string | null
}
interface Log {
  id: string; action: string; email: string | null; ip_addr: string | null; created_at: string
}

export default function AdminPage() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [users,   setUsers]   = useState<User[]>([])
  const [logs,    setLogs]    = useState<Log[]>([])
  const [tab,     setTab]     = useState<'stats'|'users'|'audit'>('stats')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/audit'),
    ]).then(([s, u, l]) => {
      setStats(s)
      setUsers(u.users)
      setLogs(l.logs)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="panel">
        <h1 className="font-display text-xl font-black tracking-widest text-[#e6eefc] m-0 mb-5">
          ADMIN PANEL
        </h1>
        <div className="flex gap-1">
          {(['stats','users','audit'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${tab===t ? 'bg-[rgba(56,189,248,.16)] text-brand-cyan border border-[rgba(56,189,248,.30)]'
                           : 'text-[#94a3b8] hover:text-[#e6eefc]'}`}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'stats' && stats && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="panel text-center">
                  <div className="font-display text-4xl font-black text-brand-cyan">{stats.totalUsers}</div>
                  <div className="text-[#94a3b8] text-xs tracking-widest uppercase mt-1">Total Users</div>
                </div>
                <div className="panel text-center">
                  <div className="font-display text-4xl font-black text-brand-cyan">{stats.totalUploads}</div>
                  <div className="text-[#94a3b8] text-xs tracking-widest uppercase mt-1">Total Analyses</div>
                </div>
              </div>
              <div className="panel">
                <h2 className="font-display text-sm tracking-widest text-[#e6eefc] m-0 mb-4">Platform Threat Breakdown</h2>
                {stats.threatBreakdown.map(({ severity, cnt }) => (
                  <div key={severity} className="flex justify-between text-sm py-2 border-b border-[rgba(148,163,184,.08)]">
                    <span style={{ color: sevColor(severity) }} className="font-semibold">{severity}</span>
                    <span className="font-mono text-[#e6eefc]">{cnt}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'users' && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="panel overflow-x-auto">
              <h2 className="font-display text-sm tracking-widest text-[#e6eefc] m-0 mb-4">Registered Users</h2>
              <table className="cg-table">
                <thead>
                  <tr>
                    <th>Username</th><th>Email</th><th>Role</th><th>Verified</th><th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="font-semibold">{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          u.role==='admin' ? 'bg-[rgba(56,189,248,.12)] text-brand-cyan' : 'bg-white/5 text-[#94a3b8]'
                        }`}>{u.role}</span>
                      </td>
                      <td>{u.verified ? '✅' : '⏳'}</td>
                      <td className="text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {tab === 'audit' && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="panel overflow-x-auto">
              <h2 className="font-display text-sm tracking-widest text-[#e6eefc] m-0 mb-4">Audit Log</h2>
              <table className="cg-table">
                <thead>
                  <tr><th>Action</th><th>User</th><th>IP</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id}>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          l.action==='login' ? 'bg-[rgba(16,185,129,.12)] text-[#10b981]' :
                          l.action==='logout' ? 'bg-[rgba(94,234,212,.08)] text-[#5eead4]' :
                          'bg-[rgba(56,189,248,.10)] text-brand-cyan'
                        }`}>{l.action}</span>
                      </td>
                      <td className="text-xs">{l.email || '—'}</td>
                      <td className="font-mono text-xs">{l.ip_addr || '—'}</td>
                      <td className="text-xs">{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
