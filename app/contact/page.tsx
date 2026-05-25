import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the DudeMD team.',
}

export default function ContactPage() {
  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container-content" style={{ maxWidth: '48rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Contact Us</h1>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#1B1D21' }}>
          <p style={{ marginBottom: '2rem' }}>
            Have a question, feedback, or story idea? We'd love to hear from you.
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.5rem' }}>Email</h2>
            <p><a href="mailto:hello@dudemd.com" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>hello@dudemd.com</a></p>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.5rem' }}>Social Media</h2>
            <p style={{ marginBottom: '0.5rem' }}>Instagram: <a href="https://instagram.com/mydudemd" target="_blank" rel="noopener noreferrer" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>@thedudemd_</a></p>
            <p style={{ marginBottom: '0.5rem' }}>X (Twitter): <a href="https://twitter.com/mydudemd" target="_blank" rel="noopener noreferrer" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>@_dudemd</a></p>
            <p style={{ marginBottom: '0.5rem' }}>Facebook: <a href="https://facebook.com/MyDudeMD" target="_blank" rel="noopener noreferrer" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>@MyDudeMD</a></p>
            <p>TikTok: <a href="https://tiktok.com/@TheDudeMd" target="_blank" rel="noopener noreferrer" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>@TheDudeMd</a></p>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.5rem' }}>Press Inquiries</h2>
            <p><a href="mailto:press@dudemd.com" style={{ color: '#c9b28f', textDecoration: 'none', fontWeight: 600 }}>press@dudemd.com</a></p>
          </div>
        </div>
      </div>
    </main>
  )
}
