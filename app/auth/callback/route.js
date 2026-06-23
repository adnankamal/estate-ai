import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Agar code nahi hai, toh sahi route (/auth/login) par bhejo
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  try {
    // Next.js standard cookie store instance
    const cookieStore = cookies();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Production crash se bachne ke liye strict validation check
    if (!supabaseUrl || !supabaseKey) {
      console.error("CRITICAL ERROR: Supabase env variables are missing on this instance!");
      return NextResponse.redirect(`${origin}/auth/login?error=missing_env_vars`);
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Redirects ke dauran setting cookies fail hona safe to ignore hai
            }
          },
        },
      }
    );

    // Code ko session token se exchange karo
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Supabase Session Exchange Failure:", error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`);
    }

    // Handshake successful: Go to dashboard
    return NextResponse.redirect(`${origin}/dashboard`);

  } catch (err) {
    console.error("Fatal Callback Route Crash:", err);
    return NextResponse.redirect(`${origin}/auth/login?error=callback_exception`);
  }
}