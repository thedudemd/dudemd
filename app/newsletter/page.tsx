import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Subscribe to the DudeMD newsletter for evidence-based men\'s wellness delivered to your inbox.',
}

export default function NewsletterPage() {
  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container-content" style={{ maxWidth: '36rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>
            Men's Wellness That Doesn't Waste Your Time
          </h1>
          
          <p style={{ fontSize: '18px', color: '#4A5563', lineHeight: 1.65, marginBottom: '2rem' }}>
            Evidence-based health, fitness, and lifestyle advice delivered to your inbox. One email per week. No fluff.
          </p>
          
          <div style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '8px', border: '1px solid #ede8df', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '24rem', margin: '0 auto' }}>
              <input 
                type="email" 
                placeholder="your@email.com" 
                style={{ 
                  padding: '0.85rem 1rem', 
                  backgroundColor: '#f7f4ee', 
                  border: '1px solid #ded9d0', 
                  color: '#0e1a2b', 
                  outline: 'none', 
                  fontSize: '15px',
                  borderRadius: '4px'
                }} 
              />
              <button style={{ 
                padding: '0.85rem 1.25rem', 
                backgroundColor: '#0e1a2b', 
                color: '#f7f4ee', 
                fontWeight: 700, 
                fontSize: '13px', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase', 
                border: 'none', 
                cursor: 'pointer',
                borderRadius: '4px'
              }}>
                Subscribe Free
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#9a9085', marginTop: '1rem', marginBottom: 0 }}>
              Unsubscribe anytime. No spam, ever.
            </p>
          </div>
          
          <div style={{ textAlign: 'left', fontSize: '15px', color: '#1B1D21', lineHeight: 1.7 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>
              What You'll Get
            </h2>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Weekly deep dives on health optimization</li>
              <li style={{ marginBottom: '0.5rem' }}>Science-backed fitness and nutrition strategies</li>
              <li style={{ marginBottom: '0.5rem' }}>Recovery protocols that actually work</li>
              <li style={{ marginBottom: '0.5rem' }}>Gear reviews and recommendations</li>
              <li style={{ marginBottom: '0.5rem' }}>Early access to new articles</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
