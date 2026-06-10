import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { token, userId, newEmail } = await req.json()
  if (!token || !userId || !newEmail) return NextResponse.json({ error: 'Invalid confirmation link.' }, { status: 400 })

  const { data: record } = await supabase
    .from('email_change_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('token', token)
    .eq('new_email', newEmail)
    .eq('used', false)
    .single()

  if (!record) return NextResponse.json({ error: 'This link is invalid or has already been used.' }, { status: 400 })

  if (new Date(record.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired. Please request a new one.' }, { status: 400 })
  }

  await supabase.from('email_change_tokens').update({ used: true }).eq('id', record.id)
  await supabase.from('profiles').update({ email: newEmail }).eq('id', userId)

  return NextResponse.json({ success: true })
}
