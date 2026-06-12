import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { articleId, content, token, parentId } = await req.json()

  if (!articleId || !content || !token) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const trimmed = content.trim()
  if (trimmed.length === 0) {
    return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 })
  }
  if (trimmed.length > 2000) {
    return NextResponse.json({ error: 'Comment is too long (max 2000 characters).' }, { status: 400 })
  }

  // Verify the user via their access token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'You must be signed in to comment.' }, { status: 401 })
  }

  // Enforce one level of reply nesting: parentId must itself be a top-level comment
  if (parentId) {
    const { data: parent } = await supabase
      .from('article_comments')
      .select('parent_id')
      .eq('id', parentId)
      .single()
    if (!parent || parent.parent_id) {
      return NextResponse.json({ error: 'Replies can only be made to top-level comments.' }, { status: 400 })
    }
  }

  // AI moderation via Claude
  try {
    const modRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: `You are a content moderator for a men's health and wellness community. Classify the following user comment. Reply with exactly one word: "allow" or "reject". Reject ONLY if the comment contains hate speech, harassment, bullying, slurs, threats of violence, or explicit sexual content. Allow blunt, emotional, or critical comments that don't target/attack other people. Comment: ${JSON.stringify(trimmed)}`
        }]
      })
    })
    const modData = await modRes.json()
    const classification = (modData?.content?.[0]?.text || 'allow').trim().toLowerCase()

    if (classification.includes('reject')) {
      return NextResponse.json({ error: "This comment doesn't meet our community guidelines. Please revise and try again." }, { status: 422 })
    }
  } catch (e) {
    // If moderation check fails (API error), allow the comment through rather than blocking users
  }

  const { data, error } = await supabase
    .from('article_comments')
    .insert({ article_id: articleId, user_id: user.id, content: trimmed, parent_id: parentId || null })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comment: data })
}
