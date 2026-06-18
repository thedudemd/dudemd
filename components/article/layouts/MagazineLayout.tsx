// @ts-nocheck
import Image from 'next/image'

export default function MagazineLayout({ article, children }: any) {
  return (
    <>
      <div style={{ position: 'relative', width: '100%', minHeight: '520px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', backgroundColor: 'var(--color-navy)' }}>
        <Image src={article.cover_image_url} alt={article.title} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,26,43,0.92) 0%, transparent 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>{article.categories?.name}</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--color-cream)', lineHeight: 1.15, marginBottom: '1rem' }}>{article.title}</h1>
          {article.excerpt && <p style={{ fontSize: '16px', color: 'rgba(247,244,238,0.75)', lineHeight: 1.6 }}>{article.excerpt}</p>}
        </div>
      </div>
      {children}
    </>
  )
}
