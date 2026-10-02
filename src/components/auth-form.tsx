"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState, type FormEvent } from "react";
import { ACCOUNT_INTENTS, type AccountIntent } from "@/lib/account-intents";
import { signIn } from "@/app/actions";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "login" | "recovery" | "update-password";

function getAuthErrorMessage(error: unknown, mode: Mode) {
  const details = typeof error === "object" && error !== null ? error as { code?: unknown; status?: unknown } : {};
  if (details.code === "email_not_confirmed") {
    return "Confirm your email using the link Supabase sent you, then try logging in again. Check your spam folder too.";
  }
  if (details.status === 429) {
    return "There have been too many attempts. Wait a little while, then try again.";
  }
  if (error instanceof TypeError) {
    return "BeeOPP couldn’t reach Supabase. Check your internet connection and try again.";
  }
  if (mode === "login" && (details.code === "invalid_credentials" || details.code === "user_not_found")) {
    return "Email or password is incorrect. Check both, or use “Forgot your password?” to reset it.";
  }
  return "We couldn’t complete that request. Check your details and try again.";
}

const messages: Record<Mode, { title: string; intro: string; submit: string }> = {
  signup: { title: "Create your BeeOPP account", intro: "Start with the basics. You can build your profile over time.", submit: "Create account" },
  login: { title: "Welcome back", intro: "Log in to continue to BeeOPP.", submit: "Log in" },
  recovery: { title: "Reset your password", intro: "Enter your email and we’ll send a reset link if an account matches.", submit: "Send reset link" },
  "update-password": { title: "Choose a new password", intro: "Use at least 12 characters for a stronger password.", submit: "Update password" },
};

export function AuthForm({ mode, returnTo }: { mode: Mode; returnTo?: string }) {
  const router = useRouter();
  const [loginState, loginAction, loginPending] = useActionState(signIn, null);
  const configured = Boolean(getSupabaseConfig());
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [intents, setIntents] = useState<AccountIntent[]>(["seeker"]);
  const copy = messages[mode];

  function toggleIntent(intent: AccountIntent) {
    setIntents((current) => current.includes(intent) ? current.filter((item) => item !== intent) : [...current, intent]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const displayName = String(form.get("displayName") ?? "").trim();
        const country = String(form.get("country") ?? "");
        const password = String(form.get("password") ?? "");
        const confirmation = String(form.get("confirmPassword") ?? "");
        if (!displayName || !country || intents.length === 0) {
          setError("Add your name, choose a country and select at least one account option.");
          return;
        }
        if (password.length < 12) {
          setError("Choose a password with at least 12 characters.");
          return;
        }
        if (password !== confirmation) {
          setError("Those passwords don’t match. Please check and try again.");
          return;
        }
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            data: { display_name: displayName, country_code: country, account_intents: intents },
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }
        setConfirmationEmail(email);
        setNotice("Check your email for a confirmation link. Your account will be ready after you confirm it.");
      } else if (mode === "recovery") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });
        if (authError) throw authError;
        setNotice("If an account matches that email, a password reset link is on its way.");
      } else {
        const password = String(form.get("password") ?? "");
        const confirmation = String(form.get("confirmPassword") ?? "");
        if (password.length < 12) {
          setError("Choose a password with at least 12 characters.");
          return;
        }
        if (password !== confirmation) {
          setError("Those passwords don’t match. Please check and try again.");
          return;
        }
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setNotice("Your password has been updated. You can now continue to your account.");
        router.refresh();
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError, mode));
    } finally {
      setPending(false);
    }
  }

  async function resendConfirmation() {
    if (!confirmationEmail) return;
    setPending(true);
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resend({
        type: "signup",
        email: confirmationEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });
      if (authError) throw authError;
      setNotice("If this account still needs confirmation, a new email has been sent. Check your inbox and spam folder.");
    } catch (authError) {
      setError(getAuthErrorMessage(authError, "signup"));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby="form-title">
      <p className="eyebrow">BeeOPP account</p>
      <h1 id="form-title">{copy.title}</h1>
      <p className="form-intro">{copy.intro}</p>
      {!configured && <div className="setup-note" role="status"><strong>Backend connection needed</strong><span>Authentication becomes available after a Supabase project is connected. No account data is being collected yet.</span></div>}
      {(loginState?.error || error) && <div className="form-alert error-alert" role="alert">{loginState?.error || error}</div>}
      {notice && <div className="form-alert success-alert" role="status">{notice}</div>}
      {mode === "signup" && confirmationEmail && <button className="text-link" type="button" onClick={resendConfirmation} disabled={!configured || pending}>{pending ? "Sending…" : "Resend confirmation email"}</button>}
      <form action={mode === "login" ? loginAction : undefined} onSubmit={mode === "login" ? undefined : submit} noValidate>
        {mode === "login" && returnTo && <input type="hidden" name="next" value={returnTo} />}
        {mode === "signup" && <>
          <div className="form-field"><label htmlFor="displayName">Name you want people to see</label><input id="displayName" name="displayName" autoComplete="name" required maxLength={80} placeholder="Your name" /></div>
          <div className="form-field"><label htmlFor="country">Country</label><select id="country" name="country" required defaultValue=""><option value="" disabled>Choose a country</option><option value="KE">Kenya</option><option value="UG">Uganda</option><option value="TZ">Tanzania</option></select></div>
          <fieldset className="intent-fieldset"><legend>What would you like to do?</legend><p>You can select more than one. These preferences don’t control account permissions.</p>{ACCOUNT_INTENTS.map((intent) => <label className="check-row" key={intent.value}><input type="checkbox" checked={intents.includes(intent.value)} onChange={() => toggleIntent(intent.value)} />{intent.label}</label>)}</fieldset>
        </>}
        {mode !== "update-password" && <div className="form-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></div>}
        {(mode === "signup" || mode === "login" || mode === "update-password") && <div className="form-field"><label htmlFor="password">{mode === "update-password" ? "New password" : "Password"}</label><input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={12} maxLength={128} required placeholder="At least 12 characters" /><span className="field-help">Use at least 12 characters. A longer phrase is easier to remember.</span></div>}
        {(mode === "signup" || mode === "update-password") && <div className="form-field"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="Enter it again" /></div>}
        <button className="button button-primary submit-button" type="submit" disabled={!configured || pending || loginPending}>{pending || loginPending ? "Please wait…" : copy.submit}</button>
      </form>
      <div className="form-links">
        {mode === "signup" && <span>Already have an account? <Link href="/login">Log in</Link></span>}
        {mode === "login" && <><Link href="/forgot-password">Forgot your password?</Link><span>New to BeeOPP? <Link href="/signup">Create an account</Link></span></>}
        {mode === "recovery" && <Link href="/login">Back to log in</Link>}
        {mode === "update-password" && <Link href="/login">Back to log in</Link>}
      </div>
      <p className="privacy-note">Your email and password are private. Your public profile and contact visibility will be controlled separately.</p>
    </section>
  );
}
