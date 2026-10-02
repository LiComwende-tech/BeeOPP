import Link from "next/link";
import { formatOpportunityDate, getActiveOpportunities, PSC_CHECKED_AT } from "@/lib/opportunities";
import { getSupabaseConfig } from "@/lib/supabase/config";

// Rebuild the public landing page periodically so requests can be served from cache.
export const revalidate = 300;

function isCuratedAdvertActive() {
  return Date.now() < new Date("2026-10-13T23:59:59+03:00").getTime();
}

export default function HomePage() {
  const connected = Boolean(getSupabaseConfig());
  const activeOpportunities = getActiveOpportunities();
  const curatedAdvertActive = isCuratedAdvertActive() && activeOpportunities.length > 0;
  return (
    <main className="auth-shell home-shell">
      <header className="site-header"><Link className="wordmark" href="/">BeeOPP</Link><nav><a href="#about">About</a><Link href="/opportunities">Opportunities</Link><Link href="/safety">Safety</Link></nav><Link className="button button-primary" href="/signup">Create an account</Link></header>
      <section className="home-hero" id="about"><p className="eyebrow">Opportunities across East Africa</p><h1>Show what you can do.<br />Find what’s next.</h1><p>Discover meaningful work, meet people who need your skills, and build a professional profile that grows with you.</p><div className="button-row"><Link className="button button-primary" href="/signup">Get started free</Link><Link className="button button-outline" href="/login">Log in</Link></div><small>Free to create a profile and apply. No fee to be seen.</small></section>
      <section className="home-opportunities" id="opportunities"><div className="section-heading"><div><p className="eyebrow">{curatedAdvertActive ? `PSC source checked ${PSC_CHECKED_AT}` : "Source-checked listings"}</p><h2>{activeOpportunities.length ? "Open opportunities" : "No current verified adverts"}</h2></div><Link className="text-link" href="/opportunities">Browse all {activeOpportunities.length} <span aria-hidden="true">→</span></Link></div>{activeOpportunities.length ? <div className="featured-opportunities">{activeOpportunities.slice(0, 3).map((item) => <article className="opportunity-card" key={item.slug}><div className="opportunity-card-top"><span className="source-pill">Official public advert</span><span className="card-date">Closes {formatOpportunityDate(item.closesOn).replace(" 2026", "")}</span></div><h3><Link href={`/opportunities/${item.slug}`}>{item.title}</Link></h3><p className="opportunity-department">{item.department}</p><div className="opportunity-facts"><span>{item.country}</span><span>{item.vacancies} vacancies</span><span>{item.scale}</span></div></article>)}</div> : <p>We hide listings after their closing date and add new ones only after checking the official source.</p>}</section>
      <section className="status-card"><div><span className="status-label">{connected ? "Accounts · early access" : "Accounts · setup needed"}</span><h2>Creating an account is free</h2><p>BeeOPP has no paid gate for seekers. Applications for external adverts are handled by the original publisher, not through BeeOPP.</p></div><Link href="/signup" className="text-link">Get started free →</Link></section>
      <footer className="site-footer"><span>Kenya · Uganda · Tanzania</span><span><Link href="/safety">Stay safe while applying</Link> · BeeOPP · Project preview</span></footer>
    </main>
  );
}
