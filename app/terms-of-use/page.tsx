import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'DudeMD Terms of Use - Legal terms and conditions for using our website.',
}

export default function TermsOfUsePage() {
  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container-content" style={{ maxWidth: '48rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Terms of Use</h1>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#1B1D21' }}>
          <p style={{ marginBottom: '1.5rem', fontSize: '14px', color: '#9a9085' }}>
            Last updated: May 2025
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Acceptance of Terms</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            By accessing and using DudeMD, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Use of Content</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            All content on DudeMD, including articles, images, and graphics, is protected by copyright and other intellectual property laws. You may view and print content for personal, non-commercial use only.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Medical Disclaimer</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            The information on DudeMD is for educational and informational purposes only and is not intended as medical advice. Always consult with a qualified healthcare provider before making health decisions or starting any fitness or nutrition program.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>User Conduct</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            You agree not to use DudeMD to post or transmit any unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable content. We reserve the right to remove content and terminate accounts that violate these terms.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Limitation of Liability</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            DudeMD and its affiliates are not liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of our website or reliance on our content.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Changes to Terms</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We reserve the right to modify these Terms of Use at any time. Your continued use of DudeMD after changes are posted constitutes acceptance of the modified terms.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Contact</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            For questions about these Terms of Use, contact us at <a href="mailto:legal@dudemd.com" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>legal@dudemd.com</a>
          </p>
        </div>
      </div>
    </main>
  )
}
