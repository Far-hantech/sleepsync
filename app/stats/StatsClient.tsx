'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import StreakBadge from '@/components/sleep/StreakBadge'
import { format, parseISO } from 'date-fns'

interface SleepEntryRow {
  date: string
  quality_rating: number | null
  actual_sleep: string | null
  planned_sleep: string | null
  is_hit: boolean
  streak_count: number
}

interface StatsClientProps {
  entries: SleepEntryRow[]
  bestStreak: number
  currentStreak: number
  sleepGoalTime: string | null
  timezone: string
}

const ACCENT = '#7C6FF7'
const WARM = '#F59E6A'
const SUCCESS = '#4ADE80'
const MUTED = '#6B6A7A'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#13131A', border: '1px solid #1E1E2A', borderRadius: 8, padding: '8px 12px' }}>
      <p className="font-mono text-xs text-muted mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function StatsClient({ entries, bestStreak, currentStreak, sleepGoalTime, timezone }: StatsClientProps) {
  const router = useRouter()

  const qualityData = entries
    .filter(e => e.quality_rating != null)
    .map(e => ({
      date: format(parseISO(e.date), 'MMM d'),
      quality: e.quality_rating,
    }))

  const sleepTimeData = entries
    .filter(e => e.actual_sleep && e.planned_sleep)
    .map(e => {
      const actual = new Date(e.actual_sleep!)
      const planned = new Date(e.planned_sleep ?? e.actual_sleep!)
      const diffMins = Math.round((actual.getTime() - planned.getTime()) / 60000)
      return {
        date: format(parseISO(e.date), 'MMM d'),
        'Minutes off goal': diffMins,
        hit: e.is_hit,
      }
    })

  const avgQuality = entries
    .filter(e => e.quality_rating != null)
    .reduce((sum, e, _, arr) => sum + (e.quality_rating ?? 0) / arr.length, 0)

  const hitRate = entries.length
    ? Math.round((entries.filter(e => e.is_hit).length / entries.length) * 100)
    : 0

  // Best day of week
  const dayTotals: Record<string, { sum: number; count: number }> = {}
  entries.forEach(e => {
    if (e.quality_rating == null) return
    const day = format(parseISO(e.date), 'EEEE')
    if (!dayTotals[day]) dayTotals[day] = { sum: 0, count: 0 }
    dayTotals[day].sum += e.quality_rating
    dayTotals[day].count++
  })
  const bestDay = Object.entries(dayTotals)
    .map(([day, { sum, count }]) => ({ day, avg: sum / count }))
    .sort((a, b) => b.avg - a.avg)[0]?.day ?? null

  return (
    <div className="min-h-screen bg-background">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <button onClick={() => router.push('/dashboard')} className="btn btn-ghost" style={{ padding: '8px', borderRadius: '8px' }}>←</button>
        <h1 className="font-serif text-xl text-primary">Your sleep stats</h1>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem' }}>
        {/* Overview cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Current streak', value: <StreakBadge streak={currentStreak} size="sm" /> },
            { label: 'Best streak', value: <span className="font-serif text-3xl" style={{ color: WARM }}>{bestStreak}</span> },
            { label: 'Hit rate', value: <span className="font-serif text-3xl" style={{ color: SUCCESS }}>{hitRate}%</span> },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card"
              style={{ padding: '1rem', textAlign: 'center' }}
            >
              <p className="font-mono text-muted mb-2" style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{card.label}</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>{card.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Insight */}
        {bestDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${ACCENT}`, marginBottom: '2rem' }}>
            <p className="font-mono text-muted text-xs mb-1">Insight</p>
            <p className="text-primary text-sm">
              ✨ You sleep best on <strong>{bestDay}s</strong> — avg quality {Number(dayTotals[bestDay]?.sum / dayTotals[bestDay]?.count).toFixed(1)}/5
            </p>
          </motion.div>
        )}

        {/* Quality trend */}
        {qualityData.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 className="font-serif text-lg text-primary mb-4">Sleep quality (30 days)</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={qualityData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2A" />
                <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="quality" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Sleep timing */}
        {sleepTimeData.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card" style={{ padding: '1.5rem' }}>
            <h2 className="font-serif text-lg text-primary mb-4">Minutes from goal ({'+/-'})</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sleepTimeData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2A" />
                <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Minutes off goal" radius={[4,4,0,0]}>
                  {sleepTimeData.map((entry, i) => (
                    <Cell key={i} fill={entry.hit ? SUCCESS : WARM} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted mt-2 font-mono text-center">
              Green = hit (within 30min) · Amber = miss
            </p>
          </motion.div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📊</p>
            <p className="text-muted text-sm">No sleep data yet. Come back after your first check-in!</p>
          </div>
        )}
      </div>
    </div>
  )
}
