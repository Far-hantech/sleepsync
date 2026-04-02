'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s
const PHASES = [
  { label: 'Breathe in', duration: 4, scale: 1.3, color: 'var(--color-accent-primary)' },
  { label: 'Hold', duration: 7, scale: 1.3, color: 'var(--color-accent-warm)' },
  { label: 'Breathe out', duration: 8, scale: 0.7, color: 'var(--color-accent-success)' },
]

interface BreathingTimerProps {
  onComplete?: () => void
  cycles?: number
}

export default function BreathingTimer({ onComplete, cycles = 3 }: BreathingTimerProps) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].duration)
  const [cycle, setCycle] = useState(1)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Move to next phase
          setPhaseIndex((pi) => {
            const next = (pi + 1) % PHASES.length
            if (next === 0) {
              // Completed a full cycle
              setCycle((c) => {
                if (c >= cycles) {
                  clearInterval(intervalRef.current!)
                  setDone(true)
                  onComplete?.()
                }
                return c + 1
              })
            }
            setSecondsLeft(PHASES[next].duration)
            return next
          })
          return PHASES[phaseIndex].duration
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current!)
  }, [phaseIndex, cycles, onComplete])

  const phase = PHASES[phaseIndex]

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="text-4xl">✓</div>
        <p className="font-serif text-xl" style={{ color: 'var(--color-accent-success)' }}>
          Breathing complete
        </p>
        <p className="text-muted text-sm">Your nervous system is calmer now.</p>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Breathing circle */}
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        {/* Outer glow ring */}
        <motion.div
          animate={{ scale: phase.scale, opacity: 0.3 }}
          transition={{ duration: phase.duration, ease: phase.label === 'Breathe in' ? 'easeIn' : phase.label === 'Breathe out' ? 'easeOut' : 'linear' }}
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: '999px',
            background: phase.color,
            filter: 'blur(20px)',
          }}
        />
        {/* Main circle */}
        <motion.div
          animate={{ scale: phase.scale }}
          transition={{ duration: phase.duration, ease: phase.label === 'Breathe in' ? 'easeIn' : phase.label === 'Breathe out' ? 'easeOut' : 'linear' }}
          style={{
            width: 120,
            height: 120,
            borderRadius: '999px',
            background: `radial-gradient(circle, ${phase.color}22, ${phase.color}44)`,
            border: `2px solid ${phase.color}`,
          }}
        />
        {/* Countdown number */}
        <AnimatePresence mode="wait">
          <motion.span
            key={secondsLeft}
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute font-serif text-4xl"
            style={{ color: phase.color }}
          >
            {secondsLeft}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phaseIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="font-serif text-2xl"
          style={{ color: phase.color }}
        >
          {phase.label}
        </motion.p>
      </AnimatePresence>

      <p className="font-mono text-xs text-muted">
        Cycle {Math.min(cycle, cycles)} of {cycles}
      </p>
    </div>
  )
}
