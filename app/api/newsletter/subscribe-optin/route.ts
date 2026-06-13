import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email, designId } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  let targetCategory: string | null = null
  if (designId) {
    const { data: design } = await supabase.from('optin_designs').select('target_category').eq('id', designId).single()
    targetCategory = design?.target_category || null
  }

  const { data: existing } = await supabase.from('newsletter_subscribers').select('id, subscribed_categories').eq('email', email).maybeSingle()

  if (existing) {
    const categories = new Set(existing.subscribed_categories || [])
    if (targetCategory) categories.add(targetCategory)
    await supabase.from('newsletter_subscribers').update({ subscribed_categories: Array.from(categories), status: 'active' }).eq('id', existing.id)
  } else {
    const { error } = await supabase.from('newsletter_subscribers').insert({ email, subscribed_categories: targetCategory ? [targetCategory] : [], source: 'optin_popup' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
