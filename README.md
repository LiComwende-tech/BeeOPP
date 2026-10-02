# BeeOPP

**Discover opportunities. Find what is next.**

BeeOPP is an early public web app that helps people explore source-checked work opportunities across East Africa. Browsing and seeker accounts are free. BeeOPP links applicants to the original publisher; it does not accept applications or charge people to apply.

**Live demo:** [beeopp.netlify.app](https://beeopp.netlify.app/)

## What it does

- Browse opportunity listings and their source details without signing in.
- Create an account and sign in with email confirmation.
- Save opportunities to a personal dashboard.
- Follow links to the original publisher to review requirements and apply.

BeeOPP is an early-stage project. Listings are curated and should always be checked against the publisher’s current advert. The app is not an employer marketplace and does not process applications, payments, CV uploads, or candidate messages.

## Built with

- Next.js and TypeScript
- Supabase Auth and Postgres with row-level security
- Netlify

## Run locally

Requirements: Node.js 24 and pnpm.

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. In Supabase, run `supabase/migrations/0001_profiles.sql`, then `supabase/migrations/0002_saved_opportunities.sql`.
4. In Supabase Authentication URL Configuration, set the local Site URL to `http://localhost:3000` and allow `http://localhost:3000/**` as a redirect URL.
5. Start the app with `pnpm dev` and open `http://localhost:3000`.

Use only the Supabase publishable key in the browser configuration. Never add `.env.local`, SMTP passwords, personal access tokens, or Supabase service-role keys to this repository. The included `.gitignore` excludes local environment files.

## Project links

- Live app: [beeopp.netlify.app](https://beeopp.netlify.app/)
- Opportunity source: [Public Service Commission of Kenya](https://psckjobs.go.ke/ActiveJobsAdverts.aspx)
