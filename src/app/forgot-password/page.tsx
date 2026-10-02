import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return <main className="auth-shell"><header className="auth-header"><Link className="wordmark" href="/">BeeOPP</Link><Link className="back-link" href="/login">Back to log in</Link></header><div className="auth-layout single-auth"><AuthForm mode="recovery" /></div><footer className="auth-footer">BeeOPP · Kenya · Uganda · Tanzania</footer></main>;
}
