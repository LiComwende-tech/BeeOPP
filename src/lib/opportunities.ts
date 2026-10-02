export const PSC_ADVERTS_URL = "https://psckjobs.go.ke/ActiveJobsAdverts.aspx";
export const PSC_CHECKED_AT = "2026-09-26";

export type Opportunity = {
  slug: string;
  advertNumber: string;
  title: string;
  department: string;
  vacancies: number;
  scale: string;
  experience: string;
  qualification: string;
  sourceCategory: "Open";
  postedOn: string;
  closesOn: string;
  country: "Kenya";
  sourceName: "Public Service Commission of Kenya";
  sourceUrl: string;
};

const openAdvertNumbers = [
  {
    advertNumber: "172/2026",
    title: "Programme Officer II",
    department: "State Department for Cabinet Affairs",
    vacancies: 2,
    scale: "CSG 11",
    experience: "No prior experience required",
    qualification: "A bachelor’s degree in Economics, Economics and Statistics, Planning and Project Management, Political Science or Government, Public Administration, or Law from a university recognized in Kenya.",
    sourceUrl: "https://psckjobs.go.ke/AdvertDetailsExt.aspx?kpx=172/2026&kpage=ActiveAdverts.aspx",
  },
] as const;

export const opportunities: Opportunity[] = openAdvertNumbers.map((advert) => ({
  ...advert,
  slug: advert.advertNumber.replace("/", "-").toLowerCase(),
  sourceCategory: "Open",
  postedOn: "2026-09-22",
  closesOn: "2026-10-13",
  country: "Kenya",
  sourceName: "Public Service Commission of Kenya",
  sourceUrl: advert.sourceUrl,
}));

export function isOpportunityActive(opportunity: Opportunity, now = new Date()) {
  // PSC dates are in East Africa Time. Keep an advert visible through its listed close date.
  return now.getTime() <= new Date(`${opportunity.closesOn}T23:59:59+03:00`).getTime();
}

export function getActiveOpportunities(now = new Date()) {
  return opportunities.filter((opportunity) => isOpportunityActive(opportunity, now));
}

export function getOpportunityBySlug(slug: string, now = new Date()) {
  const opportunity = opportunities.find((item) => item.slug === slug);
  return opportunity && isOpportunityActive(opportunity, now) ? opportunity : undefined;
}

export function formatOpportunityDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
