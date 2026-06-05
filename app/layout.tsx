import type { Metadata } from 'next'
// import { GoogleAnalytics } from '@next/third-parties/google'
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
      <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9224150605844856" crossOrigin="anonymous"></script>
          <meta name='facebook-domain-verification' content='at3t423mnp96egxz0gammrzkx46nie' />
          <meta property='fb:app_id' content='2107832130079548' />
        </head>
      <body style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '2107832130079548');
          fbq('track', 'PageView');
        ` }} />
        <noscript dangerouslySetInnerHTML={{ __html: '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=2107832130079548&ev=PageView&noscript=1"/>' }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }}
        />
        <Nav />
        <GoogleOneTap />
        <main className="min-h-screen">{children}</main>
        <Footer />
      {/* <GoogleAnalytics gaId="G-FRVXC9JBB4" /> */}
    </body>
    </html>
  )
}
