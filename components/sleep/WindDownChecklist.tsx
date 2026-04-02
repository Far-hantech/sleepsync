'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { WindDownStep } from '@/types/supabase'
import BreathingTimer from './BreathingTimer'

interface WindDownChecklistProps {
  steps: WindDownStep[]
  onAllComplete: () => void
  onStepChange?: (completedCount: number) => void
}

export default function WindDownChecklist({
  steps,
  onAllComplete,
  onStepChange,
}: WindDownChecklistProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [showBreathing, setShowBreathing] = useState(false)

  const completedCount = completedIds.size
  const darknessFraction = completedCount / steps.length

  function toggleStep(stepId: string, stepLabel: string) {
    const isBreathing = stepLabel.toLowerCase().includes('breathing') || stepLabel.toLowerCase().includes('4-7-8')
    
    if (isBreathing && !completedIds.has(stepId)) {
      setShowBreathing(true)
      return
    }

    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      onStepChange?.(next.size)
      if (next.size === steps.length) {
        setTimeout(onAllComplete, 500)
      }
      return next
    })
  }

  function handleBreathingComplete() {
    setShowBreathing(false)
    // Find and mark the breathing step complete
    const breathingStep = steps.find(
      (s) => s.label.toLowerCase().includes('breathing') || s.label.toLowerCase().includes('4-7-8')
    )
    if (breathingStep) {
      setCompletedIds((prev) => {
        const next = new Set(prev)
        next.add(breathingStep.id)
        onStepChange?.(next.size)
        if (next.size === steps.length) {
          setTimeout(onAllComplete, 500)
        }
        return next
      })
    }
  }

  return (
    <>
      {/* Breathing timer modal */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'color-mix(in srgb, var(--color-background) 90%, transparent)',
              backdropFilter: 'blur(12px)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
            }}
          >
            <h2 className="font-serif text-2xl text-primary">4-7-8 Breathing</h2>
            <BreathingTimer onComplete={handleBreathingComplete} cycles={3} />
            <button
              onClick={() => setShowBreathing(false)}
              className="btn btn-ghost text-sm"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checklist */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isCompleted = completedIds.has(step.id)
          const isFocus = !isCompleted && (i === 0 || completedIds.has(steps[i - 1]?.id))

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: isCompleted ? 0.4 : 1,
                x: 0,
              }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius-card)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderLeft: `4px solid ${isCompleted ? 'var(--color-accent-success)' : isFocus ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer',
                transition: 'opacity 300ms ease-out, border-color 300ms ease-out',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => toggleStep(step.id, step.label)}
            >
              {/* Fill bar */}
              {isCompleted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.4 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    background: 'color-mix(in srgb, var(--color-accent-success) 8%, transparent)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Checkbox */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  border: `2px solid ${isCompleted ? 'var(--color-accent-success)' : 'var(--color-border)'}`,
                  background: isCompleted ? 'var(--color-accent-success)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 200ms ease-out',
                }}
              >
                {isCompleted && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="#0A0A0F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1">
                <p
                  className="text-sm font-medium"
                  style={{
                    color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {step.label}
                </p>
                {step.label.toLowerCase().includes('4-7-8') && !isCompleted && (
                  <p className="text-xs text-muted mt-0.5">Tap to open guided timer</p>
                )}
              </div>

              {/* Step number */}
              <span className="font-mono text-xs text-muted">
                {i + 1}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-muted font-mono mb-2">
          <span>{completedCount} of {steps.length} complete</span>
          <span>{Math.round(darknessFraction * 100)}%</span>
        </div>
        <div style={{ height: 2, background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${darknessFraction * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'var(--color-accent-success)', borderRadius: '999px' }}
          />
        </div>
      </div>
    </>
  )
}
