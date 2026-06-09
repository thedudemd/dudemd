import { getFeatureFlag } from '@/lib/getFeatureFlag'
import EditorV1 from './EditorV1'

export default async function NewArticlePage() {
  const useV2 = await getFeatureFlag('new_editor')
  if (useV2) {
    const { default: EditorV2 } = await import('./EditorV2')
    return <EditorV2 />
  }
  return <EditorV1 />
}
