'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

export default function FlagsPage() {
  const [flags, setFlags] = useState<any[]>([])

  useEffect(() => {
    supabase.from('feature_flags').select('*').order('category').then(({ data }) => setFlags(data || []))
  }, [])

  async function toggle(key: string, current: boolean) {
    setFlags(flags.map(f => f.key === key ? { ...f, enabled: !current } : f))
    await supabase.from('feature_flags').update({ enabled: !current }).eq('key', key)
  }

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem', maxWidth: '1100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', margin: 0, marginBottom: '0.25rem' }}>Feature Flags</h1>
            <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>Enable or disable platform features</p>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '0.75rem 1.25rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0e1a2b', fontFamily: 'Georgia, serif', margin: 0 }}>{flags.filter(f => f.enabled).length}<span style={{ fontSize: '12px', fontWeight: 400, color: '#9a9085', fontFamily: 'system-ui' }}>/{flags.length}</span></p>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9085', margin: '0.25rem 0 0' }}>Active</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
          {flags.map(flag => (
            <div key={flag.key} style={{ backgroundColor: '#fff', border: `1px solid ${flag.enabled ? '#d4e8d6' : '#e8e4de'}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', margin: 0, marginBottom: '0.25rem' }}>{flag.label}</p>
                <p style={{ fontSize: '11.5px', color: '#9a9085', margin: 0 }}>{flag.description}</p>
              </div>
              <button onClick={() => toggle(flag.key, flag.enabled)} style={{ width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', backgroundColor: flag.enabled ? '#c9b28f' : '#ddd8d0', position: 'relative', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: '3px', left: flag.enabled ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
