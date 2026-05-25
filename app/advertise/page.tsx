import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Advertise',
  description: 'Partner with DudeMD to reach an engaged audience of men interested in wellness, fitness, and lifestyle.',
}

export default function AdvertisePage() {
  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container-content" style={{ maxWidth: '48rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Advertise with DudeMD</h1>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#1B1D21' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            DudeMD reaches an engaged audience of men who care about optimizing their health, fitness, recovery, and lifestyle. Our readers are decision-makers looking for products and services that deliver real results.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Advertising Opportunities</h2>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Display advertising</li>
            <li style={{ marginBottom: '0.5rem' }}>Sponsored content</li>
            <li style={{ marginBottom: '0.5rem' }}>Newsletter sponsorships</li>
            <li style={{ marginBottom: '0.5rem' }}>Product reviews</li>
          </ul>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Get in Touch</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            For advertising inquiries and media kits, contact us at <a href="mailto:advertising@dudemd.com" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>advertising@dudemd.com</a>
          </p>
        </div>
      </div>
    </main>
  )
}
