import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'DudeMD Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', backgroundColor: '#f7f4ee' }}>
      {children}
    </div>
  )
}