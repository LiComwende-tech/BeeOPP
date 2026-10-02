import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Job search safety",
  description: "Practical checks for reviewing external job adverts and applying safely.",
};

export default function SafetyPage() {
  return (
    <main className="auth-shell listings-shell">
      <header className="site-header"><Link className="wordmark" href="/">BeeOPP</Link><nav><Link href="/opportunities">Opportunities</Link><Link href="/login">Log in</Link></nav><Link className="button button-primary" href="/signup">Create an account</Link></header>
      <section className="safety-page">
        <p className="eyebrow">Your safety matters</p>
        <h1>Check the source before you apply.</h1>
        <p className="safety-intro">BeeOPP’s first listings link to original public-service adverts. We check that the source lists the advert as open, but only the publisher controls the application and final requirements.</p>
        <div className="safety-grid">
          <article><span>01</span><h2>Use the original site</h2><p>Open the official source linked on the advert. Confirm the job title, advert number, deadline and eligibility there before sharing any information.</p></article>
          <article><span>02</span><h2>Don’t pay to get a job</h2><p>Do not pay someone to apply, attend an interview, secure an offer, or receive a job. If a request like this appears, stop and verify the organization through its official contact details.</p></article>
          <article><span>03</span><h2>Protect private details</h2><p>Share only information the official application asks for. Never share passwords, one-time codes, banking PINs, or card details with a recruiter.</p></article>
          <article><span>04</span><h2>Check that it is still open</h2><p>Listings can change. BeeOPP hides adverts after their listed closing date, but you should check the official page again before applying.</p></article>
        </div>
        <p className="safety-note">BeeOPP does not charge to browse these external opportunities and does not collect applications for them. Source checking does not guarantee that every employer or later interaction is risk-free.</p>
        <Link className="button button-outline" href="/opportunities">Browse opportunities</Link>
      </section>
      <footer className="site-footer"><span>Kenya · Uganda · Tanzania</span><span>BeeOPP · Browse freely</span></footer>
    </main>
  );
}
