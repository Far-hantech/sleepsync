'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import CountdownTimer from '@/components/sleep/CountdownTimer'
import StreakBadge from '@/components/sleep/StreakBadge'
import SleepCalendarStrip from '@/components/sleep/SleepCalendarStrip'
import { getTimeUntilBedtime, formatTimeDisplay, isInCheckInWindow } from '@/lib/sleep-utils'
import type { UserRow, StreakDay } from '@/types/supabase'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface DashboardClientProps {
  profile: UserRow
  streak: number
  streakHistory: StreakDay[]
  partner: { partnerId: string | null; pairId: string } | null
}

export default function DashboardClient({
  profile,
  streak,
  streakHistory,
  partner,
}: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showWhyModal, setShowWhyModal] = useState(false)
  const [whyText, setWhyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const timeData = getTimeUntilBedtime(profile.sleep_goal_time, profile.timezone)
  const showWindDownCTA = !timeData.isOverdue && timeData.totalMinutes <= 30
  const inCheckIn = isInCheckInWindow(profile.wake_goal_time, profile.timezone)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleWhySubmit() {
    if (!whyText.trim()) return
    setSubmitting(true)

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setSubmitting(false)
    setShowWhyModal(false)
    setWhyText('')
  }

  return (
    <div
      className="min-h-screen bg-background"
      style={{ paddingBottom: '2rem' }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h1 className="font-serif text-xl text-primary">SleepSync</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {inCheckIn && (
            <Link href="/check-in" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
              Morning check-in ☀️
            </Link>
          )}
          <Link href="/settings" style={{ color: 'var(--color-text-muted)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Countdown timer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <CountdownTimer
            sleepGoalTime={profile.sleep_goal_time}
            timezone={profile.timezone}
          />

          {/* Bedtime label */}
          <p className="font-mono text-xs text-muted mt-4">
            Bedtime {formatTimeDisplay(profile.sleep_goal_time)} · Wake {formatTimeDisplay(profile.wake_goal_time)}
          </p>
        </motion.section>

        {/* Wind-down CTA */}
        <AnimatePresence>
          {showWindDownCTA && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <Link
                href="/wind-down"
                className="btn btn-primary w-full"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-primary), #9B8FFF)',
                  padding: '16px',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                🌙 Start wind-down ritual
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {/* Streak */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p className="font-mono text-muted" style={{ fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Current streak
            </p>
            <StreakBadge streak={streak} size="md" />
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className="font-mono text-muted" style={{ fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Quick actions
            </p>
            <button
              onClick={() => setShowWhyModal(true)}
              className="btn btn-ghost"
              style={{ padding: '8px 12px', fontSize: '0.8125rem', width: '100%' }}
            >
              😴 Still awake?
            </button>
          </div>
        </motion.div>

        {/* 7-day calendar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card"
          style={{ padding: '1.5rem', marginBottom: '1.5rem' }}
        >
          <p className="font-mono text-muted mb-4" style={{ fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Last 7 nights
          </p>
          <SleepCalendarStrip days={streakHistory} />
        </motion.div>

        {/* Partner nudge */}
        {partner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="card"
            style={{
              padding: '1.25rem',
              borderLeft: '4px solid var(--color-accent-warm)',
              marginBottom: '1rem',
            }}
          >
            <p className="text-sm text-muted">
              👀 Your accountability partner hasn't gone to sleep yet.
            </p>
          </motion.div>
        )}

        {/* Sign out */}
        <button onClick={handleSignOut} className="btn btn-ghost w-full mt-2" style={{ fontSize: '0.8125rem' }}>
          Sign out
        </button>
      </main>

      {/* "Why I'm still awake" modal */}
      <AnimatePresence>
        {showWhyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10,10,15,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'flex-end',
              padding: '1.5rem',
            }}
            onClick={() => setShowWhyModal(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="card w-full"
              style={{ padding: '1.5rem', maxWidth: 480, margin: '0 auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-xl text-primary mb-1">Why are you still awake?</h3>
              <p className="text-muted text-sm mb-4">No judgment. This helps track patterns.</p>
              <textarea
                value={whyText}
                onChange={(e) => setWhyText(e.target.value)}
                placeholder="Can't stop scrolling, anxious about tomorrow..."
                className="input"
                style={{ minHeight: 100, resize: 'vertical', fontFamily: 'var(--font-inter)' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setShowWhyModal(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWhySubmit}
                  disabled={!whyText.trim() || submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? 'Saving...' : 'Log it'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
