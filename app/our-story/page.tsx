import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Learn about DudeMD and our mission to deliver evidence-based men\'s wellness content.',
}

export default function OurStoryPage() {
  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container-content" style={{ maxWidth: '48rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Our Story</h1>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#1B1D21' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            DudeMD started with a simple observation: most men's health content either talked down to guys or was buried in medical jargon. We knew there had to be a better way.
          </p>
          
          <p style={{ marginBottom: '1.5rem' }}>
            Founded in Seattle, DudeMD is a men's wellness media brand built on one principle: give real men actionable, evidence-based information they can actually use. No fluff. No pseudoscience. Just straight talk about health, fitness, recovery, style, and living better.
          </p>
          
          <p style={{ marginBottom: '1.5rem' }}>
            We cover testosterone optimization, strength training, mental health, sleep science, grooming, gear, and everything in between—because modern wellness isn't one-dimensional.
          </p>
          
          <p style={{ marginBottom: '1.5rem' }}>
            Every article is researched, fact-checked, and written for men who want to optimize their lives without wasting time on content that doesn't deliver.
          </p>
          
          <p style={{ fontWeight: 600, color: '#0e1a2b' }}>
            Media for Men. Built Different.
          </p>
        </div>
      </div>
    </main>
  )
}
