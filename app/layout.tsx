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

export default function RootLayout({ children }: