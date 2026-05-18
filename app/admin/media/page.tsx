'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function MediaLibrary() {
  const router = useRouter()
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      loadFiles()
    }
    init()
  }, [])

  async function loadFiles() {
    const { data } = await supabase.storage.from('media').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    setFiles(data || [])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(filename, file)
    if (error) alert('Upload failed: ' + error.message)
    else { await loadFiles() }
    setUploading(false)
  }

  async function handleDelete(name: string) {
    if (!confirm('Delete this image?')) return
    await supabase.storage.from('media').remove([name])
    loadFiles()
  }

  function getUrl(name: string) {
    return `https://bicljoujevywrkzjeaoy.supabase.co/storage/v1/object/public/media/${name}`
  }

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  const inp: any = { padding: '0.65rem 1rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee' }}>
      <header style={{ backgroundColor: '#0e1a2b', padding: '1rem 0' }}>
        <div className="container-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/admin" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>← Dashboard</Link>
            <span style={{ color: 'rgba(247,244,238,0.3)' }}>|</span>
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>Media Library</span>
          </div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#0e1a2b', backgroundColor: '#c9b28f', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {uploading ? 'Uploading...' : '+ Upload Image'}
            <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>
      </header>
      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search images..." style={{ ...inp, width: '300px' }} />
        </div>
        {filtered.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#9a9085', textAlign: 'center', padding: '4rem 0' }}>No images yet. Upload your first image above.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {filtered.map(f => (
              <div key={f.name} style={{ backgroundColor: '#fff', border: '1px solid #ede8df', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1', overflow: 'hidden', backgroundColor: '#f0ede8' }}>
                  <img src={getUrl(f.name)} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <p style={{ fontSize: '11px', color: '#4A5563', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => navigator.clipboard.writeText(getUrl(f.name))} style={{ flex: 1, fontSize: '11px', fontWeight: 600, padding: '0.35rem', backgroundColor: '#f7f4ee', border: '1px solid #ede8df', cursor: 'pointer', color: '#0e1a2b' }}>Copy URL</button>
                    <button onClick={() => handleDelete(f.name)} style={{ fontSize: '11px', fontWeight: 600, padding: '0.35rem 0.6rem', backgroundColor: '#fdecea', border: '1px solid #f5c6cb', cursor: 'pointer', color: '#c0392b' }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
