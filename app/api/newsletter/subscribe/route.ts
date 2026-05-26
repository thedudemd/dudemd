import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Check if already subscribed
  const { data: existing } = await supabase.from('subscribers').select('email').eq('email', email).single()
  if (existing) return NextResponse.json({ exists: true }, { status: 200 })

  const { error } = await supabase.from('subscribers').insert({ email, source: 'newsletter_page' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await resend.emails.send({
    from: 'DudeMD <hello@dudemd.com>',
    to: email,
    subject: "Welcome to DudeMD — You're In.",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #f7f4ee; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="font-size: 2rem; color: #0e1a2b; margin-bottom: 0.5rem;">Welcome to DudeMD</h1>
          <p style="color: #c9b28f; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase;">Modern Wellness for Real Life</p>
        </div>
        <div style="background: #fff; padding: 2rem; border: 1px solid #ede8df;">
          <p style="font-size: 1.1rem; color: #0e1a2b; line-height: 1.7;">You're officially part of the DudeMD community.</p>
          <p style="color: #4A5563; line-height: 1.7;">Every week you'll get evidence-based health, fitness, and lifestyle content built for real men living real lives. No fluff. No bro-science. Just what works.</p>
          <div style="text-align: center; margin: 2rem 0;">
            <a href="https://www.dudemd.com" style="display: inline-block; padding: 0.85rem 2rem; background: #0e1a2b; color: #f7f4ee; text-decoration: none; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;">Read Latest Articles</a>
          </div>
          <p style="color: #9a9085; font-size: 0.85rem; line-height: 1.6;">— The DudeMD Team</p>
        </div>
        <p style="text-align: center; font-size: 0.75rem; color: #9a9085; margin-top: 1.5rem;">You subscribed at dudemd.com. <a href="https://www.dudemd.com/unsubscribe?email=${email}" style="color: #9a9085;">Unsubscribe</a></p>
      </div>
    `
  })

  // Fire Meta pixel server-side conversion event
  try {
    await fetch('https://graph.facebook.com/v18.0/214618978894432/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          user_data: { em: email },
          action_source: 'website'
        }],
        access_token: process.env.META_CONVERSIONS_API_TOKEN || ''
      })
    })
  } catch(e) {}

  return NextResponse.json({ success: true })
}
