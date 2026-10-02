import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatOpportunityDate, getOpportunityBySlug, PSC_CHECKED_AT } from "@/lib/opportunities";
import { SaveOpportunityButton } from "@/components/save-opportunity-button";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);
  return opportunity ? {
    title: opportunity.title,
    description: `${opportunity.title} at ${opportunity.department}. Official PSC advert ${opportunity.advertNumber}. Apply through the source site.`,
  } : { title: "Opportunity unavailable" };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);
  if (!opportunity) notFound();

  let signedIn = false;
  let initiallySaved = false;
  if (getSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      signedIn = true;
      const { data } = await supabase
        .from("saved_opportunities")
        .select("opportunity_slug")
        .eq("user_id", user.id)
        .eq("opportunity_slug", slug)
        .maybeSingle();
      initiallySaved = Boolean(data);
    }
  }

  return (
    <main className="auth-shell listings-shell">
      <header className="site-header"><Link className="wordmark" href="/">BeeOPP</Link><nav><Link href="/opportunities">Opportunities</Link><Link href="/safety">Safety</Link><Link href="/login">Log in</Link></nav><Link className="button button-primary" href="/signup">Create an account</Link></header>
      <article className="opportunity-detail">
        <Link className="back-link" href="/opportunities">← All opportunities</Link>
        <p className="eyebrow">Official public advert · Kenya</p>
        <h1>{opportunity.title}</h1>
        <p className="detail-department">{opportunity.department}</p>
        <div className="detail-facts"><div><span>Advert number</span><strong>{opportunity.advertNumber}</strong></div><div><span>Vacancies</span><strong>{opportunity.vacancies}</strong></div><div><span>Job scale</span><strong>{opportunity.scale}</strong></div><div><span>Category</span><strong>{opportunity.sourceCategory}</strong></div><div><span>Advert date</span><strong>{formatOpportunityDate(opportunity.postedOn)}</strong></div><div><span>Closing date</span><strong>{formatOpportunityDate(opportunity.closesOn)}</strong></div><div><span>Experience</span><strong>{opportunity.experience}</strong></div></div>
        <section className="requirements-panel"><h2>Minimum qualification</h2><p>{opportunity.qualification}</p></section>
        <div className="source-check"><strong>Source checked {PSC_CHECKED_AT}</strong><p>The Public Service Commission lists this advert as open. BeeOPP does not decide eligibility or process applications. Check the full requirements and that the advert is still open on the official PSC portal before applying.</p></div>
        <SaveOpportunityButton slug={slug} initialSaved={initiallySaved} signedIn={signedIn} />
        <a className="button button-primary apply-button" href={opportunity.sourceUrl} target="_blank" rel="noopener noreferrer">View full requirements and apply on PSC ↗</a>
      </article>
      <footer className="site-footer"><span>BeeOPP · Kenya · Uganda · Tanzania</span><span>There is no BeeOPP fee to browse this external advert.</span></footer>
    </main>
  );
}
