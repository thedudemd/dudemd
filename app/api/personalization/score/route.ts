import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const EVENT_WEIGHTS: Record<string, number> = {
  article_view: 1,
  scroll_25: 1,
  scroll_50: 2,
  scroll_75: 3,
  scroll_100: 5,
  time_on_page: 2,
  share: 4,
  newsletter_signup: 5,
}

export async function POST(req: NextRequest) {
  const { user_id, token, category_slug, event_type } = await req.json()
  if (!user_id || !category_slug) return NextResponse.json({ ok: true })

  const weight = EVENT_WEIGHTS[event_type] || 1

  const userSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })

  const { data: existing } = await userSupabase.from('user_scores').select('*').eq('user_id', user_id).single()

  if (existing) {
    const scores = existing.category_scores || {}
    scores[category_slug] = (scores[category_slug] || 0) + weight
    await userSupabase.from('user_scores').update({ category_scores: scores, updated_at: new Date().toISOString() }).eq('user_id', user_id)
  } else {
    await userSupabase.from('user_scores').insert({ user_id, category_scores: { [category_slug]: weight } })
  }

  return NextResponse.json({ ok: true })
}
