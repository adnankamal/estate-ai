import { supabase } from "./supabaseClient";

export async function findRelevantProperties(embedding: number[]) {
  // Explicit 'as any' cast to bypass missing RPC type definitions
  const { data, error } = await supabase.rpc('match_properties', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 3,
  } as any);

  if (error) {
    console.error("VECTOR_MATCH_ERROR:", error.message);
    return [];
  }

  return data;
}