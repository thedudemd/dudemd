// @ts-nocheck
import type { Metadata } from 'next'
import GoogleOneTap from "@/components/auth/GoogleOneTap"
import PersonalizedWelcome from "@/components/personalization/PersonalizedWelcome"
import Link from 'next/link'
import OptinDisplay from '@/components/OptinDisplay'
import SidebarAd from '@/components/SidebarAd'
import InFeedAd from '@/components/InFeedAd'
import PersonalizedSection from '@/components/PersonalizedSection'
import { supabaseServer as supabase } from '@/lib/supabase/server'

export const metadata: Metadata = { title: "DudeMD — Modern Men's Wellness for Real Life" }

export const revalidate = 60

async function getArticles() {
  const { data } = await supabase
    .from('articles')
    .select('*, authors!articles_author_id_fkey(name), categories!articles_category_id_fkey(name, slug)')
    .eq('published', true)
    .order('published_at', { ascending: false })
  return data || []
}

async function getCategoryArticles(categorySlug, limit = 3) {
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()
  if (!category) return []
  const { data } = await supabase
    .from('articles')
    .select('*, authors!articles_author_id_fkey(name), categories!articles_category_id_fkey(name, slug)')
    .eq('category_id', category.id)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data || []
}

async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id',null)
    .order('name')
  return data || []
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "DudeMD",
  "url": "https://www.dudemd.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.dudemd.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "DudeMD",
  "alternateName": "DudeMD Media",
  "url": "https://www.dudemd.com",
  "logo": "https://www.dudemd.com/dude-md.svg",
  "image": "https://www.dudemd.com/og-image.png",
  "description": "DudeMD is a men's wellness authority covering the full spectrum of modern men's well-being — physical, mental, emotional, financial, relational, career, sexual, and lifestyle. Evidence-based, expert-reviewed editorial for men who want to live better in every dimension.",
  "slogan": "Modern Wellness for Real Life",
  "foundingLocation": {
    "@type": "Place",
    "name": "Seattle, WA"
  },
  "knowsAbout": [
    "Men's Wellness",
    "Men's Health",
    "Physical Wellness",
    "Mental Wellness",
    "Emotional Wellness",
    "Financial Wellness",
    "Relationship Wellness",
    "Career and Workplace Wellness",
    "Spiritual Wellness",
    "Social Wellness",
    "Sexual Wellness",
    "Nutritional Wellness",
    "Fitness and Performance",
    "Recovery and Sleep",
    "Style and Grooming",
    "Personal Growth",
    "Mindset and Purpose",
    "Inclusive Wellness"
  ],
  "publishingPrinciples": "https://www.dudemd.com/editorial-policy",
  "sameAs": [
    "https://www.facebook.com/MyDudeMD",
    "https://www.instagram.com/mydudemd",
    "https://www.twitter.com/mydudemd",
    "https://www.tiktok.com/@TheDudeMd",
    "https://www.youtube.com/@dudemd"
  ]
}

