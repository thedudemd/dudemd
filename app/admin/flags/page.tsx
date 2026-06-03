// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

const TABS = ['All', 'Coming Soon', 'Reader Hub', 'Community', 'AI']

export default function FlagsPage() {
  const [flags, setFlags] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    supabase.from('feature_flags').select('*').order('category').then(({ data }) => setFlags(data || []))
  }, [])

  async function toggle(key: string, current: boolean) {
    setFlags(flags.map(f => f.key === key ? { ...f, enabled: !current } : f))
    await supabase.from('feature_flags').update({ enabled: !current }).eq('key', key)
  }

  const visible = activeTab === 'All' ? flags : flags.filter(f => f.category === activeTab)
  const activeCount = flags.filter(f => f.enabled).length

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem', maxWidth: '1100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', margin: 0, marginBottom: '0.25rem' }}>Feature Controls</h1>
            <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>Enable or disable platform features</p>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '0.75rem 1.25rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0e1a2b', fontFamily: 'Georgia, serif', margin: 0 }}>{activeCount}<span style={{ fontSize: '12px', fontWeight: 400, color: '#9a9085', fontFamily: 'system-ui' }}>/{flags.length}</span></p>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9085', margin: '0.25rem 0 0' }}>Active</p>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #e8e4de' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.6rem 1.25rem', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#c9b28f' : 'transparent'}`, cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: activeTab === tab ? '#0e1a2b' : '#9a9085', marginBottom: '-1px', whiteSpace: 'nowrap' }}>
              {tab}
              {tab !== 'All' && (
                <span style={{ marginLeft: '0.4rem', fontSize: '11px', color: '#9a9085' }}>
                  ({flags.filter(f => f.category === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9a9085', fontSize: '14px' }}>No flags in this category.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
            {visible.map(flag => (
              <div key={flag.key} style={{ backgroundColor: '#fff', border: `1px solid ${flag.enabled ? '#d4e8d6' : '#e8e4de'}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', margin: 0 }}>{flag.label}</p>
                    {flag.category === 'Coming Soon' && (
                      <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', backgroundColor: '#f0ede8', color: '#9a9085', padding: '2px 6px' }}>Soon</span>
                    )}
                    {flag.enabled && (
                      <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', backgroundColor: '#d4e8d6', color: '#2d7a3a', padding: '2px 6px' }}>Live</span>
                    )}
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#9a9085', margin: 0 }}>{flag.description}</p>
                  <p style={{ fontSize: '10px', color: '#c9b28f', margin: '0.35rem 0 0', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{flag.category}</p>
                </div>
                <button onClick={() => toggle(flag.key, flag.enabled)} style={{ width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', backgroundColor: flag.enabled ? '#c9b28f' : '#ddd8d0', position: 'relative', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: '3px', left: flag.enabled ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}