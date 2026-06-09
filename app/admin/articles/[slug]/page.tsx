import { getFeatureFlag } from '@/lib/getFeatureFlag'
import EditV1 from './EditV1'

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const useV2 = await getFeatureFlag('new_editor')
  if (useV2) {
    const { default: EditV2 } = await import('./EditV2')
    return <EditV2 params={params} />
  }
  return <EditV1 params={params} />
}
