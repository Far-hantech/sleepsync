// Supabase Edge Function — Send Notifications
// Deploy: supabase functions deploy send-notifications
// Cron: runs every minute via pg_cron or Supabase Dashboard cron
//
// Schedule relative to each user's timezone:
//   T-60: "Wind-down starts in 1 hour 🌙"
//   T-30: "Time to start winding down"
//   T+0:  "It's your bedtime. Ready?"
//   T+30: "Still awake? Log it when you're ready 😴" (if no log)
//   Wake: "Good morning! Log your sleep quality ☀️"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

webpush.setVapidDetails(
  Deno.env.get('VAPID_EMAIL')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

interface NotificationPayload {
  title: string
  body: string
  url?: string
}

async function sendNotification(endpoint: string, keys: Record<string,string>, payload: NotificationPayload) {
  try {
    await webpush.sendNotification(
      { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
      JSON.stringify({ ...payload, icon: '/icons/icon-192x192.png', badge: '/icons/icon-72x72.png' })
    )
  } catch (err) {
    console.error('Push failed:', endpoint, err)
  }
}

function getCurrentMinutes(timezone: string): number {
  const zoned = new Date().toLocaleString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false })
  const [h, m] = zoned.split(':').map(Number)
  return h * 60 + m
}

function parseGoalMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

serve(async () => {
  // Load all users with push subscriptions
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, keys, notification_prefs')

  if (!subscriptions?.length) return new Response('No subscriptions', { status: 200 })

  // Load user profiles
  const userIds = subscriptions.map(s => s.user_id)
  const { data: users } = await supabase
    .from('users')
    .select('id, sleep_goal_time, wake_goal_time, timezone')
    .in('id', userIds)

  const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u]))

  // Load today's sleep entries
  const today = new Date().toISOString().split('T')[0]
  const { data: todayEntries } = await supabase
    .from('sleep_entries')
    .select('user_id, planned_sleep, actual_sleep, quality_rating')
    .in('user_id', userIds)
    .eq('date', today)

  const entryMap = Object.fromEntries((todayEntries ?? []).map(e => [e.user_id, e]))

  for (const sub of subscriptions) {
    const user = userMap[sub.user_id]
    if (!user?.sleep_goal_time) continue

    const prefs = sub.notification_prefs as Record<string, boolean>
    const nowMins = getCurrentMinutes(user.timezone)
    const bedMins = parseGoalMinutes(user.sleep_goal_time)
    const wakeMins = parseGoalMinutes(user.wake_goal_time ?? '07:00')
    const diffFromBed = nowMins - bedMins
    const entry = entryMap[sub.user_id]

    const notifications: Array<[boolean | undefined, NotificationPayload]> = [
      // T-60
      [prefs.t_minus_60 && diffFromBed >= -61 && diffFromBed <= -59, {
        title: 'SleepSync 🌙',
        body: 'Wind-down starts in 1 hour. Finish up what you\'re doing.',
      }],
      // T-30
      [prefs.t_minus_30 && diffFromBed >= -31 && diffFromBed <= -29, {
        title: 'Time to wind down 🌙',
        body: 'Your bedtime is in 30 minutes.',
        url: '/wind-down',
      }],
      // T+0
      [prefs.bedtime && diffFromBed >= -1 && diffFromBed <= 1, {
        title: "It's your bedtime 😴",
        body: "It's time. Ready to sleep?",
        url: '/wind-down',
      }],
      // T+30 with no log
      [prefs.overdue && diffFromBed >= 29 && diffFromBed <= 31 && !entry?.planned_sleep, {
        title: 'Still awake? 👀',
        body: "Log it when you're ready. No pressure.",
        url: '/check-in',
      }],
      // Wake time
      [prefs.morning && Math.abs(nowMins - wakeMins) <= 1, {
        title: 'Good morning! ☀️',
        body: 'How did you sleep? Log your quality in 2 taps.',
        url: '/check-in',
      }],
    ]

    for (const [condition, payload] of notifications) {
      if (condition) {
        await sendNotification(sub.endpoint, sub.keys as Record<string,string>, payload)
      }
    }
  }

  return new Response('Notifications processed', { status: 200 })
})
