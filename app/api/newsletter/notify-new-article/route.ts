import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { articleId } = await req.json()
  if (!articleId) return NextResponse.json({ error: 'articleId required' }, { status: 400 })

  // Check feature flag
  const { data: flag } = await supabase.from('feature_flags').select('enabled').eq('key', 'auto_newsletter_on_publish').single()
  if (!flag?.enabled) {
    return NextResponse.json({ skipped: true, reason: 'flag disabled' })
  }

  // Fetch article
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, cover_image_url, slug, category_id, categories!articles_category_id_fkey(slug)')
    .eq('id', articleId)
    .single()

  if (!article || !article.category_id) {
    return NextResponse.json({ skipped: true, reason: 'article or category not found' })
  }

  // Find matching subscribers
  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('id, email')
    .contains('subscribed_categories', [article.category_id])
    .eq('status', 'active')

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, reason: 'no matching subscribers' })
  }

  // Load template
  const { data: template } = await supabase.from('system_emails').select('subject, html').eq('key', 'new_article_notification').single()
  if (!template?.html) {
    return NextResponse.json({ skipped: true, reason: 'no template found' })
  }

  const articleUrl = `https://www.dudemd.com/articles/${article.categories?.slug}/${article.slug}`
  let subject = (template.subject || 'New on DudeMD: {{article_title}}').split('{{article_title}}').join(article.title)

  let sent = 0
  for (const sub of subscribers) {
    if (!sub.email) continue
    const unsubscribeLink = `https://www.dudemd.com/unsubscribe?email=${encodeURIComponent(sub.email)}`
    let html = template.html
      .split('{{article_title}}').join(article.title)
      .split('{{article_excerpt}}').join(article.excerpt || '')
      .split('{{article_image}}').join(article.cover_image_url || '')
      .split('{{article_url}}').join(articleUrl)
      .split('{{unsubscribe_link}}').join(unsubscribeLink)

    try {
      await resend.emails.send({
        from: 'DudeMD <hello@dudemd.com>',
        to: sub.email,
        subject,
        html
      })
      await supabase.from('newsletter_subscribers').update({ last_emailed_at: new Date().toISOString() }).eq('id', sub.id)
      sent++
    } catch (e) {}
  }

  // Ping Google Search Console sitemap
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.dudemd.com"}/api/gsc-ping`, { method: "POST" }).catch(() => {})
  // Ping Google Search Console sitemap
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.dudemd.com"}/api/gsc-ping`, { method: "POST" }).catch(() => {})
  // Ping Google Search Console sitemap
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.dudemd.com"}/api/gsc-ping`, { method: "POST" }).catch(() => {})
  return NextResponse.json({ sent })
}
