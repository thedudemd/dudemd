import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Category — DudeMD' }

const ARTICLES = [
  { slug: 'the-testosterone-guide', category: 'Health', title: 'The Complete Testosterone Guide for Men Over 30', excerpt: "What the numbers actually mean, what moves the needle, and what your doctor probably won't tell you.", author: 'Dr. James Mercer', readTime: '9 min read', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80' },
  { slug: 'sleep-recovery', category: 'Recovery', title: 'The 7-Day Sleep Reset That Actually Works', excerpt: 'Evidence-backed habits that recalibrate your sleep in one week.', author: 'Marcus Reid', readTime: '6 min read', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80' },
  { slug: 'strength-40s', category: 'Fitness', title: "Strength Training in Your 40s: What Changes and What Doesn't", excerpt: 'The science of muscle after 40.', author: 'Coach T. Williams', readTime: '8 min read', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
  { slug: 'stress-cortisol', category: 'Health', title: 'Chronic Stress Is Wrecking Your Hormones', excerpt: 'Cortisol, testosterone, and the feedback loop most men never hear about.', author: 'Dr. Sarah Okonkwo', readTime: '7 min read', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80' },
  { slug: 'grooming-routine', category: 'Style', title: "A No-Nonsense Grooming Routine for Men Who Don't Have Time", excerpt: 'Four products, ten minutes, done.', author: 'DudeMD Staff', readTime: '4 min read', image: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=600&q=80' },
  { slug: 'gut-health', category: 'Health', title: "Your Gut Is Running Your Brain. Here's How to Fix It", excerpt: 'The microbiome research every man should know.', author: 'Dr. James Mercer', readTime: '6 min read', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80' },
  { slug: 'cold-exposure', category: 'Recovery', title: 'Cold Exposure: Separating the Hype From the Science', excerpt: "What cold plunges actually do — and don't do — for your body.", author: 'Marcus Reid', readTime: '5 min read', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80' },
  { slug: 'protein-guide', category: 'Fitness', title: 'How Much Protein Do You Actually Need?', excerpt: 'The actual science behind protein intake for men.', author: 'Coach T. Williams', readTime: '5 min read', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80' },
  { slug: 'gear-essentials', category: 'Gear', title: 'The 10 Gear Essentials Every Man Should Own in 2025', excerpt: 'Tested, proven, worth every dollar.', author: 'DudeMD Staff', readTime: '7 min read', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
]

const CATS = ['Health', 'Fitness', 'Recovery', 'Mental Health', 'Style', 'Gear']

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const label = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
  const filtered = ARTICLES.filter(a => a.category.toLowerCase() === slug.toLowerCase())
  const articles = filtered.length > 0 ? filtered : ARTICLES

  return (
    <main>
      {/* CATEGORY HEADER */}
      <div style={{ backgroundColor: '#0e1a2b', padding: '3rem 0' }}>
        <div className="container-content">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Link href="/" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>Home</Link>
            <span style={{ fontSize: '12px', color: 'rgba(247,244,238,0.4)' }}>›</span>
            <span style={{ fontSize: '12px', color: '#c9b28f' }}>{label}</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#f7f4ee', marginBottom: '0.75rem' }}>{label}</h1>
          <p style={{ fontSize: '15px', color: 'rgba(247,244,238,0.6)', margin: 0 }}>Evidence-based articles for real men.</p>
        </div>
      </div>

      {/* CATEGORY NAV */}
      <div style={{ borderBottom: '1px solid #ede8df', backgroundColor: '#f7f4ee', padding: '1rem 0' }}>
        <div className="container-content">
          <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {CATS.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase().replace(' ', '-')}`}
                style={{ flexShrink: 0, fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap', paddingBottom: '4px', color: cat.toLowerCase() === slug ? '#0e1a2b' : '#9a9085', borderBottom: cat.toLowerCase() === slug ? '2px solid #c9b28f' : '2px solid transparent' }}>
                {cat}
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
                  <Link href={`/articles/${a.slug}`}>
                    <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', marginBottom: '1rem' }}>
                      <img src={a.image} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </Link>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f' }}>{a.category}</span>
                    <span style={{ fontSize: '11px', color: '#9a9085' }}>{a.readTime}</span>
                  </div>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3, color: '#0e1a2b', marginBottom: '0.5rem' }}>
                    <Link href={`/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                  </h2>
                  <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.55, marginBottom: '0.5rem' }}>{a.excerpt}</p>
                  <p style={{ fontSize: '12px', color: '#9a9085' }}>{a.author}</p>
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
