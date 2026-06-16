'use client'
import { useEffect, useRef } from 'react'

export default function SidebarAd() {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (e) {}
  }, [])

  return (
    <div style={{ marginBottom: '2rem', maxWidth: '100%', overflow: 'hidden' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', maxWidth: '100%' }}
        data-ad-client="ca-pub-9224150605844856"
        data-ad-slot="2203495652"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
