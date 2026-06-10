'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

function getAuthFromCookie() {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/dudemd-auth=([^;]+)/)
  if (!match) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]))
    return { uid: parsed?.user?.id, token: parsed?.access_token }
  } catch { return null }
}

export default function PersonalizedSection() {
  const [articles, setArticles] = useState<any[]>([])
  const [topCategory, setTopCategory] = useState<{ name: string, slug: string } | null>(null)

  useEffect(() => {
    async function load() {
      const auth = getAuthFromCookie()
      if (!auth?.uid || !auth?.token) return

      const scoresRes = await fetch(`${SUPABASE_URL}/rest/v1/user_scores?select=category_scores&user_id=eq.${auth.uid}&limit=1`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
      })
      const scoresData = await scoresRes.json()
      const scores = scoresData?.[0]?.category_scores || {}

      const entries = Object.entries(scores).filter(([k]) => k !== 'general') as [string, number][]
      if (entries.length === 0) return
      entries.sort((a, b) => b[1] - a[1])

      // Only personalize if there's a clear top category (meaningfully ahead of second place)
      if (entries.length > 1 && entries[0][1] < entries[1][1] * 1.5) return
      const topSlug = entries[0][0]

      const articlesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/articles?select=title,slug,excerpt,cover_image_url,read_time,categories!articles_category_id_fkey(name,slug)&categories.slug=eq.${topSlug}&published=eq.true&order=published_at.desc&limit=4`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` } }
      )
      const articlesData = await articlesRes.json()
      const filtered = (articlesData || []).filter((a: any) => a.categories?.slug === topSlug)
      if (filtered.length === 0) return
      setArticles(filtered)
      setTopCategory({ name: filtered[0].categories?.name || topSlug, slug: topSlug })
    }
    load().catch(() => {})
  }, [])

  if (articles.length === 0 || !topCategory) return null

  return (
    <section style={{ padding: '3rem 0', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
      <div className="container-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', borderBottom: '2px solid var(--color-navy)', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-navy)', letterSpacing: '-0.01em' }}>More from {topCategory.name}</h2>
          <Link href={`/category/${topCategory.slug}`} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>View All →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem' }}>
          {articles.map((a) => (
            <article key={a.slug}>
              <Link href={`/articles/${a.categories?.slug}/${a.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden', marginBottom: '1rem' }}>
                  <img src={a.cover_image_url || '/placeholder-cover.jpg'} alt={`${a.title} — ${a.categories?.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </Link>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Link href={`/category/${a.categories?.slug}`} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>{a.categories?.name}</Link>
                {a.read_time && <span style={{ fontSize: '10px', color: '#9a9085' }}>{a.read_time}</span>}
              </div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
                <Link href={`/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
              </h3>
              {a.excerpt && <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.55 }}>{a.excerpt}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
