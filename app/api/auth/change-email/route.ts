import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: NextRequest) {
  const { userId, newEmail } = await req.json()
  if (!userId || !newEmail) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

  // Invalidate old tokens
  await supabase.from('email_change_tokens').update({ used: true }).eq('user_id', userId).eq('used', false)

  // Store token
  const { error: insertError } = await supabase.from('email_change_tokens').insert({
    user_id: userId,
    new_email: newEmail,
    token,
    expires_at: expiresAt,
  })
  if (insertError) return NextResponse.json({ error: 'Failed to send confirmation. Please try again.' }, { status: 500 })

  const confirmLink = `https://www.dudemd.com/auth/confirm-email?token=${token}&uid=${userId}&email=${encodeURIComponent(newEmail)}`

  await resend.emails.send({
    from: 'DudeMD <hello@dudemd.com>',
    to: newEmail,
    subject: 'Confirm your new email address — DudeMD',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0e1a2b; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <img src="https://www.dudemd.com/dude-md-email.svg" alt="DudeMD" style="height: 64px; width: auto;" />
        </div>
        <div style="background: #f7f4ee; padding: 2rem; border-radius: 4px;">
          <p style="font-size: 1.1rem; color: #0e1a2b; font-weight: 700; margin: 0 0 1rem;">Confirm your new email address</p>
          <p style="color: #4A5563; line-height: 1.7; margin: 0 0 1.5rem;">You requested to change your DudeMD email address to <strong style="color: #0e1a2b;">${newEmail}</strong>.</p>
          <p style="color: #4A5563; line-height: 1.7; margin: 0 0 1.5rem;">Click the button below to confirm this change. This link expires in 24 hours.</p>
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${confirmLink}" style="display: inline-block; padding: 0.875rem 2.5rem; background: #0e1a2b; color: #f7f4ee; text-decoration: none; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; border: 2px solid #c9b28f;">Confirm Email Change</a>
          </div>
          <p style="color: #9a9085; font-size: 0.8rem; line-height: 1.6; margin: 0;">If you didn't request this change, you can safely ignore this email. Your email address will remain unchanged.</p>
        </div>
        <p style="text-align: center; font-size: 0.75rem; color: rgba(247,244,238,0.4); margin-top: 1.5rem;">© ${new Date().getFullYear()} DudeMD. All rights reserved.</p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}
