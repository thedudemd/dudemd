import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function parseDevice(ua: string): string {
  if (/mobile/i.test(ua) && !/ipad|tablet/i.test(ua)) return 'mobile'
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  return 'desktop'
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge'
  if (/chrome|crios/i.test(ua)) return 'Chrome'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/safari/i.test(ua)) return 'Safari'
  return 'Other'
}

export async function POST(req: NextRequest) {
  const { user_id, token, referrer, utm_source, utm_medium, utm_campaign } = await req.json()
  if (!user_id || !token) return NextResponse.json({ ok: true })

  const ua = req.headers.get('user-agent') || ''
  const device_type = parseDevice(ua)
  const browser = parseBrowser(ua)

  // Vercel Edge geo — city/region/country only, no raw IP stored
  const geo = (req as any).geo || {}
  const geo_city = geo.city || null
  const geo_region = geo.region || null
  const geo_country = geo.country || null

  const userSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })

  await userSupabase.from('user_events').insert({
    user_id,
    event_type: 'session_start',
    session_id: `server-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    metadata: {
      device_type,
      browser,
      referrer: referrer || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      geo_city,
      geo_region,
      geo_country,
    }
  })

  return NextResponse.json({ ok: true })
}
