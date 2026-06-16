'use client'
import { useEffect, useRef } from 'react'

export default function InFeedAd() {
  const insRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (e) {}
  }, [])

  return (
    <div style={{ maxWidth: "100%", overflow: "hidden" }}>
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', maxWidth: '100%' }}
      data-ad-format="fluid"
      data-ad-layout-key="-6e+cf+2a+d+4j"
      data-ad-client="ca-pub-9224150605844856"
      data-ad-slot="8451499370"
    />
    </div>
  )
}
