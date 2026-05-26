'use client'
import { Suspense, lazy } from 'react'
const ShareButtons = lazy(() => import('./ShareButtons'))

export default function ShareButtonsWrapper({ title, slug, categorySlug }: { title: string, slug: string, categorySlug: string }) {
  return (
    <Suspense fallback={null}>
      <ShareButtons title={title} slug={slug} categorySlug={categorySlug} />
    </Suspense>
  )
}
