// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
export default function Page() {
  const [subs, setSubs] = useState<any[]>([])
  useEffect(() => { supabase.from('subscribers').select('*').order('created_at', { ascending: false }).then(({ data }) => setSubs(data || [])) }, [])
  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem', maxWidth: '900px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.5rem' }}>Subscribers</h1>
        <p style={{ fontSize: '13px', color: '#9a9085', marginBottom: '2rem' }}>{subs.length} total subscribers</p>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '2px solid #e8e4de', backgroundColor: '#f7f4ee' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>Email</span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>Date</span>
          </div>
          {subs.length === 0 ? <p style={{ padding: '2rem', color: '#9a9085', textAlign: 'center' }}>No subscribers yet.</p> : subs.map((s, i) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: i < subs.length - 1 ? '1px solid #f0ede8' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#0e1a2b' }}>{s.email}</span>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>{new Date(s.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
