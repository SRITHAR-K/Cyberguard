// src/pages/DashboardPage.tsx
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { SEV_LEVELS, sevColor, sevBg, statusInfo } from '../utils/severity'

interface Summary {
  counts: Record<string, number>
  total:  number
  threatRate: number
  statusLabel: string
}
interface AnalysisResult {
  uploadId: string
  summary:  Summary
  columns:  string[]
  preview:  Record<string, unknown>[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [result,   setResult]   = useState<AnalysisResult | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['csv','xlsx','xls'].includes(ext)) {
      setError('Only CSV or Excel files are supported.'); return
    }
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await api.upload(file)
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally { setLoading(false) }
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const chartData = result
    ? SEV_LEVELS.map(s => ({ name: s, count: result.summary.counts[s] || 0 }))
    : []

  const si = result ? statusInfo(result.summary.statusLabel) : null

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

      {/* Welcome */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="panel">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-xl font-black tracking-widest text-[#e6eefc] m-0">
              THREAT ANALYSIS
            </h1>
            <p className="text-[#94a3b8] text-sm mt-1">
              Welcome back, <span className="text-brand-cyan">{user?.username}</span>. Upload a network log to begin.
            </p>
          </div>
          <div className="flex gap-2 text-xs text-[#94a3b8]">
            <span className="px-3 py-1.5 rounded-full bg-[rgba(56,189,248,.08)] border border-[rgba(56,189,248,.18)] text-[#bae6fd]">
              CSV / XLSX / XLS
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[rgba(56,189,248,.08)] border border-[rgba(56,189,248,.18)] text-[#bae6fd]">
              Max 50 MB
            </span>
          </div>
        </div>
      </motion.div>

      {/* Upload zone */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.08 }}>
        <div
          className={`upload-zone ${dragging ? 'drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if(f) handleFile(f) }} />
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
              <span className="text-[#94a3b8] text-sm">Analysing threats…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">📁</div>
              <div className="text-[#e6eefc] font-semibold">Drop file here or click to browse</div>
              <div className="text-[#94a3b8] text-sm">CSV, XLSX, or XLS — network traffic logs</div>
            </div>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="msg-error mt-3">{error}</motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && si && (
          <motion.div key="results" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            className="flex flex-col gap-6">

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {[
                { val: result.summary.total,              lbl: 'Total Records',     cls: 'text-brand-cyan' },
                { val: result.columns.length,             lbl: 'Columns',           cls: 'text-brand-cyan' },
                { val: (result.summary.counts.Critical||0)+(result.summary.counts.High||0),
                                                          lbl: 'Threats Detected',  cls: 'text-brand-red' },
                { val: `${result.summary.threatRate}%`,   lbl: 'Threat Rate',       cls: 'text-brand-amber' },
              ].map(({ val, lbl, cls }) => (
                <motion.div key={lbl} className="panel text-center" whileHover={{ scale:1.02 }}>
                  <div className={`font-display text-3xl font-black leading-none ${cls}`}>{val}</div>
                  <div className="text-[#94a3b8] text-[.68rem] tracking-widest uppercase mt-1.5">{lbl}</div>
                </motion.div>
              ))}
            </div>

            {/* Status + severity bars */}
            <div className="panel">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                <h2 className="font-display text-base tracking-widest m-0" style={{ color: si.col }}>
                  {si.emoji} {result.summary.statusLabel}
                </h2>
                <span className="text-[#94a3b8] text-sm">
                  High/Critical rate: <strong className="text-[#e6eefc]">{result.summary.threatRate}%</strong>
                </span>
              </div>
              {SEV_LEVELS.map(s => {
                const cnt = result.summary.counts[s] || 0
                const pct = result.summary.total > 0 ? (cnt / result.summary.total) * 100 : 0
                const col = sevColor(s)
                return (
                  <div key={s} className="mb-3.5">
                    <div className="flex justify-between text-sm font-semibold mb-1.5">
                      <span style={{ color: col }}>{s}</span>
                      <span className="font-mono text-[#e6eefc]">{cnt}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgba(148,163,184,.14)] overflow-hidden">
                      <motion.div className="sev-fill h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: .7, ease: [.22,.68,0,1] }}
                        style={{ background: col }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Chart */}
            <div className="panel">
              <h2 className="font-display text-base tracking-widest m-0 mb-4 text-[#e6eefc]">
                Severity Distribution
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top:6, right:10, left:-10, bottom:0 }}>
                  <XAxis dataKey="name" tick={{ fill:'#94a3b8', fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background:'rgba(6,13,31,.92)', border:'1px solid rgba(56,189,248,.30)', borderRadius:10 }}
                    labelStyle={{ color:'#e6eefc' }} itemStyle={{ color:'#bae6fd' }}
                    cursor={{ fill:'rgba(56,189,248,.06)' }} />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {chartData.map(e => <Cell key={e.name} fill={sevColor(e.name)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Notifications */}
            <div className="panel">
              <h2 className="font-display text-base tracking-widest m-0 mb-4 text-[#e6eefc]">
                Security Notifications
              </h2>
              <div className="flex flex-col gap-2.5">
                {(result.summary.counts.Critical||0) > 0 && (
                  <div className="flex gap-3.5 items-start p-3.5 rounded-xl border notif-crit">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <div className="font-bold text-[#ef4444]">CRITICAL: {result.summary.counts.Critical} attack(s) detected</div>
                      <div className="text-[#c8d4e8] text-sm mt-0.5">Block source IPs immediately and alert the security team.</div>
                    </div>
                  </div>
                )}
                {(result.summary.counts.High||0) > 0 && (
                  <div className="flex gap-3.5 items-start p-3.5 rounded-xl border notif-high">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-bold text-[#f97316]">HIGH SEVERITY: {result.summary.counts.High} event(s)</div>
                      <div className="text-[#c8d4e8] text-sm mt-0.5">Isolate affected devices and review flagged packets.</div>
                    </div>
                  </div>
                )}
                {(result.summary.counts.Medium||0) > 0 && (
                  <div className="flex gap-3.5 items-start p-3.5 rounded-xl border notif-med">
                    <span className="text-2xl">🔔</span>
                    <div>
                      <div className="font-bold text-[#eab308]">MEDIUM: {result.summary.counts.Medium} event(s)</div>
                      <div className="text-[#c8d4e8] text-sm mt-0.5">Monitor closely. Rate-limit suspicious sources.</div>
                    </div>
                  </div>
                )}
                {(result.summary.counts.Normal||0) > 0 && (
                  <div className="flex gap-3.5 items-start p-3.5 rounded-xl border notif-norm">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-bold text-[#10b981]">NORMAL: {result.summary.counts.Normal} clean packet(s)</div>
                      <div className="text-[#c8d4e8] text-sm mt-0.5">No action required for these records.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="panel">
              <h2 className="font-display text-base tracking-widest m-0 mb-4 text-[#e6eefc]">
                Recommendations
              </h2>
              {[
                '🔒 Block all IPs linked to Critical/High events immediately.',
                '📱 Enable real-time push notifications for future detections.',
                '📊 Review Medium-severity traffic for escalation patterns.',
                '👤 Notify affected users to rotate their credentials.',
                '📄 Archive this report and submit to the security team.',
              ].map(r => (
                <div key={r} className="bg-[rgba(139,92,246,.07)] border-l-4 border-brand-violet
                  rounded-lg px-4 py-2.5 mb-2 text-sm text-[#e2eaf8]">{r}</div>
              ))}
            </div>

            {/* Data preview */}
            <div className="panel overflow-hidden">
              <h2 className="font-display text-base tracking-widest m-0 mb-2 text-[#e6eefc]">
                Data Preview <span className="text-[#94a3b8] font-sans text-xs normal-case tracking-normal ml-2">(first 20 rows)</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="cg-table">
                  <thead>
                    <tr>
                      {result.columns.slice(0, 8).map(col => (
                        <th key={col}>{col}</th>
                      ))}
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.preview.map((row, i) => (
                      <tr key={i}>
                        {result.columns.slice(0, 8).map(col => (
                          <td key={col} className="max-w-[120px] truncate text-xs">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                        <td>
                          <span className="px-2 py-0.5 rounded text-xs font-bold"
                            style={{ color: sevColor(row.severity as string), background: sevBg(row.severity as string) }}>
                            {String(row.severity)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
