// src/utils/severity.ts
export const SEV_LEVELS = ['Critical','High','Medium','Low','Normal'] as const
export type Severity = typeof SEV_LEVELS[number]

export const sevColor = (s: string): string => ({
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#eab308',
  Low:      '#3b82f6',
  Normal:   '#10b981',
}[s] || '#94a3b8')

export const sevBg = (s: string): string => ({
  Critical: 'rgba(239,68,68,.16)',
  High:     'rgba(249,115,22,.16)',
  Medium:   'rgba(234,179,8,.16)',
  Low:      'rgba(59,130,246,.16)',
  Normal:   'rgba(16,185,129,.16)',
}[s] || 'rgba(148,163,184,.12)')

export const statusInfo = (label: string) => {
  if (label === 'CRITICAL THREAT') return { col: '#ef4444', emoji: '🚨' }
  if (label === 'HIGH RISK')       return { col: '#f97316', emoji: '⚠️' }
  if (label === 'ELEVATED')        return { col: '#eab308', emoji: '🔔' }
  if (label === 'LOW RISK')        return { col: '#3b82f6', emoji: '🔵' }
  return { col: '#10b981', emoji: '✅' }
}
