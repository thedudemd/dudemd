'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function ArticleContent({ article, slug, category, relatedArticles = [] }: { article: any, slug: string, category: string, relatedArticles?: any[] }) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const url = `https://www.dudemd.com/articles/${category}/${slug}`
  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(article.title)

  function copyLink() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user
      if (user && article.id) {
        supabase.from('saved_articles').select('id').eq('user_id', user.id).eq('article_id', article.id).single()
          .then(({ data }) => { if (data) setSaved(true) })
      }
    })
  }, [article.id])

  async function handleSave() {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { setShowLoginPrompt(true); return }
    setSaveLoading(true)
    if (saved) {
      await supabase.from('saved_articles').delete().eq('user_id', user.id).eq('article_id', article.id)
      setSaved(false)
    } else {
      await supabase.from('saved_articles').insert({ user_id: user.id, article_id: article.id })
      setSaved(true)
    }
    setSaveLoading(false)
  }

  useEffect(() => {
    try { fetch('/api/personalization/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_type: 'view', article_slug: slug, category_slug: category }) }) } catch(e) {}
    const checkpoints = { 25: false, 50: false, 75: false, 100: false }
    function onScroll() {
      const el = document.documentElement
      const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
      for (const [depth, fired] of Object.entries(checkpoints)) {
        if (!fired && pct >= Number(depth)) {
          checkpoints[Number(depth)] = true
          try { fetch('/api/personalization/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_type: `scroll_${depth}`, article_slug: slug, category_slug: category }) }) } catch(e) {}
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const start = Date.now()
    function onExit() {
      const seconds = Math.round((Date.now() - start) / 1000)
      if (seconds > 10) {
        try { navigator.sendBeacon('/api/personalization/score', JSON.stringify({ event_type: 'time_on_page', article_slug: slug, category_slug: category, metadata: { seconds } })) } catch(e) {}
      }
    }
    window.addEventListener('beforeunload', onExit)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('beforeunload', onExit) }
  }, [slug, category])

  function LoginPromptModal() {
    if (!showLoginPrompt) return null
    return (
      <div onClick={() => setShowLoginPrompt(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,26,43,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--color-cream)', maxWidth: '400px', width: '100%', padding: '2.5rem 2rem', position: 'relative' }}>
          <button onClick={() => setShowLoginPrompt(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate)', fontSize: '20px', lineHeight: 1, padding: 0 }}>×</button>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.5rem' }}>Save to Your Reading List</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: 1.6, margin: 0 }}>Create a free account to bookmark articles, track your reading history, and get personalized recommendations.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="/join" style={{ display: 'block', textAlign: 'center', padding: '0.875rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Join Free</a>
            <a href="/signin" style={{ display: 'block', textAlign: 'center', padding: '0.875rem', backgroundColor: 'transparent', color: 'var(--color-navy)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid var(--color-navy)' }}>Sign In</a>
          </div>
          <p style={{ fontSize: '11px', color: '#9a9085', textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>No credit card required. Free forever.</p>
        </div>
      </div>
    )
  }

  function RelatedArticles() {
    if (!relatedArticles.length) return null
    return (
      <div style={{ margin: '2.5rem 0', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Read Next</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {relatedArticles.map((a: any, i: number) => (
            <a key={i} href={`/articles/${a.categories?.slug}/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', backgroundColor: '#fff', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              {a.cover_image_url && <img src={a.cover_image_url} alt={a.title} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />}
              <div style={{ padding: '0.875rem' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.35rem' }}>{a.categories?.name}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)', lineHeight: 1.4, margin: 0 }}>{a.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  function Disclaimer() {
    return (
      <div style={{ margin: '2rem 0', padding: '1rem 1.25rem', borderLeft: '3px solid var(--color-gold)', backgroundColor: 'var(--color-cream)', fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--color-navy)' }}>Editorial Disclaimer:</strong> DudeMD content is editorial and informational. It is not medical advice. Always consult a qualified healthcare provider before making changes to your diet, exercise, supplement, or treatment plan.
      </div>
    )
  }

  function ShareBar() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', margin: '1.5rem 0' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>Share</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" title="Share on Facebook" style={{ color: '#9a9085', display: 'flex', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" title="Post on X" style={{ color: '#9a9085', display: 'flex', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram" style={{ color: '#9a9085', display: 'flex', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <button onClick={copyLink} title="Copy Link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: copied ? '#2d7a3a' : '#9a9085', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />
          <button onClick={handleSave} disabled={saveLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: saved ? 'var(--color-gold)' : '#9a9085', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'color 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <LoginPromptModal />
      <ShareBar />
      <div style={{ fontSize: '16px', color: 'var(--color-charcoal)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: article.content || '' }} />
      {article.faq_items && article.faq_items.length > 0 && (
        <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: 'var(--color-cream)', borderRadius: '8px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
          {article.faq_items.map((item: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: idx < article.faq_items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.75rem' }}>{item.question}</h3>
              <p style={{ fontSize: '15px', color: 'var(--color-slate)', lineHeight: 1.7, margin: 0 }}>{item.answer}</p>
            </div>
          ))}
        </div>
      )}
      <ShareBar />
      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: 'var(--color-cream)', borderLeft: '3px solid var(--color-gold)' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>About the Author</p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
          {article.authors?.slug ? (
            <Link href={`/authors/${article.authors.slug}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{article.authors.name}</Link>
          ) : article.authors?.name}
        </p>
        {article.authors?.title && <p style={{ fontSize: '13px', color: '#9a9085', marginBottom: '0.5rem' }}>{article.authors.title}</p>}
        {article.authors?.bio && <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{article.authors.bio}</p>}
        {!article.authors?.bio && <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: 1.6, marginBottom: '0.75rem' }}>Contributing writer at DudeMD.</p>}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {article.authors?.twitter && <a href={article.authors.twitter} target="_blank" rel="noopener noreferrer" title="Twitter / X" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, backgroundColor: '#000', borderRadius: '50%', color: '#fff' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>}
          {article.authors?.instagram && <a href={article.authors.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', borderRadius: '50%', color: '#fff' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>}
          {article.authors?.linkedin && <a href={article.authors.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, backgroundColor: '#0A66C2', borderRadius: '50%', color: '#fff' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>}
          {article.authors?.website && <a href={article.authors.website} target="_blank" rel="noopener noreferrer" title="Website" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, backgroundColor: 'var(--color-gold)', borderRadius: '50%', color: 'var(--color-navy)' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>}
        </div>
      </div>
    </>
  )
}