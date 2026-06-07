// src/pages/HistoryPage.tsx
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { api } from '../api/client'
import { sevColor } from '../utils/severity'

interface Upload {
  id: string
  filename: string
  file_size: number
  row_count: number
  status: string
  created_at: string
  total_records: number
  critical_count: number
  high_count: number
  threat_rate: number
  status_label: string
}

const fmt = (bytes: number) => {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1024/1024).toFixed(1)} MB`
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function HistoryPage() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analysis/history')
      .then(d => setUploads(d.uploads))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analysis?')) return
    await api.delete(`/analysis/${id}`)
    setUploads(u => u.filter(x => x.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="panel">
        <h1 className="font-display text-xl font-black tracking-widest text-[#e6eefc] m-0 mb-6">
          ANALYSIS HISTORY
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-14 text-[#94a3b8]">
            <div className="text-4xl mb-3">📭</div>
            <div>No analysis history yet. Upload a file from the Dashboard.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {uploads.map((up, i) => {
              const sl = up.status_label || '—'
              const col = sl === 'CRITICAL THREAT' ? '#ef4444'
                        : sl === 'HIGH RISK'       ? '#f97316'
                        : sl === 'ELEVATED'        ? '#eab308'
                        : sl === 'LOW RISK'        ? '#3b82f6'
                        : '#10b981'
              return (
                <motion.div key={up.id}
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between gap-4 bg-[rgba(10,18,42,.6)]
                    border border-[rgba(56,189,248,.14)] rounded-2xl p-4 hover:border-[rgba(56,189,248,.30)]
                    transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[#e6eefc] font-semibold truncate max-w-[220px]">
                        {up.filename}
                      </span>
                      <span className="text-[.7rem] px-2 py-0.5 rounded-full font-bold tracking-wide"
                        style={{ color: col, background: `${col}1a`, border: `1px solid ${col}40` }}>
                        {sl}
                      </span>
                      <span className={`text-[.7rem] px-2 py-0.5 rounded-full ${
                        up.status === 'done' ? 'bg-[rgba(16,185,129,.12)] text-[#10b981]' : 'bg-[rgba(234,179,8,.12)] text-[#eab308]'
                      }`}>{up.status}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-[#94a3b8] flex-wrap">
                      <span>📅 {fmtDate(up.created_at)}</span>
                      <span>📦 {fmt(up.file_size)}</span>
                      <span>📊 {up.row_count ?? up.total_records ?? '—'} rows</span>
                      {up.threat_rate != null && (
                        <span>⚠️ <span style={{ color: sevColor('High') }}>{up.threat_rate}%</span> threat rate</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(up.id)}
                    className="text-[#94a3b8] hover:text-[#ef4444] text-lg transition-colors flex-shrink-0"
                    title="Delete">
                    🗑
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
