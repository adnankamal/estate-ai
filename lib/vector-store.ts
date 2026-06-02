import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function findRelevantProperties(embedding: number[]) {
  const { data, error } = await supabase.rpc('match_properties', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 3,
  })

  if (error) {
    return []
  }

  return data
}