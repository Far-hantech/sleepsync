'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import QualityRating from '@/components/sleep/QualityRating'
import StreakBadge from '@/components/sleep/StreakBadge'
import { createClient } from '@/lib/supabase'

export default function CheckInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [quality, setQuality] = useState<number | null>(null)
  const [actualTime, setActualTime] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newStreak, setNewStreak] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!quality) return
    setSubmitting(true)
    setError('')

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Calculate streak (Mocked)
      setNewStreak(13)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (newStreak !== null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl mb-6"
          >
            {quality! >= 4 ? '🌟' : quality! >= 3 ? '✨' : '💪'}
          </motion.div>

          <h2 className="font-serif text-3xl text-primary mb-2">Nice work!</h2>
          <p className="text-muted text-sm mb-8">Sleep logged. Here's your current streak:</p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <StreakBadge streak={newStreak} size="lg" />
          </div>

          {newStreak > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted text-sm mb-6"
            >
              {newStreak === 1
                ? 'First night on track! Keep it going 🔥'
                : `${newStreak} nights in a row! You're building something real.`}
            </motion.p>
          )}

          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-primary"
          >
            Back to dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="text-4xl mb-3">☀️</div>
          <h1 className="font-serif text-3xl text-primary mb-1">Good morning!</h1>
          <p className="text-muted text-sm">How did you sleep last night?</p>
        </div>

        <div className="space-y-6">
          {/* Quality rating */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <p className="text-sm text-muted mb-4 font-mono text-center uppercase tracking-widest" style={{ fontSize: '0.625rem' }}>
              Sleep quality
            </p>
            <QualityRating value={quality} onChange={setQuality} />
          </div>

          {/* Actual sleep time */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label className="block text-sm text-muted mb-2">
              What time did you actually fall asleep?{' '}
              <span className="text-xs">(optional)</span>
            </label>
            <input
              type="time"
              value={actualTime}
              onChange={(e) => setActualTime(e.target.value)}
              className="input font-mono text-lg"
              style={{ textAlign: 'center' }}
            />
          </div>

          {/* Notes */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label className="block text-sm text-muted mb-2">
              Any notes?{' '}
              <span className="text-xs">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Woke up twice, vivid dreams..."
              className="input"
              style={{ minHeight: 80, resize: 'none' }}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!quality || submitting}
            className="btn btn-primary w-full"
            style={{ padding: '16px', fontSize: '1rem', borderRadius: 'var(--radius-card)' }}
          >
            {submitting ? 'Saving...' : 'Log my sleep 🌙'}
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-ghost w-full"
            style={{ fontSize: '0.8125rem' }}
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  )
}
