'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'

const TIMEZONES = Intl.supportedValuesOf('timeZone')

const STEPS = [
  {
    id: 1,
    title: "When do you want to fall asleep?",
    subtitle: "Pick your ideal bedtime. We'll count down to it every night.",
    field: 'sleepTime',
    type: 'time',
    placeholder: '23:00',
    defaultValue: '23:00',
    icon: '🌙',
  },
  {
    id: 2,
    title: "When do you want to wake up?",
    subtitle: "Your target wake time. We'll remind you to log your sleep in the morning.",
    field: 'wakeTime',
    type: 'time',
    placeholder: '07:00',
    defaultValue: '07:00',
    icon: '☀️',
  },
  {
    id: 3,
    title: "What's your timezone?",
    subtitle: "So your countdown is accurate wherever you are.",
    field: 'timezone',
    type: 'select',
    defaultValue: Intl.DateTimeFormat().resolvedOptions().timeZone,
    icon: '🌍',
  },
]

type FormData = {
  sleepTime: string
  wakeTime: string
  timezone: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    sleepTime: '23:00',
    wakeTime: '07:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  function handleChange(value: string) {
    setFormData((prev) => ({ ...prev, [currentStep.field]: value }))
  }

  async function handleNext() {
    if (!isLast) {
      setStep((s) => s + 1)
      return
    }

    // Final step: mock save and continue
    setSaving(true)
    setError('')
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    router.push('/dashboard')
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted mb-2 font-mono">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-0.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--color-accent-primary)' }}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">{currentStep.icon}</div>
              <h1 className="font-serif text-3xl text-primary mb-2 leading-tight">
                {currentStep.title}
              </h1>
              <p className="text-muted text-sm leading-relaxed">
                {currentStep.subtitle}
              </p>
            </div>

            <div className="card p-6">
              {currentStep.type === 'time' && (
                <div className="text-center">
                  <input
                    type="time"
                    id={currentStep.field}
                    value={formData[currentStep.field as keyof FormData]}
                    onChange={(e) => handleChange(e.target.value)}
                    className="input text-center font-mono text-3xl py-6"
                    style={{ fontSize: '2rem', letterSpacing: '0.1em' }}
                  />
                </div>
              )}

              {currentStep.type === 'select' && (
                <div>
                  <label htmlFor="timezone" className="block text-sm text-muted mb-2">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => handleChange(e.target.value)}
                    className="input"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm mt-3">{error}</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={handleBack}
              disabled={saving}
              className="btn btn-ghost flex-1"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={saving}
            className="btn btn-primary flex-1"
          >
            {saving ? 'Saving...' : isLast ? "Let's go 🚀" : 'Continue'}
          </button>
        </div>

        {/* Summary preview on last step */}
        {isLast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 card p-4 space-y-2"
          >
            <p className="text-xs text-muted font-mono uppercase tracking-wider mb-3">Your sleep schedule</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Bedtime</span>
              <span className="font-mono text-accent-primary">{formData.sleepTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Wake time</span>
              <span className="font-mono text-accent-primary">{formData.wakeTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Timezone</span>
              <span className="font-mono text-accent-primary text-xs truncate ml-2 text-right">
                {formData.timezone}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
