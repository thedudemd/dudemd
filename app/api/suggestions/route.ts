import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  const { keywords, currentSlug } = await request.json()
  if (!keywords || keywords.trim().length < 3) return NextResponse.json({ existing: [], topics: [] })

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, categories(name)')
    .eq('published', true)
    .neq('slug', currentSlug || '')
    .limit(50)

  const kw = keywords.toLowerCase()
  const existing = (articles || [])
    .filter((a: any) => a.title.toLowerCase().includes(kw) || (a.excerpt || '').toLowerCase().includes(kw))
    .slice(0, 5)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: `Suggest 5 mens wellness article topics for DudeMD based on the keyword "${keywords}". Return ONLY a JSON array of strings, no explanation, no markdown. Example: ["Topic 1","Topic 2"]` }]
    })
  })

  const data = await res.json()
  let topics: string[] = []
  try {
    const text = data.content?.[0]?.text || '[]'
    topics = JSON.parse(text.trim())
  } catch { topics = [] }

  return NextResponse.json({ existing, topics })
}
