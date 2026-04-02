import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentStreak, getStreakHistory } from '@/lib/streak'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/streak — get current streak and recent history
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '7')

  const [streak, history] = await Promise.all([
    getCurrentStreak(user.id),
    getStreakHistory(user.id, days),
  ])

  return NextResponse.json({ streak, history })
}
