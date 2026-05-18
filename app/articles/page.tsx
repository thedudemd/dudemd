import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export const metadata: Metadata = { title: 'Articles — DudeMD' }

export const revalidate = 60

export default async function ArticlesPage() {

  const { data: articles } = await supabase
    .from('articles')
    .select('*, authors(name), categories(name, slug)')
    .eq('published', true)
    .order('published_at', { ascending: false })

  const all = articles || []

  return (
    <div className="container-content" style={{ padding: '3rem 1rem' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#0e1a2b', marginBottom: '2rem' }}>All Articles</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {all.map((a) => (
          <article key={a.slug}>
            <Link href={`/articles/${a.slug}`}>
              <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', marginBottom: '1rem' }}>
                <img src={a.cover_image_url} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </Link>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f' }}>{a.categories?.name}</span>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: '#0e1a2b', margin: '0.5rem 0' }}>
              <Link href={`/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
            </h2>
            <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.55 }}>{a.excerpt}</p>
            <p style={{ fontSize: '12px', color: '#9a9085', marginTop: '0.5rem' }}>{a.authors?.name}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
