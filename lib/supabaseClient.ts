import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseKey);
  }
  return client;
}

export const supabase = getSupabaseBrowserClient();

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

export async function getAuthStatus(
  maxRetries = 3,
  delayMs = 800
): Promise<{ status: AuthStatus; user: any | null; error: Error | null }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (data.user) {
        return { status: "authenticated", user: data.user, error: null };
      }
      
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