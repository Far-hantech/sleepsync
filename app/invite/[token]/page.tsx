'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'accepting' | 'done' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirectTo=/invite/${token}`)
        return
      }
      setStatus('accepting')
    }
    checkSession()
  }, [supabase, token, router])

  async function handleAccept() {
    setStatus('loading')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: pair } = await supabase
      .from('accountability_pairs')
      .select('id, user_a')
      .eq('invite_token', token)
      .single()

    if (!pair) {
      setMessage('Invalid or expired invite link.')
      setStatus('error')
      return
    }

    if (pair.user_a === user.id) {
      setMessage("You can't pair with yourself!")
      setStatus('error')
      return
    }

    await supabase
      .from('accountability_pairs')
      .update({ user_b: user.id, status: 'active' })
      .eq('id', pair.id)

    setStatus('done')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        {status === 'loading' && (
          <p className="text-muted font-mono text-sm">Loading...</p>
        )}

        {status === 'accepting' && (
          <div className="card p-8 space-y-6">
            <div className="text-5xl">👫</div>
            <h1 className="font-serif text-3xl text-primary">Accountability invite</h1>
            <p className="text-muted text-sm">
              Someone wants you to keep them accountable with their sleep. Accept to become their sleep partner.
            </p>
            <button onClick={handleAccept} className="btn btn-primary w-full">
              Accept invite 🌙
            </button>
            <button onClick={() => router.push('/dashboard')} className="btn btn-ghost w-full">
              Decline
            </button>
          </div>
        )}

        {status === 'done' && (
          <div className="card p-8 space-y-4">
            <div className="text-5xl">✨</div>
            <h2 className="font-serif text-2xl text-primary">You're paired!</h2>
            <p className="text-muted text-sm">You'll both see a nudge card if the other hasn't logged sleep by bedtime.</p>
            <button onClick={() => router.push('/dashboard')} className="btn btn-primary w-full">
              Go to dashboard
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="card p-8 space-y-4">
            <div className="text-5xl">😕</div>
            <p className="text-red-400 text-sm">{message}</p>
            <button onClick={() => router.push('/dashboard')} className="btn btn-ghost w-full">
              Go to dashboard
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
