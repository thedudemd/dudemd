import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap', style: ['normal', 'italic'] })
export const metadata: Metadata = {
  title: {
    default: "DudeMD — Modern Men's Wellness for Real Life",
    template: '%s | DudeMD',
  },
  description: "DudeMD is a men's wellness media brand covering the many dimensions of well-being, from health and recovery to mindset, work, money, relationships, and daily life - in a real practical way.",
  metadataBase: new URL('https://www.dudemd.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.dudemd.com',
    siteName: 'DudeMD',
    title: "DudeMD — Modern Men's Wellness for Real Life",
    description: "DudeMD is a men's wellness media brand covering the many dimensions of well-being, from health and recovery to mindset, work, money, relationships, and daily life - in a real practical way.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DudeMD — Modern Men\'s Wellness for Real Life',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@_dudemd',
    creator: '@_dudemd',
    title: "DudeMD — Modern Men's Wellness for Real Life",
    description: "DudeMD is a men's wellness media brand covering the many dimensions of well-being, from health and recovery to mindset, work, money, relationships, and daily life - in a real practical way.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DudeMD",
  "url": "https://www.dudemd.com",
  "logo": "https://www.dudemd.com/og-image.png",
  "sameAs": [
    "https://twitter.com/_dudemd",
    "https://instagram.com/thedudemd_",
    "https://facebook.com/MyDudeMD",
    "https://tiktok.com/@TheDudeMd"
  ],
  "description": "DudeMD is a men's wellness media brand covering the many dimensions of well-being, from health and recovery to mindset, work, money, relationships, and daily life - in a real practical way."
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body style={{ backgroundColor: '#f7f4ee', color: '#0e1a2b' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
