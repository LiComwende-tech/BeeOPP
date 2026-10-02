import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { ACCOUNT_INTENTS, type AccountIntent } from "@/lib/account-intents";
import { formatOpportunityDate, getOpportunityBySlug } from "@/lib/opportunities";
import { SaveOpportunityButton } from "@/components/save-opportunity-button";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!getSupabaseConfig()) redirect("/login?setup=needed");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { data: savedRows, error: savedError } = await supabase
    .from("saved_opportunities")
    .select("opportunity_slug")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const savedSlugs = (savedRows ?? []).map((row) => String(row.opportunity_slug));
  const activeSaved = savedSlugs
    .map((slug) => ({ slug, opportunity: getOpportunityBySlug(slug) }))
    .filter((item): item is { slug: string; opportunity: NonNullable<ReturnType<typeof getOpportunityBySlug>> } => Boolean(item.opportunity));
  const unavailableSaved = savedSlugs.filter((slug) => !getOpportunityBySlug(slug));

  const name = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "there";
  const intents = Array.isArray(user.user_metadata?.account_intents) ? user.user_metadata.account_intents as string[] : [];
  const selected = ACCOUNT_INTENTS.filter((item) => intents.includes(item.value as AccountIntent));

  return <main className="auth-shell dashboard-shell"><header className="auth-header"><Link className="wordmark" href="/">BeeOPP</Link><form action={signOut}><button className="button button-outline" type="submit">Log out</button></form></header><section className="dashboard-card"><p className="eyebrow">Your account</p><h1>Welcome, {name}.</h1><p>You’re signed in as <strong>{user.email}</strong>.</p><div className="dashboard-state"><span className="status-label">Your workspace</span><h2>Keep track of opportunities you like</h2><p>Save an advert to find it here later. Applications are completed on the official publisher’s site; BeeOPP does not receive your application.</p></div><section className="saved-opportunities" aria-labelledby="saved-title"><div className="saved-heading"><div><h2 id="saved-title">Saved opportunities</h2><p>Only adverts that are still open appear as active.</p></div><Link className="text-link" href="/opportunities">Browse adverts →</Link></div>{savedError ? <div className="setup-note" role="status"><strong>Saved opportunities are not connected yet</strong><span>Apply the new saved-opportunities database update to enable this list.</span></div> : activeSaved.length > 0 ? <div className="saved-opportunity-list">{activeSaved.map(({ slug, opportunity }) => <article className="saved-opportunity" key={slug}><div><span className="source-pill">Open · {opportunity.country}</span><h3><Link href={`/opportunities/${slug}`}>{opportunity.title}</Link></h3><p>{opportunity.department} · Closes {formatOpportunityDate(opportunity.closesOn)}</p></div><SaveOpportunityButton slug={slug} initialSaved signedIn /></article>)}</div> : !unavailableSaved.length ? <div className="empty-state"><h3>No saved adverts yet</h3><p>When you find an opportunity you like, save it and it will be easy to find here.</p><Link className="text-link" href="/opportunities">Explore opportunities →</Link></div> : null}{unavailableSaved.length > 0 && <div className="saved-expired"><h3>Closed or unavailable adverts</h3>{unavailableSaved.map((slug) => <div className="saved-expired-row" key={slug}><span>Advert {slug.replaceAll("-", "/")}</span><SaveOpportunityButton slug={slug} initialSaved signedIn /></div>)}</div>}</section><h3>Your selected account options</h3><ul className="intent-summary">{selected.map((item) => <li key={item.value}>{item.label}</li>)}</ul><p className="field-help">These choices describe how you want to use BeeOPP. They do not grant special access.</p></section><footer className="auth-footer">BeeOPP · Kenya · Uganda · Tanzania</footer></main>;
}
