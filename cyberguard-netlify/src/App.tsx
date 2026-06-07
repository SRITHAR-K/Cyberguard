// src/App.tsx
import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import ParticleCanvas from './components/ParticleCanvas'
import AppHeader from './components/AppHeader'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import AdminPage from './pages/AdminPage'

function Inner() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
          <span className="font-display text-sm tracking-widest text-brand-cyan">LOADING…</span>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <>
      <AppHeader activePage={page} setPage={setPage} />
      {page === 'dashboard' && <DashboardPage />}
      {page === 'history'   && <HistoryPage />}
      {page === 'admin'     && user.role === 'admin' && <AdminPage />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ParticleCanvas />
      <div className="bg-glow" />
      <div className="bg-scan" />
      <div id="cg-root">
        <Inner />
      </div>
      {/* Domain badge */}
      <div className="fixed bottom-3 right-4 z-50 pointer-events-none
        bg-[rgba(56,189,248,.09)] border border-[rgba(56,189,248,.25)]
        rounded-full text-[#bae6fd] text-[0.68rem] px-3.5 py-1 font-sans tracking-wide">
        cyberguard.io
      </div>
    </AuthProvider>
  )
}
