// @ts-nocheck
export default function LegalPage({ params }) {
  const title = params.page.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#0e1a2b', marginBottom: '1rem' }}>{title}</h1>
      <p style={{ color: '#4A5563', lineHeight: 1.8 }}>This page is coming soon. For questions, contact us at hello@dudemd.com.</p>
    </div>
  )
}
