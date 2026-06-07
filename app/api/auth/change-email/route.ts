import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: NextRequest) {
  const { userId, newEmail, currentEmail } = await req.json()
  if (!userId || !newEmail || !currentEmail) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Check new email not already in use
  const { data: existing } = await supabase.from('profiles').select('id').eq('email', newEmail).single()
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

  // Generate 6-digit code
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  // Invalidate old tokens for this user
  await supabase.from('email_change_tokens').update({ used: true }).eq('user_id', userId).eq('used', false)

  // Store new token
  const { error: insertError } = await supabase.from('email_change_tokens').insert({
    user_id: userId,
    new_email: newEmail,
    token,
    expires_at: expiresAt,
  })
  if (insertError) return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })

  const confirmLink = `https://www.dudemd.com/auth/confirm-email?token=${token}&uid=${userId}&email=${encodeURIComponent(newEmail)}`

  await resend.emails.send({
    from: 'DudeMD <hello@dudemd.com>',
    to: newEmail,
    subject: 'Confirm your new email address — DudeMD',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #f7f4ee; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <img src="https://www.dudemd.com/dude-md-email.svg" alt="DudeMD" style="height: 60px; width: auto;" />
        </div>
        <div style="background: #fff; padding: 2rem; border: 1px solid #ede8df;">
          <p style="font-size: 1.1rem; color: #0e1a2b; font-weight: 700; margin: 0 0 1rem;">Confirm your new email address</p>
          <p style="color: #4A5563; line-height: 1.7; margin: 0 0 1.5rem;">You requested to change your DudeMD email address to <strong>${newEmail}</strong>. Click the button below to confirm.</p>
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${confirmLink}" style="display: inline-block; padding: 0.85rem 2rem; background: #0e1a2b; color: #f7f4ee; text-decoration: none; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;">Confirm New Email</a>
          </div>
          <p style="color: #4A5563; line-height: 1.7; margin: 1.5rem 0 0.5rem;">If the button doesn't work, enter this 6-digit code on the confirmation page:</p>
          <div style="text-align: center; margin: 1rem 0;">
            <span style="font-size: 2.5rem; font-weight: 700; letter-spacing: 0.5rem; color: #0e1a2b; font-family: monospace;">${token}</span>
          </div>
          <p style="color: #9a9085; font-size: 0.85rem; margin: 1.5rem 0 0;">This code expires in 15 minutes. If you didn't request this change, you can ignore this email.</p>
        </div>
        <p style="text-align: center; font-size: 0.75rem; color: #9a9085; margin-top: 1.5rem;">© ${new Date().getFullYear()} DudeMD. All rights reserved.</p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}
