"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatOpportunityDate, type Opportunity } from "@/lib/opportunities";

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const closeLabel = formatOpportunityDate(opportunity.closesOn).replace(" 2026", "");
  return (
    <article className="opportunity-card">
      <div className="opportunity-card-top"><span className="source-pill">Official public advert</span><span className="card-date">Closes {closeLabel}</span></div>
      <h2><Link href={`/opportunities/${opportunity.slug}`}>{opportunity.title}</Link></h2>
      <p className="opportunity-department">{opportunity.department}</p>
      <div className="opportunity-facts"><span>{opportunity.country}</span><span>{opportunity.vacancies} vacancies</span><span>{opportunity.scale}</span></div>
      <Link className="text-link" href={`/opportunities/${opportunity.slug}`}>View advert details <span aria-hidden="true">→</span></Link>
    </article>
  );
}

export function OpportunitySearch({ opportunities }: { opportunities: Opportunity[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return opportunities;
    return opportunities.filter((item) => `${item.title} ${item.department} ${item.advertNumber} ${item.scale}`.toLocaleLowerCase().includes(normalized));
  }, [opportunities, query]);

  return (
    <>
      <section className="opportunity-search-panel" aria-label="Search opportunities">
        <label htmlFor="opportunity-query">Search current opportunities</label>
        <input id="opportunity-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Job title, department or advert number" />
        <p aria-live="polite">{visible.length} {visible.length === 1 ? "opportunity" : "opportunities"} found</p>
      </section>
      {visible.length > 0 ? <div className="opportunity-grid">{visible.map((item) => <OpportunityCard key={item.slug} opportunity={item} />)}</div> : <div className="empty-state"><h2>No matching opportunities</h2><p>Try another title or advert number.</p></div>}
      <p className="listing-disclaimer">These are external adverts from the Public Service Commission of Kenya. BeeOPP does not collect applications or charge applicants. Check eligibility, current status and application instructions on the official source.</p>
    </>
  );
}
