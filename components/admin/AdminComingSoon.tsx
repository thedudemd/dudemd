import AdminShell from './AdminShell'
import Link from 'next/link'

interface Props {
  title: string
  description: string
  session?: string
  features?: string[]
}

export default function AdminComingSoon({ title, description, session, features }: Props) {
  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem', maxWidth: '800px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', margin: 0, marginBottom: '0.375rem' }}>{title}</h1>
        <p style={{ fontSize: '13px', color: '#9a9085', margin: '0 0 2.5rem' }}>{description}</p>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#f7f4ee', border: '1px solid #e8e4de', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '20px' }}>
            ◈
          </div>
          <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.5rem' }}>
            {session ? `Coming ${session}` : 'Coming Soon'}
          </p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.75rem', fontFamily: 'Georgia, serif' }}>{title} is in development</p>
          <p style={{ fontSize: '13px', color: '#9a9085', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>{description}</p>

          {features && features.length > 0 && (
            <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '360px', margin: '2rem auto 0' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.75rem' }}>Planned Features</p>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.4rem 0', borderBottom: '1px solid #f0ede8' }}>
                  <span style={{ fontSize: '10px', color: '#c9b28f' }}>◆</span>
                  <span style={{ fontSize: '12.5px', color: '#4A5563' }}>{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/admin" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none', fontWeight: 500 }}>← Back to Dashboard</Link>
        </div>
      </div>
    </AdminShell>
  )
}
