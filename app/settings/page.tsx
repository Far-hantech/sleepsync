'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import type { UserRow, WindDownStep } from '@/types/supabase'
import { Globe } from '@/components/ui/cobe-globe'

const TIMEZONES = Intl.supportedValuesOf('timeZone')

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Partial<UserRow>>({})
  const [sleepTime, setSleepTime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [timezone, setTimezone] = useState('')
  const [steps, setSteps] = useState<WindDownStep[]>([])
  const [newStepLabel, setNewStepLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock load
    setSleepTime('23:00')
    setWakeTime('07:00')
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    setSteps([
      { id: '1', label: 'Put phone face-down', completed: false },
      { id: '2', label: 'Dim all lights', completed: false },
      { id: '3', label: 'Stop all screens', completed: false },
      { id: '4', label: 'Do 4-7-8 breathing', completed: false },
      { id: '5', label: "Set tomorrow's intention", completed: false },
    ])
    setLoading(false)
  }, [])

  async function handleSave() {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  function addStep() {
    if (!newStepLabel.trim()) return
    setSteps(prev => [...prev, {
      id: String(Date.now()),
      label: newStepLabel.trim(),
      completed: false,
    }])
    setNewStepLabel('')
  }

  function removeStep(id: string) {
    setSteps(prev => prev.filter(s => s.id !== id))
  }

  async function handleDeleteAccount() {
    if (deleteText !== 'DELETE') return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('users').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted font-mono text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button onClick={() => router.push('/dashboard')} className="btn btn-ghost" style={{ padding: '8px', borderRadius: '8px' }}>
          ←
        </button>
        <h1 className="font-serif text-xl text-primary">Settings</h1>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem' }}>
        <div className="space-y-6">
          {/* Sleep schedule */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '1.5rem' }}>
            <h2 className="font-serif text-lg text-primary mb-4">Sleep schedule</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-2">Bedtime</label>
                <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} className="input font-mono text-lg text-center" />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Wake time</label>
                <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="input font-mono text-lg text-center" />
              </div>
              <div className="pt-4 border-t border-border/40 mt-4 relative">
                <label className="block text-xl font-serif text-primary mb-2">Timezone</label>
                <div className="flex flex-col md:flex-row items-center gap-6 bg-card/40 p-4 rounded-3xl border border-border/50">
                  <div className="w-full md:w-1/2 relative aspect-square max-w-[240px] flex-shrink-0">
                    <Globe 
                      mapSamples={8000}
                      theta={0.25}
                      markers={[
                        { id: "sf", location: [37.7595, -122.4367], label: "SF" },
                        { id: "nyc", location: [40.7128, -74.006], label: "NYC" },
                        { id: "tokyo", location: [35.6762, 139.6503], label: "Tokyo" },
                        { id: "london", location: [51.5074, -0.1278], label: "London" },
                        { id: "sydney", location: [-33.8688, 151.2093], label: "Sydney" },
                      ]} 
                    />
                  </div>
                  <div className="w-full md:w-1/2 space-y-3">
                    <p className="text-sm text-muted-foreground w-full">Select the correct timezone to ensure push notifications and countdown timers work properly for you.</p>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)} className="input appearance-none bg-background">
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Wind-down steps */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '1.5rem' }}>
            <h2 className="font-serif text-lg text-primary mb-4">Wind-down steps</h2>
            <div className="space-y-2 mb-3">
              {steps.map((step, i) => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="font-mono text-xs text-muted" style={{ width: 20, flexShrink: 0 }}>{i + 1}.</span>
                  <span className="text-sm text-primary flex-1">{step.label}</span>
                  <button onClick={() => removeStep(step.id)} className="text-muted" style={{ fontSize: '0.8rem', opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-text-muted)' }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={newStepLabel}
                onChange={e => setNewStepLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addStep()}
                placeholder="Add a step..."
                className="input text-sm flex-1"
                style={{ padding: '8px 12px' }}
              />
              <button onClick={addStep} className="btn btn-ghost" style={{ padding: '8px 16px', flexShrink: 0 }}>
                Add
              </button>
            </div>
          </motion.div>

          {/* Accountability */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="card" style={{ padding: '1.5rem' }}>
            <h2 className="font-serif text-lg text-primary mb-2">Accountability partner</h2>
            <p className="text-muted text-sm mb-4">Share a link to pair with someone who keeps you honest.</p>
            <button
              onClick={async () => {
                const res = await fetch('/api/accountability', { method: 'POST' })
                const { inviteUrl } = await res.json()
                if (inviteUrl) {
                  navigator.clipboard.writeText(inviteUrl)
                  alert('Invite link copied to clipboard!')
                }
              }}
              className="btn btn-ghost w-full"
            >
              Generate invite link 🔗
            </button>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '1.5rem' }}>
            <h2 className="font-serif text-lg text-primary mb-2">Push notifications</h2>
            <p className="text-muted text-sm mb-4">Get reminders at the right time.</p>
            <button
              onClick={async () => {
                if (!('Notification' in window)) return alert('Notifications not supported')
                const permission = await Notification.requestPermission()
                if (permission !== 'granted') return alert('Permission denied')
                const reg = await navigator.serviceWorker.ready
                const sub = await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                })
                await fetch('/api/push-subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(sub),
                })
                alert('Notifications enabled! 🌙')
              }}
              className="btn btn-ghost w-full"
            >
              Enable notifications 🔔
            </button>
          </motion.div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary w-full"
            style={{ padding: '16px' }}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save changes'}
          </button>

          {/* Danger zone */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="card" style={{ padding: '1.5rem', borderColor: '#EF444430' }}>
            <h2 className="font-serif text-lg mb-2" style={{ color: '#EF4444' }}>Danger zone</h2>
            <p className="text-muted text-sm mb-4">This permanently deletes your account and all data.</p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger w-full">
                Delete account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: '#EF4444' }}>Type DELETE to confirm:</p>
                <input
                  value={deleteText}
                  onChange={e => setDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="input"
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteText('') }} className="btn btn-ghost flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteText !== 'DELETE'}
                    className="btn btn-danger flex-1"
                  >
                    Confirm delete
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
