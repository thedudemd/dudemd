import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {author.twitter && <a href={author.twitter} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#c9b28f', textDecoration: 'none', letterSpacing: '0.08em' }}>X / Twitter ↗</a>}
                {author.instagram && <a href={author.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#c9b28f', textDecoration: 'none', letterSpacing: '0.08em' }}>Instagram ↗</a>}
                {author.linkedin && <a href={author.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#c9b28f', textDecoration: 'none', letterSpacing: '0.08em' }}>LinkedIn ↗</a>}
                {author.website && <a href={author.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#c9b28f', textDecoration: 'none', letterSpacing: '0.08em' }}>Website ↗</a>}
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
              <Link key={article.slug} href={`/articles/${article.categories?.slug}/${article.slug}`} className="article-card" style={{ textDecoration: 'none', backgroundColor: '#fff', border: '1px solid #ede8df', display: 'block' }}>
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
