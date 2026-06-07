// src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { auth as authApi } from '../api/client'

interface User { id: string; username: string; email: string; role: string }
interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<unknown>
  verifyOtp: (email: string, otp: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx>(null!)
export const useAuth = () => useContext(Ctx)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tok = localStorage.getItem('cg_tok')
    if (!tok) { setLoading(false); return }
    authApi.me()
      .then(d => setUser(d.user))
      .catch(() => localStorage.removeItem('cg_tok'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const d = await authApi.login({ email, password })
    localStorage.setItem('cg_tok', d.token)
    setUser(d.user)
  }

  const register = async (username: string, email: string, password: string): Promise<unknown> => {
    return authApi.register({ username, email, password })
  }

  const verifyOtp = async (email: string, otp: string) => {
    const d = await authApi.verifyOtp({ email, otp })
    localStorage.setItem('cg_tok', d.token)
    setUser(d.user)
  }

  const logout = () => {
    authApi.logout().catch(() => {})
    localStorage.removeItem('cg_tok')
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, verifyOtp, logout }}>
      {children}
    </Ctx.Provider>
  )
}
