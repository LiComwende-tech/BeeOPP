import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return <main className="auth-shell"><header className="auth-header"><Link className="wordmark" href="/">BeeOPP</Link><Link className="back-link" href="/">Back to home</Link></header><div className="auth-layout"><AuthForm mode="signup" /><aside className="auth-side"><p className="side-kicker">Start where you are</p><h2>Your skills and experience belong in the picture.</h2><p>Build a profile at your own pace. Formal education is optional unless a specific opportunity needs it.</p><ul><li>Free to create an account</li><li>Free to search and apply</li><li>Choose what appears on your public profile</li></ul></aside></div><footer className="auth-footer">BeeOPP · Kenya · Uganda · Tanzania</footer></main>;
}
