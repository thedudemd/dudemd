import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: NextRequest) {
  const { subject, body, segment } = await req.json()
  if (!subject || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: allSubs, error: subError } = await supabase.from('subscribers').select('email, unsubscribed')
  if (subError) return NextResponse.json({ error: 'Supabase error: ' + subError.message }, { status: 500 })

  let emails: string[] = (allSubs || []).filter(s => s.unsubscribed !== true).map(s => s.email)

  if (segment && segment !== 'all' && segment !== '') {
    const { data: scores } = await supabase.from('user_scores').select('user_id, category_scores')
    const matchingUserIds = (scores || []).filter(s => s.category_scores?.[segment] > 0).map(s => s.user_id)
    if (matchingUserIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('email').in('id', matchingUserIds).eq('newsletter_subscribed', true)
      const segmentEmails = new Set((profiles || []).map(p => p.email).filter(Boolean))
      emails = emails.filter(e => segmentEmails.has(e))
    } else {
      emails = []
    }
  }

  if (!emails.length) return NextResponse.json({ error: 'No subscribers', total: allSubs?.length || 0, segment }, { status: 400 })

  const wrapHtml = (innerBody: string, email: string) => `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #f7f4ee; padding: 2rem;"><div style="text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #c9b28f; padding-bottom: 1.5rem;"><h1 style="font-size: 1.5rem; color: #0e1a2b; margin: 0;">DudeMD</h1><p style="color: #c9b28f; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; margin: 0.25rem 0 0;">Modern Wellness for Real Life</p></div><div style="background: #fff; padding: 2rem; border: 1px solid #ede8df;">${innerBody}</div><p style="text-align: center; font-size: 0.75rem; color: #9a9085; margin-top: 1.5rem;">You subscribed at dudemd.com. <a href="https://www.dudemd.com/unsubscribe?email=${email}" style="color: #9a9085;">Unsubscribe</a></p></div>`

  const batchSize = 50
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    await Promise.all(batch.map(email =>
      resend.emails.send({ from: 'DudeMD <hello@dudemd.com>', to: email, subject, html: wrapHtml(body, email) })
    ))
  }

  return NextResponse.json({ success: true, sent: emails.length })
}
