import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Nav from '@/components/layout/Nav'
import GoogleOneTap from '@/components/auth/GoogleOneTap'
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
    url: 'https://www.dudemd.com',
    locale: 'en_US',
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
  other: {
    'fb:page_id': '849615384891054',
    'fb:app_id': '2107832130079548',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mydudemd',
    creator: '@mydudemd',
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
    "https://twitter.com/mydudemd",
    "https://instagram.com/mydudemd",
    "https://facebook.com/MyDudeMD",
    "https://tiktok.com/@TheDudeMd"
  ],
  "description": "DudeMD is a men's wellness media brand covering the many dimensions of well-being, from health and recovery to mindset, work, money, relationships, and daily life - in a real practical way."
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "DudeMD",
  "url": "https://www.dudemd.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.dudemd.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head><meta name='facebook-domain-verification' content='at3t423mnp96egxz0gammrzkx46nie' /></head>
      <body style={{ backgroundColor: '#f7f4ee', color: '#0e1a2b' }}>
        <script dangerouslySetInnerHTML={{ __html: `
          fbq('init', '214618978894432');
          fbq('track', 'PageView');
        ` }} />
        <noscript dangerouslySetInnerHTML={{ __html: '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=214618978894432&ev=PageView&noscript=1"/>' }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }}
        />
        <Nav />
        <GoogleOneTap />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
