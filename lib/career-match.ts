import type { CareerProfile, EmploymentType, JobListing, MatchRecommendation, WorkMode } from "@/types/database";

export interface MatchSubScores {
  skills: number;
  title: number;
  location: number;
  salary: number;
}

export interface MatchResult {
  score: number;
  subScores: MatchSubScores;
  why: string[];
  missing: string[];
  recommendation: MatchRecommendation;
}

type ProfileInput = Pick<
  CareerProfile,
  | "skills"
  | "preferred_roles"
  | "preferred_locations"
  | "excluded_companies"
  | "excluded_keywords"
  | "remote_ok"
  | "hybrid_ok"
  | "onsite_ok"
  | "min_salary"
  | "target_salary"
  | "employment_types"
>;

type ListingInput = Pick<
  JobListing,
  "title" | "company_name" | "skills" | "location" | "work_mode" | "employment_type" | "salary_min" | "salary_max" | "description"
>;

const norm = (s: string) => s.trim().toLowerCase();
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function skillsMatch(profileSkills: string[], listingSkills: string[]) {
  const profileSet = new Set(profileSkills.map(norm));
  const requested = listingSkills.map(norm).filter(Boolean);

  if (requested.length === 0) {
    return { score: 60, matched: [] as string[], missing: [] as string[] };
  }

  const matched = listingSkills.filter((s) => profileSet.has(norm(s)));
  const missing = listingSkills.filter((s) => !profileSet.has(norm(s)));
  const score = Math.round((matched.length / requested.length) * 100);
  return { score, matched, missing };
}

function titleMatch(preferredRoles: string[], title: string) {
  if (preferredRoles.length === 0) return { score: 70, matchedRole: null as string | null };

  const t = norm(title);
  for (const role of preferredRoles) {
    const r = norm(role);
    if (t === r) return { score: 100, matchedRole: role };
    if (t.includes(r) || r.includes(t)) return { score: 90, matchedRole: role };
  }

  const titleWords = new Set(t.split(/\s+/).filter((w) => w.length > 2));
  let bestOverlap = 0;
  let bestRole: string | null = null;
  for (const role of preferredRoles) {
    const roleWords = norm(role).split(/\s+/).filter((w) => w.length > 2);
    const overlap = roleWords.filter((w) => titleWords.has(w)).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestRole = role;
    }
  }

  if (bestOverlap === 0) return { score: 30, matchedRole: null };
  return { score: clamp(40 + bestOverlap * 20, 40, 85), matchedRole: bestRole };
}

function locationMatch(profile: ProfileInput, workMode: WorkMode | null, location: string | null) {
  if (!workMode) return { score: 60, note: null as string | null };

  const allowed = { remote: profile.remote_ok, hybrid: profile.hybrid_ok, onsite: profile.onsite_ok }[workMode];
  if (!allowed) return { score: 10, note: `You've marked ${workMode} roles as not a fit` };

  if (workMode === "remote") return { score: 100, note: "Remote — matches your preference" };
  if (workMode === "hybrid") return { score: 90, note: "Hybrid — matches your preference" };

  // onsite: check against preferred locations
  if (profile.preferred_locations.length === 0) return { score: 65, note: null };
  const loc = location ? norm(location) : "";
  const hit = profile.preferred_locations.some((p) => loc.includes(norm(p)) || norm(p).includes(loc));
  return hit
    ? { score: 100, note: `On-site in ${location} — one of your preferred locations` }
    : { score: 40, note: location ? `On-site in ${location}, outside your preferred locations` : null };
}

