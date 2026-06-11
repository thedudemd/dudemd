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
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-format="fluid"
      data-ad-layout-key="-6e+cf+2a+d+4j"
      data-ad-client="ca-pub-9224150605844856"
      data-ad-slot="8451499370"
    />
  )
}
