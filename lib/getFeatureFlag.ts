import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getFeatureFlag(key: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('key', key)
      .single()
    return data?.enabled ?? false
  } catch {
    return false
  }
}
