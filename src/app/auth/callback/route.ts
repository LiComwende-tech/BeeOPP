import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/dashboard";
  const destination = new URL(value, "https://beeopp.invalid");
  if (destination.origin !== "https://beeopp.invalid") return "/dashboard";
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export async function GET(request: NextRequest) {
  const config = getSupabaseConfig();
  if (!config) return NextResponse.redirect(new URL("/?auth=not-configured", request.url));

  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/login?auth=link-invalid", request.url));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?auth=link-invalid", request.url));
  return NextResponse.redirect(new URL(next, request.url));
}
