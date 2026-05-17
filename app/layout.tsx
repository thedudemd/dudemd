import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap', style: ['normal', 'italic'] })

export const metadata: Metadata = {
  title: { default: "DudeMD — Modern Wellness for Real Life", template: '%s | DudeMD' },
  description: "Evidence-based health, fitness, mental wellness and real life advice for men. DudeMD — Modern Wellness for Real Life.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body style={{ backgroundColor: '#f7f4ee', color: '#0e1a2b' }}>
        <style>{`
          body:has(#admin-page) nav,
          body:has(#admin-page) header:first-of-type,
          body:has(#admin-page) footer {
            display: none !important;
          }
        `}</style>
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}