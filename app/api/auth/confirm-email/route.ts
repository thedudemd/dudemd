import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { token, userId, newEmail } = await req.json()
  if (!token || !userId || !newEmail) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Find valid token
  const { data: record } = await supabaseAdmin
    .from('email_change_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('token', token)
    .eq('new_email', newEmail)
    .eq('used', false)
    .single()

  if (!record) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })

  // Check expiry
  if (new Date(record.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })
  }

  // Mark token as used
  await supabaseAdmin.from('email_change_tokens').update({ used: true }).eq('id', record.id)

  // Update email in profiles table
  await supabaseAdmin.from('profiles').update({ email: newEmail }).eq('id', userId)

  return NextResponse.json({ success: true })
}