export default async function HomePage() {
  const articles = await getArticles()
  const categories = await getCategories()
  const mindArticles = await getCategoryArticles('mind', 3)
  const lifestyleArticles = await getCategoryArticles('lifestyle', 3)
  const recoveryArticles = await getCategoryArticles('recovery', 3)
  const featured = articles[0]
  const secondary = articles.slice(1, 3)
  const latest = articles.slice(3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <h1 className="sr-only">DudeMD — Modern Men's Wellness for Real Life</h1>
      <GoogleOneTap />
      <OptinDisplay isHomepage />
      <OptinDisplay isHomepage />


      {/* HERO — FEATURED + TWO SECONDARY */}
      <section style={{ padding: '2.5rem 0 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container-content">
          <div className="hero-grid">

            {/* MAIN FEATURED */}
            {featured && (
              <div className="hero-featured">
                <Link href={`/articles/${featured.categories?.slug}/${featured.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', marginBottom: '1.25rem' }}>
                    <img
                      src={featured.cover_image_url || '/placeholder-cover.jpg'}
                      alt={`${featured.title} — ${featured.categories?.name}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,26,43,0.55) 0%, transparent 50%)' }} />
                  </div>
                </Link>
                <div style={{ paddingBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <Link href={`/category/${featured.categories?.slug}`} style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-cream)', backgroundColor: 'var(--color-gold)', padding: '0.2rem 0.6rem', textDecoration: 'none' }}>{featured.categories?.name}</Link>
                    <span style={{ fontSize: '11px', color: '#9a9085' }}>{featured.read_time}</span>
                  </div>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', lineHeight: 1.15, color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
                    <Link href={`/articles/${featured.categories?.slug}/${featured.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{featured.title}</Link>
                  </h2>
                  <p style={{ fontSize: '15px', color: 'var(--color-slate)', lineHeight: 1.65, marginBottom: '0.75rem' }}>{featured.excerpt}</p>
                  <p style={{ fontSize: '12px', color: '#9a9085' }}>By {featured.authors?.name}</p>
                </div>
              </div>
            )}

            {/* SECONDARY TWO STACK */}
            <div className="hero-picks">
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9085', paddingBottom: '0.75rem', borderBottom: '2px solid var(--color-navy)', marginBottom: '1.25rem' }}>Editor&apos;s Picks</p>
              {secondary.map((a, i) => (
                <div key={a.slug} style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: i < secondary.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <img
                        src={a.cover_image_url || '/placeholder-cover.jpg'}
                        alt={`${a.title} — ${a.categories?.name}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  </Link>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>{a.categories?.name}</span>
                    <span style={{ fontSize: '10px', color: '#9a9085' }}>{a.read_time}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: 'var(--color-navy)' }}>
                    <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                  </h3>
                  <p style={{ fontSize: '12px', color: '#9a9085', marginTop: '0.35rem' }}>By {a.authors?.name}</p>
                </div>
              ))}
              <SidebarAd />
            </div>

          </div>
        </div>
      </section>

      

      <PersonalizedSection />

      {mindArticles.length > 0 && (
      <section style={{ padding: '3rem 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', borderBottom: '2px solid var(--color-navy)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-navy)', letterSpacing: '-0.01em' }}>Latest in Mind</h2>
            <Link href="/category/mind" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem' }}>
            {mindArticles.map((a) => (
              <article key={a.slug}>
                <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img
                      src={a.cover_image_url || '/placeholder-cover.jpg'}
                      alt={`${a.title} — ${a.categories?.name}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Link href={`/category/${a.categories?.slug}`} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>{a.categories?.name}</Link>
                  <span style={{ fontSize: '10px', color: '#9a9085' }}>{a.read_time}</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
                  <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.55, marginBottom: '0.4rem' }}>{a.excerpt}</p>
                <p style={{ fontSize: '11px', color: '#9a9085' }}>By {a.authors?.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}
      {lifestyleArticles.length > 0 && (
      <section style={{ padding: '3rem 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', borderBottom: '2px solid var(--color-navy)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-navy)', letterSpacing: '-0.01em' }}>Latest in Lifestyle</h2>
            <Link href="/category/lifestyle" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem' }}>
            {lifestyleArticles.map((a) => (
              <article key={a.slug}>
                <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img
                      src={a.cover_image_url || '/placeholder-cover.jpg'}
                      alt={`${a.title} — ${a.categories?.name}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Link href={`/category/${a.categories?.slug}`} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>{a.categories?.name}</Link>
                  <span style={{ fontSize: '10px', color: '#9a9085' }}>{a.read_time}</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
                  <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.55, marginBottom: '0.4rem' }}>{a.excerpt}</p>
                <p style={{ fontSize: '11px', color: '#9a9085' }}>By {a.authors?.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}
      <InFeedAd />
      {recoveryArticles.length > 0 && (
      <section style={{ padding: '3rem 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', borderBottom: '2px solid var(--color-navy)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-navy)', letterSpacing: '-0.01em' }}>Latest in Recovery</h2>
            <Link href="/category/recovery" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem' }}>
            {recoveryArticles.map((a) => (
              <article key={a.slug}>
                <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img
                      src={a.cover_image_url || '/placeholder-cover.jpg'}
                      alt={`${a.title} — ${a.categories?.name}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Link href={`/category/${a.categories?.slug}`} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>{a.categories?.name}</Link>
                  <span style={{ fontSize: '10px', color: '#9a9085' }}>{a.read_time}</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
                  <Link href={a.external_url || `/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.55, marginBottom: '0.4rem' }}>{a.excerpt}</p>
                <p style={{ fontSize: '11px', color: '#9a9085' }}>By {a.authors?.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CATEGORY BAND */}
      <section style={{ backgroundColor: 'var(--color-navy)', padding: '2.5rem 0' }}>
        <div className="container-content">
          <div className="category-band-links">
            {[
              { label: 'Fitness', slug: 'fitness' },
              { label: 'Health', slug: 'health' },
              { label: 'Lifestyle', slug: 'lifestyle' },
              { label: 'Mind', slug: 'mind' },
              { label: 'Recovery', slug: 'recovery' },
            ].map((cat) => (
              <Link key={cat.slug} href={'/category/' + cat.slug} style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>{cat.label}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ backgroundColor: 'var(--color-cream)', padding: '4rem 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container-content">
          <div style={{ maxWidth: '28rem', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', display: 'block', marginBottom: '0.75rem' }}>Free Newsletter</span>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: 'var(--color-navy)', marginBottom: '0.6rem', lineHeight: 1.2 }}>
              Men&apos;s wellness that doesn&apos;t waste your time.
            </h2>
            <p style={{ fontSize: '14px', color: '#9a9085', marginBottom: '1.75rem', lineHeight: 1.6 }}>Evidence-based. Experience-tested. One email per week.</p>
            <div style={{ display: 'flex', maxWidth: '24rem', margin: '0 auto' }}>
              <input type="email" placeholder="your@email.com" style={{ flex: 1, padding: '0.85rem 1rem', backgroundColor: '#fff', border: '1px solid #ded9d0', borderRight: 'none', color: 'var(--color-navy)', outline: 'none', fontSize: '14px' }} />
              <button style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Join Free</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
