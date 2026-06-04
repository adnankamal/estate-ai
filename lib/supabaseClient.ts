import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('CRITICAL: Missing Supabase environment infrastructure variables.');
}

// Global declaration adjustment for Node/Browser runtime isolation
declare global {
  var __supabaseInstance: ReturnType<typeof createClient> | undefined;
}

// Enforce single instance execution architecture across hot-reloads
export const supabase = globalThis.__supabaseInstance || createClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
  globalThis.__supabaseInstance = supabase;
}