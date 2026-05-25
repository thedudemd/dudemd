import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'DudeMD Cookie Policy - How we use cookies and tracking technologies.',
}

export default function CookiePolicyPage() {
  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container-content" style={{ maxWidth: '48rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Cookie Policy</h1>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#1B1D21' }}>
          <p style={{ marginBottom: '1.5rem', fontSize: '14px', color: '#9a9085' }}>
            Last updated: May 2025
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>What Are Cookies</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Cookies are small text files stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Types of Cookies We Use</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Analytics Cookies:</strong> Help us understand how visitors use our site so we can improve it.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Preference Cookies:</strong> Remember your settings and preferences for a better experience.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Managing Cookies</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            You can control and delete cookies through your browser settings. Note that disabling cookies may affect the functionality of DudeMD and other websites you visit.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Third-Party Cookies</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We may use third-party services like Google Analytics that set their own cookies. These services have their own privacy policies and cookie policies.
          </p>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginTop: '2rem', marginBottom: '1rem' }}>Contact Us</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            If you have questions about our use of cookies, contact us at <a href="mailto:privacy@dudemd.com" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>privacy@dudemd.com</a>
          </p>
        </div>
      </div>
    </main>
  )
}
