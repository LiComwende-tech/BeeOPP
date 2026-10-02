import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const config = getSupabaseConfig();
  if (!config) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refreshes the session cookie. Protected pages still verify identity server-side.
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  // Only refresh auth state on pages that read or update the signed-in session.
  // Public pages can render without waiting for a Supabase request.
  matcher: ["/dashboard/:path*", "/update-password", "/auth/:path*", "/opportunities/:slug"],
};
