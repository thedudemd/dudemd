'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function MediaPage() {
  const router = useRouter()
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      await loadFiles()
    }
    load()
  }, [])

  async function loadFiles() {
    setLoading(true)
    // Load files from all folders
    const folders = ['', 'article-images', 'avatars', 'pages']
    let allFiles: any[] = []
    for (const folder of folders) {
      const { data } = await supabase.storage.from('media').list(folder, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })
      if (data) {
        const filesOnly = data.filter(f => f.id) // filter out folders
        allFiles = [...allFiles, ...filesOnly.map(f => ({ ...f, folder }))]
      }
    }
    setFiles(allFiles)
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) { await loadFiles() }
      else { alert('Upload failed: ' + (data.error || 'Unknown error')) }
    } catch (err) { alert('Upload failed') }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(name: string) {
    if (!confirm('Delete this image?')) return
    const path = files.find(f => f.name === name)?.folder ? `${files.find(f => f.name === name).folder}/${name}` : name
    await supabase.storage.from('media').remove([path])
    setFiles(files.filter(f => f.name !== name))
  }

  function getPublicUrl(file: any) {
    const path = file.folder ? `${file.folder}/${file.name}` : file.name
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }

  function copyUrl(file: any) {
    navigator.clipboard.writeText(getPublicUrl(file))
    setCopied(name)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee' }}>
      <header style={{ backgroundColor: '#0e1a2b', padding: '1rem 0' }}>
        <div className="container-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/admin" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>← Dashboard</Link>
            <span style={{ color: 'rgba(247,244,238,0.3)' }}>|</span>
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>Media Library</span>
          </div>
          <div>
            <input ref={fileInputRef} type='file' accept='image/jpeg,image/png,image/webp,image/gif' style={{ display: 'none' }} onChange={handleUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ fontSize: '12px', fontWeight: 700, color: '#0e1a2b', backgroundColor: '#c9b28f', border: 'none', padding: '0.5rem 1.25rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{uploading ? 'Uploading...' : '+ Upload Image'}</button>
          </div>
        </div>
      </header>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {loading ? (
          <p style={{ color: '#9a9085' }}>Loading...</p>
        ) : files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#fff', border: '1px solid #ede8df' }}>
            <p style={{ color: '#9a9085', marginBottom: '1rem' }}>No images uploaded yet.</p>
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Upload your first image</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#9a9085', marginBottom: '1.5rem' }}>{files.length} image{files.length !== 1 ? 's' : ''}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {files.map(file => (
                <div key={file.name} style={{ backgroundColor: '#fff', border: '1px solid #ede8df', overflow: 'hidden' }}>
                  <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#f0ede8' }}>
                    <img src={getPublicUrl(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{ fontSize: '11px', color: '#4A5563', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => copyUrl(file)} style={{ flex: 1, padding: '0.4rem', fontSize: '11px', fontWeight: 700, backgroundColor: copied === file.name ? '#2d7a3a' : '#0e1a2b', color: '#f7f4ee', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{copied === file.name ? 'Copied!' : 'Copy URL'}</button>
                      <button onClick={() => handleDelete(file.name)} style={{ padding: '0.4rem 0.6rem', fontSize: '11px', fontWeight: 700, backgroundColor: '#fff', color: '#c0392b', border: '1px solid #c0392b', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
