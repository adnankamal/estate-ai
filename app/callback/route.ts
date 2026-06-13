import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // ❌ OLD: Silent fail
            // try { cookiesToSet.forEach(...) } catch {}
            
            // ✅ NEW: Must set cookies
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch (err) {
                console.error(`Cookie set failed for ${name}:`, err);
                // If one fails, try next
              }
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Auth exchange error:", error.message);
      return NextResponse.redirect(`${origin}/?error=auth_exchange_failed`);
    }

    // ✅ DEBUG: Log session
    console.log("Session set:", data.session?.user?.email);

    // ✅ SUCCESS: Redirect to dashboard
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/?error=no_code`);
}