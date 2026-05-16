import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: "DudeMD — Men's Wellness For Real Life" }

const FEATURED = {
  slug: 'the-testosterone-guide',
  category: 'Health',
  title: 'The Complete Testosterone Guide for Men Over 30',
  excerpt: "What the numbers actually mean, what moves the needle, and what your doctor probably won't tell you.",
  author: 'Dr. James Mercer',
  readTime: '9 min read',
  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80'
}

const LATEST = [
  { slug: 'sleep-recovery', category: 'Recovery', title: 'The 7-Day Sleep Reset That Actually Works', excerpt: 'Evidence-backed habits that recalibrate your sleep in one week.', author: 'Marcus Reid', readTime: '6 min read', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80' },
  { slug: 'strength-40s', category: 'Fitness', title: "Strength Training in Your 40s: What Changes and What Doesn't", excerpt: 'The science of muscle after 40.', author: 'Coach T. Williams', readTime: '8 min read', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
  { slug: 'stress-cortisol', category: 'Health', title: 'Chronic Stress Is Wrecking Your Hormones', excerpt: 'Cortisol, testosterone, and the feedback loop most men never hear about.', author: 'Dr. Sarah Okonkwo', readTime: '7 min read', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80' },
  { slug: 'grooming-routine', category: 'Style', title: "A No-Nonsense Grooming Routine for Men Who Don't Have Time", excerpt: 'Four products, ten minutes, done.', author: 'DudeMD Staff', readTime: '4 min read', image: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=600&q=80' },
  { slug: 'gut-health', category: 'Health', title: 'Your Gut Is Running Your Brain. Here\'s How to Fix It', excerpt: 'The microbiome research every man should know.', author: 'Dr. James Mercer', readTime: '6 min read', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80' },
  { slug: 'cold-exposure', category: 'Recovery', title: 'Cold Exposure: Separating the Hype From the Science', excerpt: 'What cold plunges actually do — and don\'t do — for your body.', author: 'Marcus Reid', readTime: '5 min read', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80' },
]

const EDITORS_PICKS = [
  { slug: 'protein-guide', category: 'Fitness', title: 'How Much Protein Do You Actually Need?', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80' },
  { slug: 'mental-health-men', category: 'Mental Health', title: 'Why Men Don\'t Talk About Mental Health — And What It\'s Costing Them', image: 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=600&q=80' },
  { slug: 'gear-essentials', category: 'Gear', title: 'The 10 Gear Essentials Every Man Should Own in 2025', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
]

const CATS = ['Health', 'Fitness', 'Recovery', 'Mental Health', 'Style', 'Gear']

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section style={{ borderBottom: '1px solid #ede8df' }}>
        <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            <div style={{ position: 'relative' }}>
              <Link href={`/articles/${FEATURED.slug}`}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', overflow: 'hidden' }}>
                  <img src={FEATURED.image} alt={FEATURED.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,26,43,0.7) 0%, transparent 60%)' }} />
                  <span style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f7f4ee', backgroundColor: '#c9b28f', padding: '0.25rem 0.6rem' }}>{FEATURED.category}</span>
                </div>
              </Link>
              <div style={{ paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '11px', color: '#9a9085', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{FEATURED.readTime} — {FEATURED.author}</p>
                <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.15, color: '#0e1a2b', marginBottom: '0.75rem' }}>
                  <Link href={`/articles/${FEATURED.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{FEATURED.title}</Link>
                </h1>
                <p style={{ fontSize: '15px', color: '#4A5563', lineHeight: 1.65 }}>{FEATURED.excerpt}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', borderBottom: '1px solid #ede8df', paddingBottom: '0.5rem' }}>Editor&apos;s Picks</p>
              {EDITORS_PICKS.map((a) => (
                <Link key={a.slug} href={`/articles/${a.slug}`} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', textDecoration: 'none', alignItems: 'start' }}>
                  <img src={a.image} alt={a.title} style={{ width: '80px', height: '60px', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.3rem' }}>{a.category}</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.3 }}>{a.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY RIBBON */}
      <section style={{ borderBottom: '1px solid #ede8df', padding: '1rem 0', backgroundColor: '#f7f4ee' }}>
        <div className="container-content">
          <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', alignItems: 'center', paddingBottom: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', flexShrink: 0 }}>Browse</span>
            <div style={{ width: '1px', height: '14px', backgroundColor: '#ede8df', flexShrink: 0 }} />
            {CATS.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase().replace(' ', '-')}`} style={{ flexShrink: 0, fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0e1a2b', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {cat}
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
            {LATEST.map((a) => (
              <article key={a.slug}>
                <Link href={`/articles/${a.slug}`}>
                  <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img src={a.image} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')} />
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f' }}>{a.category}</span>
                  <span style={{ fontSize: '11px', color: '#9a9085' }}>{a.readTime}</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: '#0e1a2b', marginBottom: '0.5rem' }}>
                  <Link href={`/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                </h3>
                <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.55, marginBottom: '0.5rem' }}>{a.excerpt}</p>
                <p style={{ fontSize: '12px', color: '#9a9085' }}>{a.author}</p>
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
