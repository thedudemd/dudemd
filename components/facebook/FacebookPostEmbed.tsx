'use client'
import { useEffect, useRef } from 'react'

interface FacebookPostEmbedProps {
  postUrl: string
  width?: number
}

export default function FacebookPostEmbed({ postUrl, width = 500 }: FacebookPostEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Facebook SDK
    if (typeof window !== 'undefined' && !window.FB) {
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      document.body.appendChild(script)

      script.onload = () => {
        if (window.FB) {
          window.FB.XFBML.parse()
        }
      }
    } else if (window.FB) {
      window.FB.XFBML.parse(containerRef.current)
    }
  }, [postUrl])

  return (
    <div ref={containerRef} style={{ margin: '2rem auto', maxWidth: `${width}px` }}>
      <div
        className="fb-post"
        data-href={postUrl}
        data-width={width}
        data-show-text="true"
      />
    </div>
  )
}
