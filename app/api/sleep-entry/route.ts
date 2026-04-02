import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { getTodayInZone } from '@/lib/sleep-utils'
import type { UserRow, SleepEntryRow } from '@/types/supabase'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') ?? '7')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const { data, error } = await supabase
    .from('sleep_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entries: data as SleepEntryRow[] })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { planned_sleep, actual_sleep, wake_time, quality_rating, notes, date: providedDate } = body

  const { data: profileData } = await supabase
    .from('users')
    .select('timezone')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<UserRow, 'timezone'> | null
  const timezone = profile?.timezone ?? 'UTC'
  const date = providedDate ?? getTodayInZone(timezone)

  const { data, error } = await supabase
    .from('sleep_entries')
    .upsert({
      user_id: user.id,
      date,
      planned_sleep: planned_sleep ?? null,
      actual_sleep: actual_sleep ?? null,
      wake_time: wake_time ?? null,
      quality_rating: quality_rating ?? null,
      notes: notes ?? null,
    } as any, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entry: data as SleepEntryRow }, { status: 201 })
}
