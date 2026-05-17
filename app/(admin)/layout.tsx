import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = { title: 'DudeMD Admin' }

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ backgroundColor: '#f7f4ee', color: '#0e1a2b', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
