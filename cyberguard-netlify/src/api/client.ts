// src/api/client.ts
// On Netlify, /api/* is rewritten to /.netlify/functions/* via netlify.toml
const BASE = '/api'

const getToken = () => localStorage.getItem('cg_tok') || ''

const headers = (extra?: Record<string, string>) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
})

const req = async (method: string, path: string, body?: unknown) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  get:    (path: string)                => req('GET',    path),
  post:   (path: string, body: unknown) => req('POST',   path, body),
  delete: (path: string)                => req('DELETE', path),

  upload: async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${BASE}/analysis/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  },
}

export const auth = {
  register: (b: { username: string; email: string; password: string }) =>
    api.post('/auth/register', b),
  verifyOtp: (b: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', b),
  login: (b: { email: string; password: string }) =>
    api.post('/auth/login', b),
  me:     () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout', {}),
}
