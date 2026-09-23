// A browser-sized copy of the arithmetic in backend/analysis/risk_inputs.py
// and quantum_risk_engine.py, so the interactive worksheet on the site gives
// the same answer the app would for the same inputs.

export type Profile = { id: string; label: string; years: number }

// PROFILE_RETENTION_YEARS, in the order the app lists them.
export const PROFILES: Profile[] = [
  { id: 'session', label: 'Session', years: 0.5 },
  { id: 'general', label: 'General business', years: 3 },
  { id: 'financial', label: 'Financial records', years: 7 },
  { id: 'personal', label: 'Personal data', years: 10 },
  { id: 'health', label: 'Health records', years: 25 },
  { id: 'government', label: 'Government', years: 25 },
  { id: 'national', label: 'National security', years: 50 },
]

// Global Risk Institute, Quantum Threat Timeline Report 2025 (n=26).
// Only the 10 and 15 year bands are published; the rest are interpolated or
// extrapolated and are labelled that way wherever they surface.
const CURVE: [number, number, number, string][] = [
  [0, 0, 0, 'definition'],
  [5, 0.08, 0.15, 'interpolated'],
  [10, 0.28, 0.49, 'published'],
  [15, 0.51, 0.7, 'published'],
  [20, 0.7, 0.85, 'extrapolated'],
  [30, 0.9, 0.97, 'extrapolated'],
]

export function crqcWithin(years: number): { low: number; high: number; source: string } {
  if (years <= 0) return { low: 0, high: 0, source: 'definition' }
  const last = CURVE[CURVE.length - 1]
  if (years >= last[0]) return { low: last[1], high: last[2], source: 'extrapolated' }
  for (let i = 0; i < CURVE.length - 1; i++) {
    const [t0, l0, h0, s0] = CURVE[i]
    const [t1, l1, h1, s1] = CURVE[i + 1]
    if (years === t1) return { low: l1, high: h1, source: s1 }
    if (years >= t0 && years <= t1) {
      const f = (years - t0) / (t1 - t0)
      // A point between two rows is only as good as the weaker of them, and
      // is never itself a published figure.
      const source = s0 === 'extrapolated' || s1 === 'extrapolated' ? 'extrapolated' : 'interpolated'
      return { low: l0 + f * (l1 - l0), high: h0 + f * (h1 - h0), source }
    }
  }
  return { low: last[1], high: last[2], source: 'extrapolated' }
}

export type Band = 'Overdue' | 'High' | 'Medium' | 'Low'

export type Assessment = {
  slack: number
  startDate: Date
  crqcDate: Date
  band: Band
  exposureYears: number
  probability: { low: number; high: number; source: string }
}

const DAY = 24 * 60 * 60 * 1000
const YEAR_DAYS = 365.2425

export function addYears(from: Date, years: number): Date {
  return new Date(from.getTime() + Math.round(years * YEAR_DAYS) * DAY)
}

// Banding runs on slack, the years until work must begin, not on the raw
// X + Y - Z margin: overdue or under a year is High, under three is Medium.
export function assess(x: number, y: number, z: number, today = new Date()): Assessment {
  const slack = z - (x + y)
  const band: Band = slack < 0 ? 'Overdue' : slack < 1 ? 'High' : slack < 3 ? 'Medium' : 'Low'
  return {
    slack,
    startDate: addYears(today, slack),
    crqcDate: addYears(today, z),
    band,
    exposureYears: Math.max(0, x + y - z),
    probability: crqcWithin(x + y),
  }
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatYears(n: number): string {
  const r = Math.round(n * 10) / 10
  return `${r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)} ${Math.abs(r) === 1 ? 'year' : 'years'}`
}
