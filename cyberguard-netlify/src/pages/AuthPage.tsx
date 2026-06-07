// src/pages/AuthPage.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../hooks/useAuth'

type Tab = 'login' | 'register' | 'otp'

export default function AuthPage() {
  const { login, register, verifyOtp } = useAuth()
  const [tab, setTab]         = useState<Tab>('login')
  const [msg, setMsg]         = useState<{ text: string; kind: 'error' | 'success' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [devOtp, setDevOtp]   = useState('')   // shown after register in dev/demo

  const [lEmail, setLEmail] = useState('')
  const [lPw,    setLPw]    = useState('')
  const [rName,  setRName]  = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPw,    setRPw]    = useState('')
  const [otp,    setOtp]    = useState('')

  const go = async (fn: () => Promise<void>) => {
    setLoading(true); setMsg(null)
    try { await fn() }
    catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      setMsg({ text: errMsg, kind: 'error' })
    }
    finally { setLoading(false) }
  }

  const doLogin = () => go(async () => { await login(lEmail, lPw) })

  const doRegister = () => go(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await register(rName, rEmail, rPw)
    setPendingEmail(rEmail)
    // Netlify demo: backend returns _dev_otp
    if (res._dev_otp) { setDevOtp(res._dev_otp); setOtp(res._dev_otp) }
    setMsg({ text: res.message || res, kind: 'success' })
    setTab('otp')
  })

  const doOtp = () => go(async () => { await verifyOtp(pendingEmail, otp) })

  const msgClass = msg?.kind === 'error' ? 'msg-error' : msg?.kind === 'success' ? 'msg-success' : 'msg-info'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 0.68, 0, 1.2] }}
      >
        <div className="panel w-full">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[rgba(56,189,248,0.10)] border border-[rgba(56,189,248,0.38)]
              flex items-center justify-center text-2xl shadow-glow" style={{animation:'iconPulse 3s ease-in-out infinite'}}>
              🛡
            </div>
            <div>
              <div className="font-display font-black text-xl tracking-widest text-[#e6eefc]">CYBERGUARD</div>
              <div className="text-[0.62rem] tracking-[.3em] text-[#94a3b8] uppercase mt-0.5">
                Real-Time Attack Detection
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/[.04] rounded-xl p-1 gap-1 mb-6">
            {(['login','register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setMsg(null) }}
                className={`flex-1 py-2.5 rounded-[9px] text-sm font-semibold tracking-wide transition-all
                  ${tab === t
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-indigo text-white shadow-[0_2px_14px_rgba(56,189,248,.38)]'
                    : 'text-[#94a3b8] hover:text-[#e6eefc]'}`}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' && (
              <motion.div key="login" initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:12 }}>
                <label className="block text-[#c8d4e8] text-sm font-medium mb-1">Email</label>
                <input className="cg-input mb-4" type="email" placeholder="you@example.com"
                  value={lEmail} onChange={e => setLEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doLogin()} />
                <label className="block text-[#c8d4e8] text-sm font-medium mb-1">Password</label>
                <input className="cg-input" type="password" placeholder="••••••••"
                  value={lPw} onChange={e => setLPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doLogin()} />
                <button onClick={doLogin} disabled={loading}
                  className="w-full mt-4 py-3 rounded-[10px] bg-gradient-to-r from-brand-cyan to-blue-600
                    text-white font-bold font-sans tracking-wider shadow-[0_4px_20px_rgba(56,189,248,.32)]
                    transition-opacity hover:opacity-90 active:scale-[.98] disabled:opacity-50">
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>
              </motion.div>
            )}

            {tab === 'register' && (
              <motion.div key="register" initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-12 }}>
                <label className="block text-[#c8d4e8] text-sm font-medium mb-1">Username</label>
                <input className="cg-input mb-4" type="text" placeholder="Your name"
                  value={rName} onChange={e => setRName(e.target.value)} />
                <label className="block text-[#c8d4e8] text-sm font-medium mb-1">Email</label>
                <input className="cg-input mb-4" type="email" placeholder="you@example.com"
                  value={rEmail} onChange={e => setREmail(e.target.value)} />
                <label className="block text-[#c8d4e8] text-sm font-medium mb-1">Password</label>
                <input className="cg-input" type="password" placeholder="Min. 6 characters"
                  value={rPw} onChange={e => setRPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doRegister()} />
                <button onClick={doRegister} disabled={loading}
                  className="w-full mt-4 py-3 rounded-[10px] bg-gradient-to-r from-brand-violet to-brand-indigo
                    text-white font-bold font-sans tracking-wider shadow-[0_4px_20px_rgba(139,92,246,.30)]
                    transition-opacity hover:opacity-90 active:scale-[.98] disabled:opacity-50">
                  {loading ? 'Creating account…' : 'Create Account →'}
                </button>
              </motion.div>
            )}

            {tab === 'otp' && (
              <motion.div key="otp" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
                <p className="text-[#bae6fd] text-sm mb-3">
                  Enter the 6-digit code for <strong>{pendingEmail}</strong>.
                </p>
                {devOtp && (
                  <div className="bg-[rgba(234,179,8,.10)] border border-[rgba(234,179,8,.30)] rounded-lg
                    px-3 py-2 mb-3 text-[#eab308] text-xs">
                    <strong>Demo mode:</strong> your code is{' '}
                    <span className="font-display text-base tracking-widest">{devOtp}</span>
                    {' '}(pre-filled below)
                  </div>
                )}
                <label className="block text-[#c8d4e8] text-sm font-medium mb-1">Verification Code</label>
                <input className="cg-input text-center text-2xl tracking-[.5em] font-display"
                  type="text" inputMode="numeric" maxLength={6} placeholder="000000"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                  onKeyDown={e => e.key === 'Enter' && doOtp()} />
                <button onClick={doOtp} disabled={loading || otp.length < 6}
                  className="w-full mt-4 py-3 rounded-[10px] bg-gradient-to-r from-brand-cyan to-blue-600
                    text-white font-bold tracking-wider shadow-[0_4px_20px_rgba(56,189,248,.32)]
                    hover:opacity-90 disabled:opacity-40 transition-opacity">
                  {loading ? 'Verifying…' : 'Verify & Continue →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {msg && (
              <motion.div key="msg" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className={`mt-4 rounded-lg px-4 py-3 text-sm ${msgClass}`}>
                {msg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {tab === 'login' && (
            <p className="text-center text-[#94a3b8] text-xs mt-5">
              Demo: <span className="text-[#bae6fd]">admin@cyberguard.io</span> /{' '}
              <span className="text-[#bae6fd]">admin123</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
