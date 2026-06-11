// @ts-nocheck
'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

export default function Page() {
  const [subs, setSubs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase.from('subscribers').select('*').order('created_at', { ascending: false }).then(({ data }) => setSubs(data || []))
  }, [])

  const sources = useMemo(() => {
    const set = new Set<string>()
    subs.forEach(s => { if (s.source) set.add(s.source) })
    return Array.from(set).sort()
  }, [subs])

  const filtered = useMemo(() => {
    let result = [...subs]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(s => s.email?.toLowerCase().includes(q))
    }
    if (sourceFilter !== 'all') {
      result = result.filter(s => s.source === sourceFilter)
    }
    result.sort((a, b) => {
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? db - da : da - db
    })
    return result
  }, [subs, search, sourceFilter, sortOrder])

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected(prev => {
      if (filtered.every(s => prev.has(s.id))) {
        const next = new Set(prev)
        filtered.forEach(s => next.delete(s.id))
        return next
      }
      const next = new Set(prev)
      filtered.forEach(s => next.add(s.id))
      return next
    })
  }

  async function deleteSelected() {
    if (selected.size === 0) return
    if (!confirm(`Remove ${selected.size} subscriber${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) return
    setDeleting(true)
    const ids = Array.from(selected)
    const { error } = await supabase.from('subscribers').delete().in('id', ids)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setSubs(prev => prev.filter(s => !selected.has(s.id)))
      setSelected(new Set())
    }
    setDeleting(false)
  }

  async function deleteOne(id: string) {
    if (!confirm('Remove this subscriber? This cannot be undone.')) return
    const { error } = await supabase.from('subscribers').delete().eq('id', id)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setSubs(prev => prev.filter(s => s.id !== id))
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
    }
  }

  function exportCsv() {
    const rows = [['Email', 'Source', 'Date'], ...filtered.map(s => [s.email || '', s.source || '', new Date(s.created_at).toISOString()])]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const allVisibleSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id))

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem', maxWidth: '1000px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.5rem' }}>Subscribers</h1>
        <p style={{ fontSize: '13px', color: '#9a9085', marginBottom: '1.5rem' }}>{filtered.length} of {subs.length} subscribers{sourceFilter !== 'all' || search ? ' (filtered)' : ''}</p>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' as const }}>
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 220px', padding: '0.6rem 0.85rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
          />
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ padding: '0.6rem 0.85rem', border: '1px solid #e8e4de', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' }}>
            <option value="all">All sources</option>
            {sources.map(src => <option key={src} value={src}>{src}</option>)}
          </select>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')} style={{ padding: '0.6rem 0.85rem', border: '1px solid #e8e4de', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button onClick={exportCsv} disabled={filtered.length === 0} style={{ padding: '0.6rem 1rem', border: '1px solid #0e1a2b', backgroundColor: '#fff', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: filtered.length === 0 ? 'not-allowed' : 'pointer', opacity: filtered.length === 0 ? 0.5 : 1 }}>Export CSV</button>
          {selected.size > 0 && (
            <button onClick={deleteSelected} disabled={deleting} style={{ padding: '0.6rem 1rem', border: '1px solid #c0392b', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
              {deleting ? 'Removing...' : `Remove Selected (${selected.size})`}
            </button>
          )}
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 2fr 1fr 1fr 80px', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '2px solid #e8e4de', backgroundColor: '#f7f4ee', alignItems: 'center' }}>
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>Email</span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>Source</span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>Date</span>
            <span></span>
          </div>
          {filtered.length === 0 ? <p style={{ padding: '2rem', color: '#9a9085', textAlign: 'center' }}>No subscribers found.</p> : filtered.map((s, i) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '32px 2fr 1fr 1fr 80px', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: i < filtered.length - 1 ? '1px solid #f0ede8' : 'none', alignItems: 'center' }}>
              <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} style={{ cursor: 'pointer' }} />
              <span style={{ fontSize: '13px', color: '#0e1a2b' }}>{s.email}</span>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>{s.source || '—'}</span>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>{new Date(s.created_at).toLocaleDateString()}</span>
              <button onClick={() => deleteOne(s.id)} style={{ fontSize: '11px', fontWeight: 700, color: '#c0392b', background: 'none', border: '1px solid #c0392b', padding: '0.3rem 0.6rem', cursor: 'pointer', letterSpacing: '0.04em' }}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
