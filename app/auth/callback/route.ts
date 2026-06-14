/**
 * Auth Callback Handler
 * Exchanges authorization code for session
 * Sets httpOnly cookies with proper security flags
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    console.error("[AUTH] No code provided");
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
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
                ...COOKIE_OPTIONS,
                ...options,
              });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("[AUTH] Exchange failed:", error.message);
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
    }

    if (!data.session) {
      console.error("[AUTH] No session after exchange");
      return NextResponse.redirect(`${origin}/login?error=no_session`);
    }

    console.log("[AUTH] Session established:", data.session.user.email);
    
    // Small delay to ensure cookie propagation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.redirect(`${origin}/dashboard`);

  } catch (err) {
    console.error("[AUTH] Unexpected error:", err);
    return NextResponse.redirect(`${origin}/login?error=unknown`);
  }
}