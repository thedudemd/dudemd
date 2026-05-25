import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description: 'DudeMD\'s editorial standards, fact-checking process, and commitment to evidence-based content.',
}

export default function EditorialPolicyPage() {
  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container-content" style={{ maxWidth: '48rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Editorial Policy</h1>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#1B1D21' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Our Standards</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            DudeMD is committed to publishing accurate, evidence-based content that serves our readers' best interests. Every article goes through a rigorous editorial process.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Fact-Checking Process</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            All health and medical claims are verified against peer-reviewed research, medical journals, and reputable health organizations. We cite our sources and link to original research whenever possible.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Author Credentials</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Our contributors include health journalists, certified trainers, registered dietitians, and medical professionals. Author credentials are displayed on every article.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Corrections Policy</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We take accuracy seriously. If we publish incorrect information, we correct it promptly and transparently. Corrections are noted at the top of the article with the date of the update.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Advertising Disclosure</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            DudeMD maintains editorial independence. Advertising and sponsorships do not influence our editorial content. All sponsored content is clearly labeled.
          </p>
          
          <p style={{ marginTop: '2rem', fontSize: '14px', color: '#9a9085' }}>
            Last updated: May 2025
          </p>
        </div>
      </div>
    </main>
  )
}
