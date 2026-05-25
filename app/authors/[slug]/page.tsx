// @ts-nocheck
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'

export const revalidate = 60

async function getAuthor(slug: string) {
  const { data } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

async function getAuthorArticles(authorId: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, categories(name, slug)')
    .eq('author_id', authorId)
    .eq('published', true)
    .order('published_at', { ascending: false })
  return data || []
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) return {}
  
  return {
    title: `${author.name} — DudeMD Author`,
    description: author.bio || `Articles by ${author.name} on DudeMD`,
    alternates: {
      canonical: `https://www.dudemd.com/authors/${slug}`,
    },
  }
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()
  const articles = await getAuthorArticles(author.id)

  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "url": `https://www.dudemd.com/authors/${slug}`,
    "description": author.bio || `Contributing writer at DudeMD`,
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      <div style={{ backgroundColor: '#0e1a2b', padding: '3rem 0' }}>
        <div className="container-content">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Link href="/" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>Home</Link>
            <span style={{ fontSize: '12px', color: 'rgba(247,244,238,0.4)' }}>›</span>
            <span style={{ fontSize: '12px', color: '#c9b28f' }}>Authors</span>
            <span style={{ fontSize: '12px', color: 'rgba(247,244,238,0.4)' }}>›</span>
            <span style={{ fontSize: '12px', color: '#c9b28f' }}>{author.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'start', gap: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#c9b28f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '32px', fontWeight: 700, color: '#0e1a2b' }}>{author.name?.charAt(0)}</span>
            </div>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#f7f4ee', marginBottom: '0.75rem' }}>
                {author.name}
              </h1>
              <p style={{ fontSize: '16px', color: 'rgba(247,244,238,0.7)', lineHeight: 1.65, maxWidth: '42rem', margin: 0 }}>
                {author.bio || 'Contributing writer at DudeMD.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section style={{ padding: '3rem 0', backgroundColor: '#f7f4ee' }}>
        <div className="container-content">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '2rem' }}>
            Articles by {author.name}
          </h2>

          {articles.length === 0 ? (
            <p style={{ fontSize: '16px', color: '#9a9085', textAlign: 'center', padding: '4rem 0' }}>
              No published articles yet.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
              {articles.map((a) => (
                <article key={a.slug}>
                  <Link href={`/articles/${a.slug}`}>
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
                  <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3, color: '#0e1a2b', marginBottom: '0.5rem' }}>
                    <Link href={`/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                  </h3>
                  <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.55, marginBottom: '0.5rem' }}>{a.excerpt}</p>
                  <p style={{ fontSize: '12px', color: '#9a9085' }}>
                    {new Date(a.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
