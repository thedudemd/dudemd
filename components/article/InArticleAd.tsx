'use client'
import { useEffect, useRef } from 'react'

export default function InArticleAd() {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (e) {}
  }, [])

  return (
    <div style={{ maxWidth: '100%', overflow: 'hidden', width: '100%' }}>
    <ins
      className="adsbygoogle"
      style={{ display: 'block', textAlign: 'center', margin: '2rem 0' }}
      data-ad-layout="in-article"
      data-ad-format="fluid"
      data-ad-client="ca-pub-9224150605844856"
      data-ad-slot="5366710034"
    />
    </div>
  )
}