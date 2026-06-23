import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // OAuth callback tokens ko URL se capture karne ke liye mandatory hai
      },
    });
  }
  return client;
}

export const supabase = getSupabaseBrowserClient();

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

export async function getAuthStatus(
  maxRetries = 3,
  delayMs = 600
): Promise<{ status: AuthStatus; user: any | null; error: Error | null }> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. getUser ki jagah getSession use karo local token parsing ke liye
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        return { status: "authenticated", user: session.user, error: null };
      }
      
      // Agar session turant nahi mila, toh exponential backoff se thoda wait karo (hydration/URL parsing ke liye)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    } catch (err) {
      if (attempt === maxRetries) {
        return { 
          status: "error", 
          user: null, 
          error: err instanceof Error ? err : new Error("Auth check failed") 
        };
      }
    }
  }
  
  return { status: "unauthenticated", user: null, error: null };
}