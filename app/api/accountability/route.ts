import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import type { AccountabilityPairRow } from '@/types/supabase'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existingData } = await supabase
    .from('accountability_pairs')
    .select('invite_token')
    .eq('user_a', user.id)
    .eq('status', 'pending')
    .single()

  const existing = existingData as Pick<AccountabilityPairRow, 'invite_token'> | null
  let token = existing?.invite_token

  if (!token) {
    const { data: newPairData } = await supabase
      .from('accountability_pairs')
      .insert({ user_a: user.id } as any)
      .select('invite_token')
      .single()
    token = (newPairData as Pick<AccountabilityPairRow, 'invite_token'> | null)?.invite_token
  }

  const origin = request.headers.get('origin') ?? ''
  const inviteUrl = `${origin}/invite/${token}`

  return NextResponse.json({ inviteUrl })
}
