// @ts-nocheck
import { PlasmicComponent, PlasmicRootProvider, extractPlasmicQueryData } from '@plasmicapp/loader-nextjs/react-server-conditional'
import { PLASMIC } from '@/lib/plasmic-init'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PlasmicLoaderPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const path = '/' + (slug?.join('/') || '')
  const plasmicData = await PLASMIC.maybeFetchComponentData(path)
  if (!plasmicData) notFound()
  const pageMeta = plasmicData.entryCompMetas[0]
  return (
    <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData} pageRoute={pageMeta.path}>
      <PlasmicComponent component={pageMeta.displayName} />
    </PlasmicRootProvider>
  )
}
