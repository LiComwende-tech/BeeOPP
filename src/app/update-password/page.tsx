import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a new password" };
export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <main className="auth-shell"><header className="auth-header"><Link className="wordmark" href="/">BeeOPP</Link></header><div className="auth-layout single-auth"><section className="auth-card"><h1>Authentication isn’t connected</h1><p>Add the Supabase project settings before using password recovery.</p></section></div></main>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <main className="auth-shell"><header className="auth-header"><Link className="wordmark" href="/">BeeOPP</Link><Link className="back-link" href="/login">Back to log in</Link></header><div className="auth-layout single-auth"><AuthForm mode="update-password" /></div><footer className="auth-footer">BeeOPP · Kenya · Uganda · Tanzania</footer></main>;
}
