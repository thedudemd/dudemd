import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export const metadata: Metadata = { title: "DudeMD — Modern Wellness for Real Life" }

export const revalidate = 60

async function getArticles() {
  const { data } = await supabase
    .from('articles')
    .select('*, authors(name), categories(name, slug)')
    .eq('published', true)
    .order('published_at', { ascending: false })
  return data || []
}

async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  return data || []
}

export default async function HomePage() {
  const articles = await getArticles()
  const categories = await getCategories()
  const featured = articles[0]
  const latest = articles.slice(1)
  const editorsPicks = articles.slice(1, 4)

  return (
    <>
      {/* HERO */}
      <section style={{ borderBottom: '1px solid #ede8df' }}>
        <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          {featured && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              <div style={{ position: 'relative' }}>
                <Link href={`/articles/${featured.slug}`}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', overflow: 'hidden' }}>
                    <img src={featured.cover_image_url} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,26,43,0.7) 0%, transparent 60%)' }} />
                    <span style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f7f4ee', backgroundColor: '#c9b28f', padding: '0.25rem 0.6rem' }}>{featured.categories?.name}</span>
                  </div>
                </Link>
                <div style={{ paddingTop: '1.25rem' }}>
                  <p style={{ fontSize: '11px', color: '#9a9085', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{featured.read_time} — {featured.authors?.name}</p>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.15, color: '#0e1a2b', marginBottom: '0.75rem' }}>
                    <Link href={`/articles/${featured.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{featured.title}</Link>
                  </h1>
                  <p style={{ fontSize: '15px', color: '#4A5563', lineHeight: 1.65 }}>{featured.excerpt}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', borderBottom: '1px solid #ede8df', paddingBottom: '0.5rem' }}>Editor&apos;s Picks</p>
                {editorsPicks.map((a) => (
                  <Link key={a.slug} href={`/articles/${a.slug}`} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', textDecoration: 'none', alignItems: 'start' }}>
                    <img src={a.cover_image_url} alt={a.title} style={{ width: '80px', height: '60px', objectFit: 'cover', display: 'block' }} />
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.3rem' }}>{a.categories?.name}</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.3 }}>{a.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CATEGORY RIBBON */}
      <section style={{ borderBottom: '1px solid #ede8df', padding: '1rem 0', backgroundColor: '#f7f4ee' }}>
        <div className="container-content">
          <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', alignItems: 'center', paddingBottom: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', flexShrink: 0 }}>Browse</span>
            <div style={{ width: '1px', height: '14px', backgroundColor: '#ede8df', flexShrink: 0 }} />
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ flexShrink: 0, fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0e1a2b', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section style={{ padding: '3rem 0', borderBottom: '1px solid #ede8df' }}>
        <div className="container-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.25rem', color: '#0e1a2b', letterSpacing: '-0.01em' }}>Latest</h2>
            <Link href="/articles" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', textDecoration: 'none' }}>All Articles →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
            {latest.map((a) => (
              <article key={a.slug}>
                <Link href={`/articles/${a.slug}`}>
                  <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img src={a.cover_image_url} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f' }}>{a.categories?.name}</span>
                  <span style={{ fontSize: '11px', color: '#9a9085' }}>{a.read_time}</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: '#0e1a2b', marginBottom: '0.5rem' }}>
                  <Link href={`/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                </h3>
                <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.55, marginBottom: '0.5rem' }}>{a.excerpt}</p>
                <p style={{ fontSize: '12px', color: '#9a9085' }}>{a.authors?.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ backgroundColor: '#0e1a2b', color: '#f7f4ee', padding: '4rem 0' }}>
        <div className="container-content">
          <div style={{ maxWidth: '30rem', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', display: 'block', marginBottom: '1rem' }}>Free Newsletter</span>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#f7f4ee', marginBottom: '0.75rem', lineHeight: 1.2 }}>
              Men&apos;s health that doesn&apos;t waste your time.
            </h2>
            <p style={{ fontSize: '14px', color: '#9a9085', marginBottom: '2rem', lineHeight: 1.6 }}>Evidence-based, experience-tested. One email per week.</p>
            <div style={{ display: 'flex', gap: '0', maxWidth: '26rem', margin: '0 auto' }}>
              <input type="email" placeholder="your@email.com" style={{ flex: 1, padding: '0.85rem 1rem', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none', color: '#f7f4ee', outline: 'none', fontSize: '14px' }} />
              <button style={{ padding: '0.85rem 1.5rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Join Free</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
