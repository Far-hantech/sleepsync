import { createServerSupabaseClient } from '@/lib/supabase'
import { getSleepOffset, getTodayInZone } from '@/lib/sleep-utils'
import type { SleepEntryRow, UserRow } from '@/types/supabase'
import { subDays } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import type { StreakDay } from '@/types/supabase'

const HIT_WINDOW_MINUTES = 30

export function isStreakHit(
  actualSleep: string | null,
  sleepGoalTime: string | null,
  timezone: string
): boolean {
  if (!actualSleep || !sleepGoalTime) return false
  const offset = getSleepOffset(actualSleep, sleepGoalTime, timezone)
  return Math.abs(offset) <= HIT_WINDOW_MINUTES
}

export async function getCurrentStreak(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('sleep_entries')
    .select('streak_count')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const row = data as Pick<SleepEntryRow, 'streak_count'> | null
  return row?.streak_count ?? 0
}

export async function updateStreak(
  userId: string,
  entryId: string,
  actualSleep: string | null,
  sleepGoalTime: string | null,
  timezone: string
): Promise<number> {
  const supabase = await createServerSupabaseClient()

  const hit = isStreakHit(actualSleep, sleepGoalTime, timezone)

  const yesterday = formatInTimeZone(
    subDays(toZonedTime(new Date(), timezone), 1),
    timezone,
    'yyyy-MM-dd'
  )

  const { data: prevData } = await supabase
    .from('sleep_entries')
    .select('streak_count, is_hit')
    .eq('user_id', userId)
    .eq('date', yesterday)
    .single()

  const prevEntry = prevData as Pick<SleepEntryRow, 'streak_count' | 'is_hit'> | null

  let newStreak = 0
  if (hit) {
    newStreak = prevEntry?.is_hit ? (prevEntry.streak_count + 1) : 1
  }

  await supabase
    .from('sleep_entries')
    // @ts-ignore
    .update({ streak_count: newStreak, is_hit: hit })
    .eq('id', entryId)

  return newStreak
}

export async function getStreakHistory(userId: string, days: number = 7): Promise<StreakDay[]> {
  const supabase = await createServerSupabaseClient()

  const { data: userData } = await supabase
    .from('users')
    .select('timezone')
    .eq('id', userId)
    .single()

  const user = userData as Pick<UserRow, 'timezone'> | null
  const timezone = user?.timezone ?? 'UTC'
  const today = getTodayInZone(timezone)

  const dateRange: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(toZonedTime(new Date(), timezone), i)
    dateRange.push(formatInTimeZone(d, timezone, 'yyyy-MM-dd'))
  }

  const { data: entriesData } = await supabase
    .from('sleep_entries')
    .select('date, is_hit, streak_count')
    .eq('user_id', userId)
    .in('date', dateRange)
    .order('date', { ascending: true })

  const entries = (entriesData ?? []) as Pick<SleepEntryRow, 'date' | 'is_hit' | 'streak_count'>[]
  const entryMap = new Map(entries.map(e => [e.date, e]))

  return dateRange.map((date) => {
    const entry = entryMap.get(date)
    return {
      date,
      isHit: entry?.is_hit ?? false,
      hasMissed: !entry && date < today,
      streakCount: entry?.streak_count ?? 0,
    }
  })
}
