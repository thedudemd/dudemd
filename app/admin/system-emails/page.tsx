// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import EmailEditor from 'react-email-editor'

const TOKEN_HELP: Record<string, string[]> = {
  newsletter_welcome: ['{{unsubscribe_link}}'],
  email_change_confirm: ['{{confirm_link}}', '{{new_email}}'],
}

export default function SystemEmailsAdmin() {
  const [emails, setEmails] = useState<any[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editorReady, setEditorReady] = useState(false)
  const emailEditorRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      const { data } = await supabase.from('system_emails').select('*').order('label')
      setEmails(data || [])
    }
    load()
  }, [])

  function openEmail(key: string) {
    setActiveKey(key)
    setSaved(false)
    const e = emails.find(x => x.key === key)
    setSubject(e?.subject || '')
    setEditorReady(false)
  }

  function onEditorReady() {
    setEditorReady(true)
    const e = emails.find(x => x.key === activeKey)
    if (e?.design && emailEditorRef.current) {
      emailEditorRef.current.editor.loadDesign(e.design)
    }
  }

  async function handleSave() {
    if (!activeKey || !emailEditorRef.current) return
    if (!subject) { alert('Subject required'); return }
    emailEditorRef.current.editor.exportHtml(async ({ design, html }) => {
      setSaving(true)
      const { error } = await supabase.from('system_emails').update({
        subject, design, html, updated_at: new Date().toISOString()
      }).eq('key', activeKey)
      setSaving(false)
      if (error) { alert('Error: ' + error.message); return }
      setSaved(true)
      setEmails(prev => prev.map(e => e.key === activeKey ? { ...e, subject, design, html } : e))
      setTimeout(() => setSaved(false), 2500)
    })
  }

  const active = emails.find(e => e.key === activeKey)

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem', maxWidth: activeKey ? '1600px' : '1100px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.5rem' }}>System Emails</h1>
        <p style={{ fontSize: '13px', color: '#9a9085', marginBottom: '2rem' }}>Edit the transactional emails sent automatically by the platform.</p>

        {!activeKey && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
            {emails.map((e, i) => (
              <button
                key={e.key}
                onClick={() => openEmail(e.key)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: i < emails.length - 1 ? '1px solid #f0ede8' : 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>{e.label}</p>
                  <p style={{ fontSize: '12px', color: '#9a9085', margin: '0.25rem 0 0' }}>{e.subject}</p>
                </div>
                <span style={{ fontSize: '12px', color: '#9a9085' }}>{e.design ? 'Custom design saved' : 'Using default design'} →</span>
              </button>
            ))}
          </div>
        )}

        {activeKey && active && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap' as const, gap: '1rem' }}>
              <div>
                <button onClick={() => setActiveKey(null)} style={{ fontSize: '12px', color: '#9a9085', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '0.5rem', padding: 0 }}>← Back to System Emails</button>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>{active.label}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {saved && <span style={{ fontSize: '12px', color: '#2d7a3a' }}>✓ Saved</span>}
                <button onClick={handleSave} disabled={saving || !editorReady} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5563', marginBottom: '0.5rem' }}>Subject Line</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', maxWidth: '500px', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>

            {TOKEN_HELP[activeKey] && (
              <div style={{ backgroundColor: '#fef3e2', border: '1px solid #f0d9a8', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', fontSize: '12px', color: '#4A5563' }}>
                <strong>Available placeholders</strong> — type these as plain text anywhere in the design; they'll be automatically replaced when the email is sent: {TOKEN_HELP[activeKey].map(t => <code key={t} style={{ backgroundColor: '#fff', padding: '2px 6px', marginLeft: '0.4rem', borderRadius: 3, border: '1px solid #e8e4de' }}>{t}</code>)}
              </div>
            )}

            <div style={{ border: '1px solid #e8e4de' }}>
              <EmailEditor
                ref={emailEditorRef}
                minHeight={600}
                onReady={onEditorReady}
                options={{
                  appearance: { theme: 'light', panels: { tools: { dock: 'left' } } },
                  features: { preview: true },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
