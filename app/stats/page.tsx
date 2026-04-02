import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getStreakHistory } from '@/lib/streak'
import StatsClient from './StatsClient'

export default async function StatsPage() {
  // Mocked data for stats
  const profile = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sleep_goal_time: '23:00',
    wake_goal_time: '07:00'
  }

  const entries: any[] = []
  
  const currentStreak = 12
  const bestStreakRow = { streak_count: 24 }

  return (
    <StatsClient
      entries={entries ?? []}
      bestStreak={bestStreakRow?.streak_count ?? 0}
      currentStreak={currentStreak}
      sleepGoalTime={profile?.sleep_goal_time ?? null}
      timezone={profile?.timezone ?? 'UTC'}
    />
  )
}
