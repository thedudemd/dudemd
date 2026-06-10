import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Webhook } from 'svix'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const headers = {
    'svix-id': req.headers.get('svix-id') || '',
    'svix-timestamp': req.headers.get('svix-timestamp') || '',
    'svix-signature': req.headers.get('svix-signature') || '',
  }

  let event: any
  try {
    const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!)
    event = wh.verify(payload, headers)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const type = event.type as string
  const email = event.data?.to?.[0] || event.data?.email || null

  let mapped: string | null = null
  if (type === 'email.delivered') mapped = 'delivered'
  else if (type === 'email.opened') mapped = 'opened'
  else if (type === 'email.clicked') mapped = 'clicked'

  if (mapped && email) {
    await supabase.from('email_events').insert({
      subscriber_email: email,
      event_type: mapped,
      campaign_id: event.data?.email_id || null,
    })
  }

  return NextResponse.json({ ok: true })
}
