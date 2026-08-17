/**
 * Arbeitnow Job Board API — a free, keyless public job listings API
 * (mostly EU/remote tech roles). No signup or API key required, which is
 * why it's the default live source: it works immediately with zero setup.
 *
 * IMPORTANT: this integration was built against Arbeitnow's documented API
 * contract, but could not be verified against a live response — this
 * sandbox's network egress is restricted to dev-infrastructure domains
 * only (npm, GitHub, etc.) and does not reach arbitrary public APIs like
 * this one. Parsing is defensive (never throws on an unexpected shape,
 * returns a clear error instead) precisely because of that. Worth a real
 * check once deployed; if fields don't line up, this is the file to fix.
 *
 * Docs: https://www.arbeitnow.com/api/job-board-api
 */

export interface LiveJobResult {
  externalId: string;
  title: string;
  companyName: string;
  location: string | null;
  remote: boolean;
  description: string;
  skills: string[];
  url: string;
  postedDate: string | null;
}

export interface LiveJobSearchResult {
  jobs: LiveJobResult[];
  error?: string;
}

const ARBEITNOW_ENDPOINT = "https://www.arbeitnow.com/api/job-board-api";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapJob(raw: unknown): LiveJobResult | null {
  if (!isRecord(raw)) return null;
  const title = typeof raw.title === "string" ? raw.title : null;
  const companyName = typeof raw.company_name === "string" ? raw.company_name : null;
  const url = typeof raw.url === "string" ? raw.url : null;
  if (!title || !companyName || !url) return null;

  const createdAt = raw.created_at;
  let postedDate: string | null = null;
  if (typeof createdAt === "number") {
    postedDate = new Date(createdAt * 1000).toISOString().slice(0, 10);
  } else if (typeof createdAt === "string" && createdAt) {
    const parsed = new Date(createdAt);
    postedDate = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
  }

  return {
    externalId: typeof raw.slug === "string" ? raw.slug : url,
    title,
    companyName,
    location: typeof raw.location === "string" && raw.location ? raw.location : null,
    remote: raw.remote === true,
    description: typeof raw.description === "string" ? stripHtml(raw.description).slice(0, 4000) : "",
    skills: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === "string") : [],
    url,
    postedDate,
  };
}

/** Searches live listings. Never throws — a failure comes back as `{ jobs: [], error }`. */
export async function searchArbeitnowJobs(query?: string): Promise<LiveJobSearchResult> {
  let res: Response;
  try {
    res = await fetch(ARBEITNOW_ENDPOINT, { next: { revalidate: 300 } });
  } catch {
    return { jobs: [], error: "Couldn't reach the live job source right now. Try again shortly." };
  }

  if (!res.ok) {
    return { jobs: [], error: `Live job source returned an error (HTTP ${res.status}).` };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { jobs: [], error: "Live job source returned an unexpected response." };
  }

  const rawJobs = isRecord(json) && Array.isArray(json.data) ? json.data : null;
  if (!rawJobs) {
    return { jobs: [], error: "Live job source response didn't match the expected format." };
  }

  let jobs = rawJobs.map(mapJob).filter((j): j is LiveJobResult => j !== null);

  if (query) {
    const q = query.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  return { jobs: jobs.slice(0, 30) };
}
