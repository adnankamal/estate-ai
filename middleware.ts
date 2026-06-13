import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ✅ CRITICAL: Refresh session
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Middleware auth error:", error.message);
  }

  // Protect dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      console.log("No user, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/callback"],
};