// src/components/AppHeader.tsx
import { useAuth } from '../hooks/useAuth'

interface Props {
  activePage: string
  setPage: (p: string) => void
}

export default function AppHeader({ activePage, setPage }: Props) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-7 py-3.5
      bg-[rgba(6,13,31,.90)] border-b border-[rgba(56,189,248,.18)] backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="text-xl">🛡</span>
        <span className="font-display font-black text-base tracking-widest text-[#e6eefc] hidden sm:block">
          CYBERGUARD
        </span>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'history',   label: 'History' },
          ...(user?.role === 'admin' ? [{ key: 'admin', label: 'Admin' }] : []),
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setPage(key)}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all font-sans
              ${activePage === key
                ? 'bg-[rgba(56,189,248,.16)] text-brand-cyan border border-[rgba(56,189,248,.30)]'
                : 'text-[#94a3b8] hover:text-[#e6eefc] hover:bg-white/[.05]'}`}>
            {label}
          </button>
        ))}
      </nav>

      {/* User chip */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[rgba(56,189,248,.08)] border border-[rgba(56,189,248,.20)]
          rounded-full px-3 py-1.5 text-[0.78rem] text-[#bae6fd] hidden sm:flex">
          <span className="w-2 h-2 rounded-full bg-brand-emerald shadow-[0_0_8px_#10b981]" />
          {user?.username}
        </div>
        <button onClick={logout}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#fca5a5]
            bg-[rgba(239,68,68,.10)] border border-[rgba(239,68,68,.28)]
            hover:bg-[rgba(239,68,68,.22)] transition-colors">
          Logout
        </button>
      </div>
    </header>
  )
}
