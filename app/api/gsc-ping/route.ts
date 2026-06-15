import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  try {
    const keyJson = process.env.GOOGLE_SEARCH_CONSOLE_KEY
    if (!keyJson) return NextResponse.json({ error: 'No GSC key configured' }, { status: 500 })

    const key = JSON.parse(keyJson)

    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/webmasters'],
    })

    const searchconsole = google.searchconsole({ version: 'v1', auth })

    await searchconsole.sitemaps.submit({
      siteUrl: 'https://www.dudemd.com/',
      feedpath: 'https://www.dudemd.com/sitemap.xml',
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('GSC sitemap ping error:', e?.message)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
