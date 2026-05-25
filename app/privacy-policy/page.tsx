import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'DudeMD Privacy Policy - How we collect, use, and protect your information.',
}

export default function PrivacyPolicyPage() {
  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container-content" style={{ maxWidth: '48rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Privacy Policy</h1>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#1B1D21' }}>
          <p style={{ marginBottom: '1.5rem', fontSize: '14px', color: '#9a9085' }}>
            Last updated: May 2025
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Information We Collect</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us. This may include your name, email address, and any other information you choose to provide.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>How We Use Your Information</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We use the information we collect to provide, maintain, and improve our services, send you newsletters and updates, respond to your inquiries, and personalize your experience on DudeMD.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Information Sharing</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We do not sell your personal information. We may share your information with service providers who help us operate our website and deliver our services, subject to confidentiality agreements.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Cookies and Tracking</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We use cookies and similar tracking technologies to analyze trends, administer the website, and gather demographic information. You can control cookies through your browser settings.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Data Security</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Your Rights</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            You have the right to access, correct, or delete your personal information. You may also unsubscribe from our newsletters at any time by clicking the unsubscribe link in any email.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Contact Us</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@dudemd.com" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>privacy@dudemd.com</a>
          </p>
        </div>
      </div>
    </main>
  )
}
