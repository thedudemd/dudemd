// @ts-nocheck
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'

export const revalidate = 60

async function getCategory(slug: string) {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

async function getArticlesByCategory(categoryId: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, authors(name), categories(name, slug)')
    .eq('category_id', categoryId)
    .eq('published', true)
    .order('published_at', { ascending: false })
  return data || []
}

async function getAllCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  return data || []
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return {}
  
  const desc = category.description || `Modern Men's Wellness for Real Life.`
  const url = `https://www.dudemd.com/category/${slug}`
  const image = category.cover_image_url || 'https://www.dudemd.com/og-image.png'
  return {
    title: category.name,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: category.name,
      description: desc,
      url,
      siteName: 'DudeMD',
      images: [{ url: image, width: 1200, height: 630, alt: `${category.name} — DudeMD` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@mydudemd',
      creator: '@mydudemd',
      title: category.name,
      description: desc,
      images: [image],
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()
  const articles = await getArticlesByCategory(category.id)
  const allCategories = await getAllCategories()

  return (
    <main>
      {/* CATEGORY HEADER */}
      <div style={{ backgroundColor: '#0e1a2b', padding: '3rem 0' }}>
        <div className="container-content">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Link href="/" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>Home</Link>
            <span style={{ fontSize: '12px', color: 'rgba(247,244,238,0.4)' }}>›</span>
            <span style={{ fontSize: '12px', color: '#c9b28f' }}>{category.name}</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#f7f4ee', marginBottom: '0.75rem' }}>{category.name}</h1>
          <p style={{ fontSize: '15px', color: 'rgba(247,244,238,0.6)', margin: 0 }}>Modern Men's Wellness for Real Life.</p>
        </div>
      </div>

      {/* CATEGORY NAV */}
      <div style={{ borderBottom: '1px solid #ede8df', backgroundColor: '#f7f4ee', padding: '1rem 0' }}>
        <div className="container-content">
          <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {allCategories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                style={{ flexShrink: 0, fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap', paddingBottom: '4px', color: cat.slug === slug ? '#0e1a2b' : '#9a9085', borderBottom: cat.slug === slug ? '2px solid #c9b28f' : '2px solid transparent' }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ARTICLES GRID */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container-content">
          {articles.length === 0 ? (
            <p style={{ fontSize: '16px', color: '#9a9085', textAlign: 'center', padding: '4rem 0' }}>No articles yet in this category. Check back soon.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
              {articles.map((a) => (
                <article key={a.slug}>
                  <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`}>
                    <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', marginBottom: '1rem' }}>
                      <img src={a.cover_image_url} alt={`${a.title} — ${a.categories?.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </Link>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f' }}>{a.categories?.name}</span>
                    <span style={{ fontSize: '11px', color: '#9a9085' }}>{a.read_time}</span>
                  </div>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3, color: '#0e1a2b', marginBottom: '0.5rem' }}>
                    <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                  </h2>
                  <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.55, marginBottom: '0.5rem' }}>{a.excerpt}</p>
                  <p style={{ fontSize: '12px', color: '#9a9085' }}>{a.authors?.name}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ backgroundColor: '#0e1a2b', padding: '4rem 0' }}>
        <div className="container-content">
          <div style={{ maxWidth: '30rem', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', display: 'block', marginBottom: '1rem' }}>Free Newsletter</span>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#f7f4ee', marginBottom: '0.75rem', lineHeight: 1.2 }}>Men&apos;s health that doesn&apos;t waste your time.</h2>
            <p style={{ fontSize: '14px', color: '#9a9085', marginBottom: '2rem', lineHeight: 1.6 }}>Evidence-based, experience-tested. One email per week.</p>
            <div style={{ display: 'flex', maxWidth: '26rem', margin: '0 auto' }}>
              <input type="email" placeholder="your@email.com" style={{ flex: 1, padding: '0.85rem 1rem', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none', color: '#f7f4ee', outline: 'none', fontSize: '14px' }} />
              <button style={{ padding: '0.85rem 1.5rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Join Free</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
