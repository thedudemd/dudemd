import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap', style: ['normal', 'italic'] })

export const metadata: Metadata = {
  title: {
    default: "DudeMD — Modern Wellness for Real Life",
    template: '%s | DudeMD',
  },
  description: "DudeMD covers health, fitness, recovery, style, gear, and performance for real men.",
  metadataBase: new URL('https://www.dudemd.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dudemd.com',
    siteName: 'DudeMD',
    title: 'DudeMD — Modern Wellness for Real Life',
    description: 'Health. Recovery. Performance. Style. Built for real life.',
    images: [
      {
        url: '/IMG_5432-removebg-preview%20(1).png',
        width: 1200,
        height: 630,
        alt: 'DudeMD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@_dudemd',
    creator: '@_dudemd',
    title: 'DudeMD — Modern Wellness for Real Life',
    description: 'Health. Recovery. Performance. Style. Built for real life.',
    images: ['/IMG_5432-removebg-preview%20(1).png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body style={{ backgroundColor: '#f7f4ee', color: '#0e1a2b' }}>
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
