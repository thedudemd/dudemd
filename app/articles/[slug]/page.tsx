import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Article — DudeMD' }

const RELATED = [
  { slug: 'sleep-recovery', category: 'Recovery', title: 'The 7-Day Sleep Reset That Actually Works', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80' },
  { slug: 'strength-40s', category: 'Fitness', title: "Strength Training in Your 40s: What Changes and What Doesn't", image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
  { slug: 'stress-cortisol', category: 'Health', title: 'Chronic Stress Is Wrecking Your Hormones', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80' },
]

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <main>
      <style>{`
        .article-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
       
        @media (min-width: 900px) {
          .article-grid { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 4rem; }
          .article-sidebar { order: 0; position: sticky; top: 6rem; }
        }
      `}</style>

      {/* HERO */}
      <div style={{ width: '100%', overflow: 'hidden', maxHeight: '520px' }}>
        <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80" alt="Article hero" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="article-grid" style={{ alignItems: 'start' }}>

          {/* MAIN CONTENT */}
          <article>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>Home</Link>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>›</span>
              <Link href="/category/health" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>Health</Link>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>›</span>
              <span style={{ fontSize: '12px', color: '#4A5563' }}>Testosterone Guide</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>Health</span>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>9 min read</span>
            </div>

            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.15, color: '#0e1a2b', marginBottom: '1.25rem' }}>
              The Complete Testosterone Guide for Men Over 30
            </h1>

            <p style={{ fontSize: '18px', color: '#4A5563', lineHeight: 1.65, marginBottom: '1.5rem', fontStyle: 'italic', borderLeft: '3px solid #c9b28f', paddingLeft: '1rem' }}>
              What the numbers actually mean, what moves the needle, and what your doctor probably won&apos;t tell you.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #ede8df', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0e1a2b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#c9b28f' }}>JM</span>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0e1a2b', margin: 0 }}>Dr. James Mercer</p>
                <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>May 15, 2026 · Medically reviewed</p>
              </div>
            </div>

            <div style={{ fontSize: '16px', color: '#1B1D21', lineHeight: 1.8 }}>
              <p style={{ marginBottom: '1.5rem' }}>Testosterone is the most talked-about hormone in men&apos;s health — and also the most misunderstood. Most men only hear about it when something goes wrong. But understanding how testosterone actually works, what affects it, and what you can do about it is one of the highest-leverage things you can do for your long-term health.</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', marginTop: '2.5rem' }}>What is a "normal" testosterone level?</h2>
              <p style={{ marginBottom: '1.5rem' }}>The standard lab reference range is roughly 300–1000 ng/dL. But that range is so wide it&apos;s nearly useless. A 35-year-old man at 310 ng/dL is technically "normal" but will likely feel terrible. Context matters more than the number alone.</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', marginTop: '2.5rem' }}>What actually moves the needle</h2>
              <p style={{ marginBottom: '1.5rem' }}>Before you consider any medical intervention, there are four lifestyle factors that have strong evidence behind them: sleep quality, resistance training, body composition, and stress management. Most men who optimize these four things see meaningful improvements in how they feel — and often in their labs.</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', marginTop: '2.5rem' }}>When to talk to your doctor</h2>
              <p style={{ marginBottom: '1.5rem' }}>If you&apos;ve dialed in your sleep, training, and nutrition and still feel off — fatigue, low libido, brain fog, mood changes — it&apos;s worth getting a full hormone panel, not just total testosterone. Ask for free testosterone, SHBG, LH, FSH, and estradiol at minimum.</p>
            </div>

            <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f7f4ee', borderLeft: '3px solid #c9b28f' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>About the Author</p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.25rem' }}>Dr. James Mercer</p>
              <p style={{ fontSize: '14px', color: '#4A5563', lineHeight: 1.6, margin: 0 }}>Board-certified internist with 15 years of experience in men&apos;s health and preventive medicine.</p>
            </div>
          </article>

          {/* SIDEBAR */}
          <aside className="article-sidebar">
            <div style={{ backgroundColor: '#0e1a2b', padding: '1.5rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.5rem' }}>Free Newsletter</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#f7f4ee', lineHeight: 1.3, marginBottom: '1rem' }}>Men&apos;s health that doesn&apos;t waste your time.</p>
              <input type="email" placeholder="your@email.com" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f7f4ee', outline: 'none', fontSize: '14px', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
              <button style={{ width: '100%', padding: '0.75rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Join Free</button>
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', borderBottom: '1px solid #ede8df', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Related Articles</p>
              {RELATED.map((a) => (
                <Link key={a.slug} href={`/articles/${a.slug}`} style={{ display: 'flex', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.25rem', alignItems: 'start' }}>
                  <img src={a.image} alt={a.title} style={{ width: '72px', height: '54px', objectFit: 'cover', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.25rem' }}>{a.category}</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.3, margin: 0 }}>{a.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

        </div>
      </div>

      {/* BOTTOM RELATED */}
      <section style={{ borderTop: '1px solid #ede8df', padding: '3rem 0', backgroundColor: '#f7f4ee' }}>
        <div className="container-content">
          <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.25rem', color: '#0e1a2b', marginBottom: '2rem' }}>More to Read</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
            {RELATED.map((a) => (
              <article key={a.slug}>
                <Link href={`/articles/${a.slug}`}>
                  <img src={a.image} alt={a.title} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block', marginBottom: '1rem' }} />
                </Link>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f' }}>{a.category}</span>
                <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: '#0e1a2b', marginTop: '0.4rem' }}>
                  <Link href={`/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
