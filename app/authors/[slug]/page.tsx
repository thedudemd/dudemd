import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EditProfileButton from './EditProfileButton'
import type { Metadata } from 'next'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function getAuthor(slug: string) {
  const { data } = await supabase.from('authors').select('*').eq('slug', slug).single()
  return data
}

async function getAuthorArticles(authorId: string) {
  const { data } = await supabase.from('articles').select('title, slug, excerpt, cover_image_url, published_at, categories(name, slug)').eq('author_id', authorId).eq('published', true).order('published_at', { ascending: false })
  return data || []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) return {}
  return {
    title: `${author.name} | DudeMD`,
    description: author.meta_description || author.bio?.substring(0, 160),
    openGraph: {
      title: `${author.name} | DudeMD`,
      description: author.meta_description || author.bio?.substring(0, 160),
      images: author.avatar_url ? [{ url: author.avatar_url, width: 400, height: 400 }] : [],
    }
  }
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()
  const articles = await getAuthorArticles(author.id)

  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh' }}>
      <style>{`
        .author-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media (min-width: 640px) { .author-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .author-grid { grid-template-columns: repeat(3, 1fr); } }
        .article-card:hover img { transform: scale(1.03); }
      `}</style>

      {/* HERO */}
      <div style={{ backgroundColor: '#0e1a2b', padding: '3rem 0' }}>
        <div className="container-content" style={{ maxWidth: '900px' }}>
          <Link href="/" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.5)', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>← DudeMD</Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {author.avatar_url ? (
              <img src={author.avatar_url} alt={author.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #c9b28f', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: '#c9b28f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '3px solid #c9b28f' }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: '#0e1a2b' }}>{author.name?.charAt(0)}</span>
              </div>
            )}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.5rem' }}>Author</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#f7f4ee', marginBottom: '0.5rem' }}>{author.name}</h1>
              {author.title && <p style={{ fontSize: '15px', color: 'rgba(247,244,238,0.65)', marginBottom: '1rem' }}>{author.title}</p>}
              {author.bio && <p style={{ fontSize: '15px', color: 'rgba(247,244,238,0.8)', lineHeight: 1.7, maxWidth: '600px', marginBottom: '1.25rem' }}>{author.bio}</p>}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {author.twitter && <a href={author.twitter} target="_blank" rel="noopener noreferrer" title="X / Twitter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, backgroundColor: '#000', borderRadius: '50%', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>}
                {author.instagram && <a href={author.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', borderRadius: '50%', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>}
                {author.linkedin && <a href={author.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, backgroundColor: '#0A66C2', borderRadius: '50%', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>}
                {author.website && <a href={author.website} target="_blank" rel="noopener noreferrer" title="Website" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, backgroundColor: '#c9b28f', borderRadius: '50%', color: '#0e1a2b' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>}
                <EditProfileButton authorId={author.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARTICLES */}
      <div className="container-content" style={{ maxWidth: '900px', paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', borderBottom: '2px solid #0e1a2b', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#0e1a2b' }}>Articles by {author.name.split(' ')[0]}</h2>
          <span style={{ fontSize: '12px', color: '#9a9085' }}>{articles.length} article{articles.length !== 1 ? 's' : ''}</span>
        </div>

        {articles.length === 0 ? (
          <p style={{ color: '#9a9085', textAlign: 'center', padding: '3rem 0' }}>No published articles yet.</p>
        ) : (
          <div className="author-grid">
            {articles.map((article: any) => (
              <Link key={article.slug} href={article.external_url || `/articles/${article.categories?.slug}/${article.slug}`} className="article-card" style={{ textDecoration: 'none', backgroundColor: '#fff', border: '1px solid #ede8df', display: 'block' }}>
                {article.cover_image_url && (
                  <div style={{ overflow: 'hidden', height: '180px' }}>
                    <img src={article.cover_image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
                  </div>
                )}
                <div style={{ padding: '1.25rem' }}>
                  {article.categories?.name && (
                    <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9b28f', display: 'block', marginBottom: '0.5rem' }}>{article.categories.name}</span>
                  )}
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#0e1a2b', lineHeight: 1.4, marginBottom: '0.5rem' }}>{article.title}</h3>
                  {article.excerpt && <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.6, marginBottom: '0.75rem' }}>{article.excerpt.substring(0, 100)}{article.excerpt.length > 100 ? '...' : ''}</p>}
                  {article.published_at && <span style={{ fontSize: '11px', color: '#9a9085' }}>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
