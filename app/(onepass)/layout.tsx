import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Sign In — DudeMD OnePass',
  description: 'One account. Every DudeMD publication.',
}

export default function OnePassLayout({ children }: { children: React.ReactNode }) {
  return children
}
