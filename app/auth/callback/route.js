import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Agar URL me authentication code nahi hai, toh wapas login par bhejo
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
              // Server client context under redirects can sometimes throw safely
            }
          },
        },
      }
    );

    // Token code ko session se exchange karo
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Auth exchange failure:", error.message);
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
    }

    // Success: Dashboard par send karo
    return NextResponse.redirect(`${origin}/dashboard`);

  } catch (err) {
    console.error("Callback route crash:", err);
    return NextResponse.redirect(`${origin}/login?error=unknown`);
  }
}