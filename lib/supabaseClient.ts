import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ SINGLETON — ek hi instance, multiple nahi
let client: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseKey);
  }
  return client;
};

// ✅ Default export
export const supabase = getSupabaseClient();