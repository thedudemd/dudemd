'use client'
import { useState, useEffect, useRef } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export default function FloatingCommentLink() {
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const hasShownRef = useRef(false)

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/feature_flags?key=eq.article_comments&select=enabled`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    }).then(r => r.json()).then(data => setEnabled(!!data?.[0]?.enabled)).catch(() => setEnabled(false))
  }, [])

  useEffect(() => {
    if (!enabled) return

    const commentsEl = document.getElementById('comments')
    if (!commentsEl) return

    const onScroll = () => {
      if (window.scrollY > 400) hasShownRef.current = true
      setVisible(hasShownRef.current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(false)
      else if (hasShownRef.current) setVisible(true)
    }, { rootMargin: '0px' })
    observer.observe(commentsEl)

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <button
      onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Jump to comments"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 999,
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: 'var(--color-navy)',
        color: 'var(--color-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: visible ? (hovered ? 1 : 0.65) : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </button>
  )
}
