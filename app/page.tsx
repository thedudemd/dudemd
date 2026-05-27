// @ts-nocheck
import type { Metadata } from 'next'
import GoogleOneTap from "@/components/auth/GoogleOneTap"
import PersonalizedWelcome from "@/components/personalization/PersonalizedWelcome"
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export const metadata: Metadata = { title: "DudeMD — Modern Men's Wellness for Real Life" }

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
  const secondary = articles.slice(1, 3)
  const latest = articles.slice(3)

  return (
    <>
      <h1 className="sr-only">DudeMD — Modern Men's Wellness for Real Life</h1>
      <GoogleOneTap />
      <PersonalizedWelcome />
      {/* TOP BAR */}
      <div style={{ backgroundColor: '#c9b28f', padding: '0.4rem 0' }}>
        <div className="container-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.5rem' }}>
            <Link href="/signin" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0e1a2b', textDecoration: 'none' }}>Sign In</Link>
            <span style={{ color: 'rgba(14,26,43,0.3)', fontSize: '10px' }}>|</span>
            <Link href="/newsletter" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0e1a2b', textDecoration: 'none' }}>Subscribe</Link>
          </div>
        </div>
      </div>

      {/* HERO — FEATURED + TWO SECONDARY */}
      <section style={{ padding: '2.5rem 0 0', borderBottom: '1px solid #ede8df' }}>
        <div className="container-content">
          <div className="hero-grid">

            {/* MAIN FEATURED */}
            {featured && (
              <div className="hero-featured">
                <Link href={`/articles/${featured.categories?.slug}/${featured.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', marginBottom: '1.25rem' }}>
                    <img
                      src={featured.cover_image_url || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=80'}
                      alt={`${featured.title} — ${featured.categories?.name}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,26,43,0.55) 0%, transparent 50%)' }} />
                  </div>
                </Link>
                <div style={{ paddingBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <Link href={`/category/${featured.categories?.slug}`} style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f7f4ee', backgroundColor: '#c9b28f', padding: '0.2rem 0.6rem', textDecoration: 'none' }}>{featured.categories?.name}</Link>
                    <span style={{ fontSize: '11px', color: '#9a9085' }}>{featured.read_time}</span>
                  </div>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', lineHeight: 1.15, color: '#0e1a2b', marginBottom: '0.75rem' }}>
                    <Link href={`/articles/${featured.categories?.slug}/${featured.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{featured.title}</Link>
                  </h2>
                  <p style={{ fontSize: '15px', color: '#4A5563', lineHeight: 1.65, marginBottom: '0.75rem' }}>{featured.excerpt}</p>
                  <p style={{ fontSize: '12px', color: '#9a9085' }}>By {featured.authors?.name}</p>
                </div>
              </div>
            )}

            {/* SECONDARY TWO STACK */}
            <div className="hero-picks">
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9085', paddingBottom: '0.75rem', borderBottom: '2px solid #0e1a2b', marginBottom: '1.25rem' }}>Editor&apos;s Picks</p>
              {secondary.map((a, i) => (
                <div key={a.slug} style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: i < secondary.length - 1 ? '1px solid #ede8df' : 'none' }}>
                  <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <img
                        src={a.cover_image_url || 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80'}
                        alt={`${a.title} — ${a.categories?.name}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  </Link>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>{a.categories?.name}</span>
                    <span style={{ fontSize: '10px', color: '#9a9085' }}>{a.read_time}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: '#0e1a2b' }}>
                    <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                  </h3>
                  <p style={{ fontSize: '12px', color: '#9a9085', marginTop: '0.35rem' }}>By {a.authors?.name}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORY RIBBON */}
      <section style={{ borderBottom: '1px solid #ede8df', padding: '0.85rem 0', backgroundColor: '#f7f4ee', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container-content">
          <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', alignItems: 'center', scrollbarWidth: 'none' }}>
            <Link href="/articles" style={{ flexShrink: 0, fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0e1a2b', textDecoration: 'none', whiteSpace: 'nowrap' }}>All</Link>
            <div style={{ width: '1px', height: '14px', backgroundColor: '#ede8df', flexShrink: 0 }} />
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ flexShrink: 0, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST GRID */}
      <section style={{ padding: '3rem 0', borderBottom: '1px solid #ede8df' }}>
        <div className="container-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', borderBottom: '2px solid #0e1a2b', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', color: '#0e1a2b', letterSpacing: '-0.01em' }}>Latest</h2>
            <Link href="/articles" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9b28f', textDecoration: 'none' }}>All Articles →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem' }}>
            {(latest.length > 0 ? latest : articles).map((a) => (
              <article key={a.slug}>
                <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img
                      src={a.cover_image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'}
                      alt={`${a.title} — ${a.categories?.name}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Link href={`/category/${a.categories?.slug}`} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', textDecoration: 'none' }}>{a.categories?.name}</Link>
                  <span style={{ fontSize: '10px', color: '#9a9085' }}>{a.read_time}</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: '#0e1a2b', marginBottom: '0.5rem' }}>
                  <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                </h3>
                <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.55, marginBottom: '0.4rem' }}>{a.excerpt}</p>
                <p style={{ fontSize: '11px', color: '#9a9085' }}>By {a.authors?.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WELLNESS MISSION BAND */}
      <section style={{ backgroundColor: '#0e1a2b', padding: '3rem 0' }}>
        <div className="container-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { label: 'Mind', desc: 'Mental clarity, stress, focus' },
              { label: 'Body', desc: 'Fitness, nutrition, recovery' },
              { label: 'Style', desc: 'Grooming, fashion, presence' },
              { label: 'Life', desc: 'Relationships, purpose, growth' },
            ].map((p) => (
              <div key={p.label}>
                <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.4rem' }}>{p.label}</p>
                <p style={{ fontSize: '13px', color: 'rgba(247,244,238,0.55)', lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ backgroundColor: '#f7f4ee', padding: '4rem 0', borderTop: '1px solid #ede8df' }}>
        <div className="container-content">
          <div style={{ maxWidth: '28rem', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9b28f', display: 'block', marginBottom: '0.75rem' }}>Free Newsletter</span>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: '#0e1a2b', marginBottom: '0.6rem', lineHeight: 1.2 }}>
              Men&apos;s wellness that doesn&apos;t waste your time.
            </h2>
            <p style={{ fontSize: '14px', color: '#9a9085', marginBottom: '1.75rem', lineHeight: 1.6 }}>Evidence-based. Experience-tested. One email per week.</p>
            <div style={{ display: 'flex', maxWidth: '24rem', margin: '0 auto' }}>
              <input type="email" placeholder="your@email.com" style={{ flex: 1, padding: '0.85rem 1rem', backgroundColor: '#fff', border: '1px solid #ded9d0', borderRight: 'none', color: '#0e1a2b', outline: 'none', fontSize: '14px' }} />
              <button style={{ padding: '0.85rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Join Free</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
