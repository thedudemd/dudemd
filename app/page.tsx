import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: "DudeMD — Men's Wellness For Real Life" }

const FEATURED = { slug: 'the-testosterone-guide', category: 'Health', title: 'The Complete Testosterone Guide for Men Over 30', excerpt: "What the numbers actually mean, what moves the needle, and what your doctor probably won't tell you.", author: 'Dr. James Mercer', readTime: '9 min read' }

const ARTICLES = [
  { slug: 'sleep-recovery', category: 'Recovery', title: 'The 7-Day Sleep Reset That Actually Works', excerpt: 'Evidence-backed habits that recalibrate your sleep in one week.', author: 'Marcus Reid', readTime: '6 min read' },
  { slug: 'strength-40s', category: 'Fitness', title: "Strength Training in Your 40s: What Changes and What Doesn't", excerpt: 'The science of muscle after 40.', author: 'Coach T. Williams', readTime: '8 min read' },
  { slug: 'stress-cortisol', category: 'Mental Health', title: "Chronic Stress Is Wrecking Your Hormones.", excerpt: 'Cortisol, testosterone, and the feedback loop most men never hear about.', author: 'Dr. Sarah Okonkwo', readTime: '7 min read' },
  { slug: 'grooming-routine', category: 'Style', title: "A No-Nonsense Grooming Routine for Men Who Don't Have Time", excerpt: 'Four products, ten minutes, done.', author: 'DudeMD Staff', readTime: '4 min read' },
]

const CATS = ['Health','Fitness','Recovery','Mental Health','Style','Gear']

export default function HomePage() {
  return (
    <>
      <section style={{ borderBottom: '1px solid #ede8df' }}>
        <div className="container-content" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            <article>
              <Link href={`/articles/${FEATURED.slug}`}>
                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#ede8df', marginBottom: '1.25rem' }} />
              </Link>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <span className="label">{FEATURED.category}</span>
                <span style={{ fontSize: '11px', color: '#9a9085' }}>{FEATURED.readTime}</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: 1.2, color: '#0e1a2b', marginBottom: '0.75rem' }}>
                <Link href={`/articles/${FEATURED.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{FEATURED.title}</Link>
              </h1>
              <p style={{ fontSize: '15px', color: '#4A5563', lineHeight: 1.6, marginBottom: '1rem' }}>{FEATURED.excerpt}</p>
              <p style={{ fontSize: '12px', color: '#9a9085' }}>{FEATURED.author}</p>
            </article>
          </div>
        </div>
      </section>

      <section style={{ borderBottom: '1px solid #ede8df', padding: '1.5rem 0' }}>
        <div className="container-content">
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', flexShrink: 0 }}>Browse</span>
            <div style={{ width: '1px', height: '1rem', backgroundColor: '#ede8df', flexShrink: 0, alignSelf: 'center' }} />
            {CATS.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase().replace(' ', '-')}`} style={{ flexShrink: 0, fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0e1a2b', border: '1px solid #0e1a2b', padding: '0.5rem 1rem', textDecoration: 'none' }}>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '3rem 0', borderBottom: '1px solid #ede8df' }}>
        <div className="container-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: '#0e1a2b' }}>Latest</h2>
            <Link href="/articles" className="label" style={{ color: '#c9b28f', textDecoration: 'none' }}>All Articles</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
            {ARTICLES.map((a) => (
              <article key={a.slug}>
                <Link href={`/articles/${a.slug}`}>
                  <div style={{ width: '100%', aspectRatio: '4/3', backgroundColor: '#ede8df', marginBottom: '1rem' }} />
                </Link>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className="label">{a.category}</span>
                  <span style={{ fontSize: '11px', color: '#9a9085' }}>{a.readTime}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: '#0e1a2b', marginBottom: '0.5rem' }}>
                  <Link href={`/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                </h3>
                <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.5 }}>{a.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#0e1a2b', color: '#f7f4ee', padding: '4rem 0' }}>
        <div className="container-content">
          <div style={{ maxWidth: '32rem', margin: '0 auto', textAlign: 'center' }}>
            <span className="label" style={{ color: '#c9b28f', display: 'block', marginBottom: '0.75rem' }}>Free Newsletter</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#f7f4ee', marginBottom: '1rem', lineHeight: 1.2 }}>
              Men&apos;s health that doesn&apos;t waste your time.
            </h2>
            <p style={{ fontSize: '14px', color: '#9a9085', marginBottom: '2rem', lineHeight: 1.6 }}>Evidence-based, experience-tested. One email per week.</p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '28rem', margin: '0 auto' }}>
              <input type="email" placeholder="your@email.com" style={{ flex: 1, padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#f7f4ee', outline: 'none' }} />
              <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 600, fontSize: '13px', letterSpacing: '0.05em', border: 'none', cursor: 'pointer' }}>Join</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
