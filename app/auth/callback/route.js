import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(`${origin}/auth/login?error=missing_env_vars`);
    }

    // Next.js 14 aur 15 dono ke liye cookie promise extraction code
    const cookieResult = cookies();
    const cookieStore = cookieResult instanceof Promise ? await cookieResult : cookieResult;

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
              // Redirect ke dauran safe to ignore
            }
          },
        },
      }
    );

    // Code ko token exchange pipeline me dalo
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Exchange error:", error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed&msg=${encodeURIComponent(error.message)}`);
    }

    // Success URL
    return NextResponse.redirect(`${origin}/dashboard`);

  } catch (err) {
    console.error("Fatal Callback Route Crash:", err);
    // Explicit error message link me append karo debugging ke liye
    return NextResponse.redirect(`${origin}/auth/login?error=callback_exception&details=${encodeURIComponent(err.message || err)}`);
  }
}