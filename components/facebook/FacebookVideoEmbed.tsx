'use client'
import { useEffect, useRef } from 'react'

interface FacebookVideoEmbedProps {
  videoUrl: string
  width?: number
  autoplay?: boolean
}

export default function FacebookVideoEmbed({ videoUrl, width = 500, autoplay = false }: FacebookVideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  }, [videoUrl])

  return (
    <div ref={containerRef} style={{ margin: '2rem auto', maxWidth: `${width}px` }}>
      <div
        className="fb-video"
        data-href={videoUrl}
        data-width={width}
        data-autoplay={autoplay}
        data-show-captions="true"
      />
    </div>
  )
}
