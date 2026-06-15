'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

const VARIANTS = ['banner', 'inline', 'card']
const CATEGORIES = ['fitness', 'health', 'lifestyle', 'mind', 'recovery', 'grooming', 'nutrition', 'supplements', 'gear', 'finance', 'other']
const empty = { key: '', name: '', category: 'fitness', status: 'active', url: '', tracking_params: '?ref=dudemd&utm_source=dudemd&utm_medium=editorial', button_text: 'Shop Now', headline: '', description: '', variants: ['banner', 'inline', 'card'] }

export default function AffiliatesPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('affiliate_offers').select('*').order('name')
    setOffers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!editing.key || !editing.name || !editing.url || !editing.headline) { setError('Key, Name, URL and Headline are required.'); return }
    setSaving(true); setError('')
    const payload = { ...editing, variants: editing.variants.length ? editing.variants : ['banner'] }
    const { error: err } = editing.id
      ? await supabase.from('affiliate_offers').update(payload).eq('id', editing.id)
      : await supabase.from('affiliate_offers').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    setEditing(null); load()
    setSaving(false)
  }

  async function toggleStatus(offer: any) {
    await supabase.from('affiliate_offers').update({ status: offer.status === 'active' ? 'paused' : 'active' }).eq('id', offer.id)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this offer?')) return
    await supabase.from('affiliate_offers').delete().eq('id', id)
    load()
  }

  function toggleVariant(v: string) {
    const vs = editing.variants || []
    setEditing((e: any) => ({ ...e, variants: vs.includes(v) ? vs.filter((x: string) => x !== v) : [...vs, v] }))
  }

  const inp = { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5563', marginBottom: '0.35rem' }

  return (
    <AdminShell>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>Affiliate Offers</h1>
          <button onClick={() => setEditing({ ...empty })} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>+ New Offer</button>
        </div>

        {loading ? <p style={{ color: '#9a9085' }}>Loading...</p> : offers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9a9085' }}>
            <p style={{ fontSize: '16px', marginBottom: '1rem' }}>No affiliate offers yet.</p>
            <button onClick={() => setEditing({ ...empty })} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Add Your First Offer</button>
          </div>
        ) : (
          <div style={{ border: '1px solid #ede8df', backgroundColor: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7f4ee', borderBottom: '1px solid #ede8df' }}>
                  {['Name', 'Key', 'Category', 'Status', 'Variants', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left' as const, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5563' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {offers.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f0ede8' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0e1a2b' }}>{o.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9a9085', fontFamily: 'monospace', fontSize: '12px' }}>{o.key}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#4A5563' }}>{o.category}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', backgroundColor: o.status === 'active' ? '#e8f5ea' : '#f0ede8', color: o.status === 'active' ? '#2d7a3a' : '#9a9085', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#4A5563', fontSize: '12px' }}>{(o.variants || []).join(', ')}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setEditing({ ...o })} style={{ fontSize: '11px', fontWeight: 700, color: '#0e1a2b', background: 'none', border: '1px solid #ede8df', padding: '3px 10px', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => toggleStatus(o)} style={{ fontSize: '11px', fontWeight: 700, color: o.status === 'active' ? '#d4820a' : '#2d7a3a', background: 'none', border: '1px solid #ede8df', padding: '3px 10px', cursor: 'pointer' }}>{o.status === 'active' ? 'Pause' : 'Activate'}</button>
                        <button onClick={() => remove(o.id)} style={{ fontSize: '11px', fontWeight: 700, color: '#c0392b', background: 'none', border: '1px solid #ede8df', padding: '3px 10px', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editing && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>{editing.id ? 'Edit Offer' : 'New Offer'}</h2>
                <button onClick={() => { setEditing(null); setError('') }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#4A5563' }}>✕</button>
              </div>
              {error && <p style={{ fontSize: '13px', color: '#c0392b', marginBottom: '1rem' }}>{error}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={lbl}>Name *</label><input value={editing.name} onChange={e => setEditing((f: any) => ({ ...f, name: e.target.value }))} style={inp} /></div>
                  <div><label style={lbl}>Key * (unique, no spaces)</label><input value={editing.key} onChange={e => setEditing((f: any) => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} style={inp} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={lbl}>Category</label>
                    <select value={editing.category} onChange={e => setEditing((f: any) => ({ ...f, category: e.target.value }))} style={inp}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Status</label>
                    <select value={editing.status} onChange={e => setEditing((f: any) => ({ ...f, status: e.target.value }))} style={inp}>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                <div><label style={lbl}>Destination URL *</label><input value={editing.url} onChange={e => setEditing((f: any) => ({ ...f, url: e.target.value }))} style={inp} placeholder="https://..." /></div>
                <div><label style={lbl}>Tracking Params</label><input value={editing.tracking_params} onChange={e => setEditing((f: any) => ({ ...f, tracking_params: e.target.value }))} style={inp} placeholder="?ref=dudemd&utm_source=dudemd" /></div>
                <div><label style={lbl}>Headline *</label><input value={editing.headline} onChange={e => setEditing((f: any) => ({ ...f, headline: e.target.value }))} style={inp} /></div>
                <div><label style={lbl}>Description (optional)</label><textarea value={editing.description || ''} onChange={e => setEditing((f: any) => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' as const }} /></div>
                <div><label style={lbl}>Button Text</label><input value={editing.button_text} onChange={e => setEditing((f: any) => ({ ...f, button_text: e.target.value }))} style={inp} /></div>
                <div>
                  <label style={lbl}>Variants</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {VARIANTS.map(v => (
                      <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '13px', color: '#0e1a2b' }}>
                        <input type="checkbox" checked={(editing.variants || []).includes(v)} onChange={() => toggleVariant(v)} style={{ accentColor: '#0e1a2b' }} />
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => { setEditing(null); setError('') }} style={{ flex: 1, padding: '0.75rem', border: '1px solid #ede8df', backgroundColor: '#fff', color: '#4A5563', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={save} disabled={saving} style={{ flex: 2, padding: '0.75rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Offer'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
