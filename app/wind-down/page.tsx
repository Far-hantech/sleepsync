'use client'

import { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useRouter } from 'next/navigation'
import WindDownChecklist from '@/components/sleep/WindDownChecklist'
import type { WindDownStep } from '@/types/supabase'
import { createClient } from '@/lib/supabase'

const DEFAULT_STEPS: WindDownStep[] = [
  { id: '1', label: 'Put phone face-down', completed: false },
  { id: '2', label: 'Dim all lights', completed: false },
  { id: '3', label: 'Stop all screens', completed: false },
  { id: '4', label: 'Do 4-7-8 breathing', completed: false },
  { id: "5", label: "Set tomorrow's intention", completed: false },
]

export default function WindDownPage() {
  const router = useRouter()
  const supabase = createClient()
  const [steps, setSteps] = useState<WindDownStep[]>(DEFAULT_STEPS)
  const [intention, setIntention] = useState('')
  const [bgDarkness, setBgDarkness] = useState(0)
  const [allDone, setAllDone] = useState(false)
  const [logging, setLogging] = useState(false)
  const [showIntention, setShowIntention] = useState(false)

  // Load user's custom steps if available (Mocked)
  useEffect(() => {
    setSteps(DEFAULT_STEPS)
  }, [])

  function handleStepChange(completedCount: number) {
    setBgDarkness(completedCount / steps.length)
    // Show intention textarea when step 5 is the next one
    if (completedCount >= steps.length - 1) {
      setShowIntention(true)
    }
  }

  async function handleGoToSleep() {
    setLogging(true)

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 600))

    setLogging(false)
    router.push('/dashboard')
  }

  // Dynamic background based on completion
  const bgOpacity = 0.05 + bgDarkness * 0.35

  return (
    <motion.div
      animate={{ backgroundColor: `rgba(10, 10, 15, ${1})` }}
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Progressive dark overlay */}
      <motion.div
        animate={{ opacity: bgDarkness }}
        transition={{ duration: 1 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,15,0.8) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '1.5rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <div className="text-3xl mb-2">🌙</div>
          <h1 className="font-serif text-3xl text-primary">Wind-down ritual</h1>
          <p className="text-muted text-sm mt-1">Take it slow. You've got this.</p>
        </motion.div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <WindDownChecklist
            steps={steps}
            onAllComplete={() => setAllDone(true)}
            onStepChange={handleStepChange}
          />
        </motion.div>

        {/* Tomorrow's intention */}
        {showIntention && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginTop: '1.5rem' }}
          >
            <label className="block text-sm text-muted mb-2 font-mono">
              Set tomorrow's intention
            </label>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="Tomorrow I want to..."
              className="input"
              style={{ minHeight: 80, resize: 'none' }}
            />
          </motion.div>
        )}

        {/* Final CTA */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ marginTop: '2rem' }}
          >
            <button
              onClick={handleGoToSleep}
              disabled={logging}
              className="btn btn-primary w-full"
              style={{
                padding: '20px',
                fontSize: '1.125rem',
                borderRadius: 'var(--radius-card)',
                background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, #5B4FD4 100%)',
              }}
            >
              {logging ? 'Logging...' : "I'm going to sleep now 🌙"}
            </button>
            <p className="text-center text-muted text-xs mt-3">
              This logs your planned sleep time and starts your streak tracker.
            </p>
          </motion.div>
        )}

        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="btn btn-ghost w-full mt-4"
          style={{ fontSize: '0.8125rem' }}
        >
          ← Back to dashboard
        </button>
      </div>
    </motion.div>
  )
}
