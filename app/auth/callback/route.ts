import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production", // ✅ Local mein false
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
                httpOnly: true,
              });
            });
          },
        },
      }
    );

    // ✅ EXCHANGE CODE
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Auth exchange error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed`);
    }

    // ✅ DEBUG: Log cookies
    console.log("Session set:", data.session?.user?.email);
    console.log("Cookies after set:", cookieStore.getAll().map(c => c.name));

    // ✅ CRITICAL: Small delay to ensure cookie propagation
    await new Promise(resolve => setTimeout(resolve, 100));

    // ✅ VERIFY SESSION BEFORE REDIRECT
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}