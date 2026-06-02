// @ts-nocheck
export default function LongFormLayout({ article, children }: any) {
  return (
    <>
      <div style={{ backgroundColor: 'var(--color-navy)', padding: '4rem 2rem 3rem' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>{article.categories?.name}</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, color: 'var(--color-cream)', lineHeight: 1.2, marginBottom: '1.25rem' }}>{article.title}</h1>
          {article.excerpt && <p style={{ fontSize: '18px', color: 'rgba(247,244,238,0.7)', lineHeight: 1.7, fontStyle: 'italic' }}>{article.excerpt}</p>}
        </div>
      </div>
      {article.cover_image_url && <div style={{ width: '100%', overflow: 'hidden', maxHeight: '500px' }}><img src={article.cover_image_url} alt={article.title} style={{ width: '100%', objectFit: 'cover' }} /></div>}
      {children}
    </>
  )
}
