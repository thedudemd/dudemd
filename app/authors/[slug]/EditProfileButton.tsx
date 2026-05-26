'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase-auth'

export default function EditProfileButton({ authorId }: { authorId: string }) {
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      // Check if logged in user is this author
      const { data } = await supabase.from('authors').select('id').eq('id', authorId).eq('user_id', session.user.id).single()
      if (data) setShow(true)
      // Also allow admins
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role === 'admin' || profile?.role === 'super_admin') setShow(true)
    }
    check()
  }, [authorId])

  async function loadForm() {
    const supabase = createClient()
    const { data } = await supabase.from('authors').select('*').eq('id', authorId).single()
    setForm(data)
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('authors').update({
      bio: form.bio, avatar_url: form.avatar_url, title: form.title,
      twitter: form.twitter, instagram: form.instagram, linkedin: form.linkedin, website: form.website
    }).eq('id', authorId)
    if (error) { alert(error.message); setSaving(false); return }
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  if (!show) return null

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit', marginBottom: '0.75rem' }

  return (
    <>
      <button onClick={loadForm} style={{ padding: '0.5rem 1.25rem', backgroundColor: 'rgba(247,244,238,0.1)', border: '1px solid rgba(247,244,238,0.3)', color: '#f7f4ee', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', marginTop: '1rem' }}>
        Edit Profile
      </button>

      {editing && form && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#0e1a2b' }}>Edit Profile</h2>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9a9085' }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', display: 'block', marginBottom: '0.25rem' }}>Title / Role</label>
              <input style={inp} value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Senior Health Editor" />
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', display: 'block', marginBottom: '0.25rem' }}>Bio</label>
              <textarea style={{...inp, minHeight: '120px', resize: 'vertical'}} value={form.bio || ''} onChange={e => setForm({...form, bio: e.target.value})} />
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', display: 'block', marginBottom: '0.25rem' }}>Avatar URL</label>
              <input style={inp} value={form.avatar_url || ''} onChange={e => setForm({...form, avatar_url: e.target.value})} placeholder="https://..." />
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', display: 'block', marginBottom: '0.25rem' }}>Twitter / X</label>
              <input style={inp} value={form.twitter || ''} onChange={e => setForm({...form, twitter: e.target.value})} placeholder="https://x.com/username" />
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', display: 'block', marginBottom: '0.25rem' }}>Instagram</label>
              <input style={inp} value={form.instagram || ''} onChange={e => setForm({...form, instagram: e.target.value})} placeholder="https://instagram.com/username" />
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', display: 'block', marginBottom: '0.25rem' }}>LinkedIn</label>
              <input style={inp} value={form.linkedin || ''} onChange={e => setForm({...form, linkedin: e.target.value})} placeholder="https://linkedin.com/in/username" />
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', display: 'block', marginBottom: '0.25rem' }}>Website</label>
              <input style={inp} value={form.website || ''} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://..." />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditing(false)} style={{ padding: '0.75rem 1.25rem', border: '1px solid #ede8df', backgroundColor: '#fff', color: '#0e1a2b', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '0.75rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
