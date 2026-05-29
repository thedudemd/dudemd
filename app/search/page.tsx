// @ts-nocheck
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search DudeMD for men\'s wellness articles.',
}

async function searchArticles(query: string) {
  if (!query || query.trim().length === 0) return []
  
  const { data } = await supabase
    .from('articles')
    .select('*, authors(name), categories!articles_category_id_fkey(name, slug)')
    .eq('published', true)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(20)
  
  return data || []
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const query = params.q || ''
  const results = query ? await searchArticles(query) : []

  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container-content">
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>
          Search DudeMD
        </h1>

        <form method="GET" action="/search" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', maxWidth: '40rem' }}>
            <input 
              type="text" 
              name="q" 
              defaultValue={query}
              placeholder="Search articles..." 
              autoFocus
              style={{ 
                flex: 1, 
                padding: '0.85rem 1rem', 
                backgroundColor: '#fff', 
                border: '1px solid #ded9d0', 
                borderRight: 'none', 
                color: '#0e1a2b', 
                outline: 'none', 
                fontSize: '15px' 
              }} 
            />
            <button type="submit" style={{ 
              padding: '0.85rem 1.5rem', 
              backgroundColor: '#0e1a2b', 
              color: '#f7f4ee', 
              fontWeight: 700, 
              fontSize: '12px', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              border: 'none', 
              cursor: 'pointer' 
            }}>
              Search
            </button>
          </div>
        </form>

        {query && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '14px', color: '#9a9085' }}>
              {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
            </p>
          </div>
        )}

        {!query && (
          <p style={{ fontSize: '16px', color: '#9a9085', textAlign: 'center', padding: '4rem 0' }}>
            Enter a search term to find articles.
          </p>
        )}

        {query && results.length === 0 && (
          <p style={{ fontSize: '16px', color: '#9a9085', textAlign: 'center', padding: '4rem 0' }}>
            No articles found for "{query}". Try a different search term.
          </p>
        )}

        {results.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {results.map((a) => (
              <article key={a.slug}>
                <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`}>
                  <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img src={a.cover_image_url} alt={`${a.title} — ${a.categories?.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Link href={`/category/${a.categories?.slug}`} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f', textDecoration: 'none' }}>
                    {a.categories?.name}
                  </Link>
                  <span style={{ fontSize: '11px', color: '#9a9085' }}>{a.read_time}</span>
                </div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3, color: '#0e1a2b', marginBottom: '0.5rem' }}>
                  <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                </h2>
                <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.55, marginBottom: '0.5rem' }}>{a.excerpt}</p>
                <p style={{ fontSize: '12px', color: '#9a9085' }}>By {a.authors?.name}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
