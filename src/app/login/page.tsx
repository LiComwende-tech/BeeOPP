import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { getOpportunityBySlug } from "@/lib/opportunities";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const prefix = "/opportunities/";
  const slug = next?.startsWith(prefix) ? next.slice(prefix.length) : "";
  const returnTo = getOpportunityBySlug(slug) ? `${prefix}${slug}` : undefined;

  return <main className="auth-shell"><header className="auth-header"><Link className="wordmark" href="/">BeeOPP</Link><Link className="back-link" href="/">Back to home</Link></header><div className="auth-layout single-auth"><AuthForm mode="login" returnTo={returnTo} /><aside className="auth-side"><p className="side-kicker">Welcome back</p><h2>Pick up where you left off.</h2><p>Your profile, saved opportunities and applications will live in one place.</p><div className="free-note">No payment is needed to log in, search or apply.</div></aside></div><footer className="auth-footer">BeeOPP · Kenya · Uganda · Tanzania</footer></main>;
}
