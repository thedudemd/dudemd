'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function ArticleContent({ article, slug, category, relatedArticles = [] }: { article: any, slug: string, category: string, relatedArticles?: any[] }) {
  const [copied, setCopied] = useState(false)
  const url = `https://www.dudemd.com/articles/${category}/${slug}`
  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(article.title)

  function copyLink() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    // Page view
    try { fetch('/api/personalization/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_type: 'view', article_slug: slug, category_slug: category }) }) } catch(e) {}

    // Scroll depth
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

    // Time on page
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

  const btn: any = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }


  function RelatedArticles() {
    if (!relatedArticles.length) return null
    return (
      <div style={{ margin: '2.5rem 0', borderTop: '1px solid #ede8df', paddingTop: '2rem' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '1.25rem' }}>Read Next</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {relatedArticles.map((a: any, i: number) => (
            <a key={i} href={`/articles/${a.categories?.slug}/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', backgroundColor: '#fff', border: '1px solid #ede8df', overflow: 'hidden' }}>
              {a.cover_image_url && <img src={a.cover_image_url} alt={a.title} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />}
              <div style={{ padding: '0.875rem' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.35rem' }}>{a.categories?.name}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.4, margin: 0 }}>{a.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  function Disclaimer() {
    return (
      <div style={{ margin: '2rem 0', padding: '1rem 1.25rem', borderLeft: '3px solid #c9b28f', backgroundColor: '#f7f4ee', fontSize: '13px', color: '#4A5563', lineHeight: 1.6 }}>
        <strong style={{ color: '#0e1a2b' }}>Editorial Disclaimer:</strong> DudeMD content is editorial and informational. It is not medical advice. Always consult a qualified healthcare provider before making changes to your diet, exercise, supplement, or treatment plan.
      </div>
    )
  }
  function ShareButtons() {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#f7f4ee', border: '1px solid #ede8df', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <style>{`@media (max-width: 600px) { .share-label { display: none !important } }`}</style>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1rem' }}>Share this article</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" style={{ ...btn, backgroundColor: '#1877F2', color: '#fff' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span className="share-label">Facebook</span>
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" style={{ ...btn, backgroundColor: '#000', color: '#fff' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span className="share-label">Post on X</span>
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" onClick={copyLink} style={{ ...btn, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', color: '#fff' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            <span className="share-label">Instagram</span>
          </a>
          <button onClick={copyLink} style={{ ...btn, backgroundColor: copied ? '#2d7a3a' : '#0e1a2b', color: '#f7f4ee' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <span className="share-label">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <ShareButtons />
      <div style={{ fontSize: '16px', color: '#1B1D21', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: article.content || '' }} />
      {article.faq_items && article.faq_items.length > 0 && (
        <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f7f4ee', borderRadius: '8px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
          {article.faq_items.map((item: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: idx < article.faq_items.length - 1 ? '1px solid #ede8df' : 'none' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.75rem' }}>{item.question}</h3>
              <p style={{ fontSize: '15px', color: '#4A5563', lineHeight: 1.7, margin: 0 }}>{item.answer}</p>
            </div>
          ))}
        </div>
      )}
      <ShareButtons />
      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f7f4ee', borderLeft: '3px solid #c9b28f' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>About the Author</p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.25rem' }}>
          {article.authors?.slug ? (
            <Link href={`/authors/${article.authors.slug}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{article.authors.name}</Link>
          ) : article.authors?.name}
        </p>
        {article.authors?.title && <p style={{ fontSize: '13px', color: '#9a9085', marginBottom: '0.5rem' }}>{article.authors.title}</p>}
        {article.authors?.bio && <p style={{ fontSize: '14px', color: '#4A5563', lineHeight: 1.6, marginBottom: '0.75rem' }}>{article.authors.bio}</p>}
        {!article.authors?.bio && <p style={{ fontSize: '14px', color: '#4A5563', lineHeight: 1.6, marginBottom: '0.75rem' }}>Contributing writer at DudeMD.</p>}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {article.authors?.twitter && <a href={article.authors.twitter} target="_blank" rel="noopener noreferrer" title="Twitter / X" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, backgroundColor: '#000', borderRadius: '50%', color: '#fff' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>}
          {article.authors?.instagram && <a href={article.authors.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', borderRadius: '50%', color: '#fff' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>}
          {article.authors?.linkedin && <a href={article.authors.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, backgroundColor: '#0A66C2', borderRadius: '50%', color: '#fff' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>}
          {article.authors?.website && <a href={article.authors.website} target="_blank" rel="noopener noreferrer" title="Website" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, backgroundColor: '#c9b28f', borderRadius: '50%', color: '#0e1a2b' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>}
        </div>
      </div>
    </>
  )
}