function salaryMatch(profile: ProfileInput, salaryMin: number | null, salaryMax: number | null) {
  if (salaryMin == null && salaryMax == null) return { score: 60, note: null as string | null };

  const effMax = salaryMax ?? salaryMin!;
  const effMin = salaryMin ?? salaryMax!;

  if (profile.min_salary != null && effMax < profile.min_salary) {
    return { score: 10, note: `Below your minimum of $${profile.min_salary.toLocaleString()}` };
  }

  if (profile.target_salary != null) {
    if (effMin >= profile.target_salary) {
      return { score: 100, note: "Meets or exceeds your target salary" };
    }
    if (profile.min_salary != null) {
      const range = profile.target_salary - profile.min_salary;
      const pos = range > 0 ? (effMax - profile.min_salary) / range : 1;
      return { score: Math.round(clamp(50 + pos * 50, 50, 95)), note: null };
    }
    return effMax >= profile.target_salary * 0.85
      ? { score: 80, note: "Close to your target salary" }
      : { score: 55, note: "Below your target salary" };
  }

  return { score: profile.min_salary != null ? 75 : 60, note: null };
}

function employmentTypeAllowed(profileTypes: EmploymentType[], listingType: EmploymentType | null) {
  if (!listingType) return true;
  return profileTypes.length === 0 || profileTypes.includes(listingType);
}

function scoreToRecommendation(score: number): MatchRecommendation {
  if (score >= 85) return "excellent_match";
  if (score >= 70) return "strong_match";
  if (score >= 50) return "possible_match";
  return "weak_match";
}

/**
 * Deterministic, explainable job match — no AI provider required. Compares
 * structured fields only (skills/title/location/salary/employment type),
 * so it works the moment a job is entered, without waiting on an LLM
 * integration. AI-assisted analysis of free-text job descriptions is a
 * later phase once an AI provider is configured (see Settings → AI).
 */
export function computeJobMatch(profile: ProfileInput, listing: ListingInput): MatchResult {
  const excludedCompany = profile.excluded_companies.some((c) => norm(c) === norm(listing.company_name));
  const excludedKeyword = profile.excluded_keywords.find((kw) => {
    const k = norm(kw);
    return norm(listing.title).includes(k) || (listing.description ?? "").toLowerCase().includes(k);
  });

  const skills = skillsMatch(profile.skills, listing.skills);
  const title = titleMatch(profile.preferred_roles, listing.title);
  const location = locationMatch(profile, listing.work_mode, listing.location);
  const salary = salaryMatch(profile, listing.salary_min, listing.salary_max);

  const subScores: MatchSubScores = {
    skills: skills.score,
    title: title.score,
    location: location.score,
    salary: salary.score,
  };

  let score = Math.round(subScores.skills * 0.4 + subScores.title * 0.2 + subScores.location * 0.2 + subScores.salary * 0.2);

  const why: string[] = [];
  const missing: string[] = [];

  if (excludedCompany) {
    score = Math.min(score, 15);
    missing.push(`${listing.company_name} is on your excluded companies list`);
  }
  if (excludedKeyword) {
    score = Math.min(score, 20);
    missing.push(`Contains "${excludedKeyword}", one of your excluded keywords`);
  }
  if (!employmentTypeAllowed(profile.employment_types, listing.employment_type)) {
    score = Math.min(score, 30);
    missing.push(`${listing.employment_type?.replace("_", "-")} doesn't match your preferred employment types`);
  }

  if (skills.matched.length > 0) {
    why.push(`Matches ${skills.matched.length} of ${skills.matched.length + skills.missing.length} requested skills: ${skills.matched.slice(0, 4).join(", ")}`);
  }
  if (title.matchedRole) why.push(`Title aligns with your target role: ${title.matchedRole}`);
  if (location.note) why.push(location.note);
  if (salary.note && salary.score >= 70) why.push(salary.note);

  if (skills.missing.length > 0) {
    missing.push(`Requested but not in your profile: ${skills.missing.slice(0, 4).join(", ")}`);
  }
  if (salary.note && salary.score < 70) missing.push(salary.note);
  if (title.score < 50) missing.push("Title doesn't closely match any of your preferred roles");

  if (why.length === 0) why.push("Limited data to compare — add more detail to your Career Profile for a sharper match.");

  return {
    score: clamp(score, 0, 100),
    subScores,
    why,
    missing,
    recommendation: scoreToRecommendation(clamp(score, 0, 100)),
  };
}
