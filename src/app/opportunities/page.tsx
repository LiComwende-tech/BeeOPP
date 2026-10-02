import type { Metadata } from "next";
import Link from "next/link";
import { OpportunitySearch } from "@/components/opportunity-search";
import { getActiveOpportunities, PSC_CHECKED_AT } from "@/lib/opportunities";

export const metadata: Metadata = {
  title: "Current opportunities",
  description: "Browse current, source-checked public service adverts for Kenya. Apply through the original official source.",
};
export const dynamic = "force-dynamic";

export default function OpportunitiesPage() {
  const activeOpportunities = getActiveOpportunities();
  return (
    <main className="auth-shell listings-shell">
      <header className="site-header"><Link className="wordmark" href="/">BeeOPP</Link><nav><Link href="/">Home</Link><Link href="/safety">Safety</Link><Link href="/login">Log in</Link></nav><Link className="button button-primary" href="/signup">Create an account</Link></header>
      <section className="listings-heading"><p className="eyebrow">Checked at the original source · {PSC_CHECKED_AT}</p><h1>Find your next opportunity.</h1><p>Explore currently open public adverts. BeeOPP links you to the organization’s official application page.</p></section>
      {activeOpportunities.length > 0 ? <OpportunitySearch opportunities={activeOpportunities} /> : <div className="empty-state"><h2>No currently verified adverts</h2><p>We hide listings after their stated closing date. Please check back when current openings are verified.</p></div>}
      <footer className="site-footer"><span>Kenya · Uganda · Tanzania</span><span>BeeOPP · External listings are managed by their original publishers</span></footer>
    </main>
  );
}
