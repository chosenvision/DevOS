import type { SupabaseClient } from "@supabase/supabase-js";

import { daysAgo } from "@/lib/analytics";
import type {
  Assessment,
  CareerProfile,
  Company,
  Contact,
  JobApplication,
  JobListing,
  JobSearch,
  Resume,
  InterviewQuestion,
  StarResponse,
  CodingProblem,
} from "@/types/database";

export async function getApplications(supabase: SupabaseClient, userId: string): Promise<JobApplication[]> {
  const { data } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return (data as JobApplication[]) ?? [];
}

export async function getCompanies(supabase: SupabaseClient, userId: string): Promise<Company[]> {
  const { data } = await supabase.from("companies").select("*").eq("user_id", userId).order("name");
  return (data as Company[]) ?? [];
}

export async function getContacts(supabase: SupabaseClient, userId: string): Promise<Contact[]> {
  const { data } = await supabase
    .from("contacts")
    .select("*, company:companies(id, name)")
    .eq("user_id", userId)
    .order("name");
  return (data as unknown as Contact[]) ?? [];
}

export async function getResumes(supabase: SupabaseClient, userId: string): Promise<Resume[]> {
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return (data as Resume[]) ?? [];
}

export async function getResume(supabase: SupabaseClient, userId: string, id: string): Promise<Resume | null> {
  const { data } = await supabase.from("resumes").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
  return (data as Resume) ?? null;
}

export async function getInterviewQuestions(
  supabase: SupabaseClient,
  userId: string
): Promise<InterviewQuestion[]> {
  const { data } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as InterviewQuestion[]) ?? [];
}

export async function getStarResponses(supabase: SupabaseClient, userId: string): Promise<StarResponse[]> {
  const { data } = await supabase
    .from("star_responses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as StarResponse[]) ?? [];
}

export async function getCodingProblems(supabase: SupabaseClient, userId: string): Promise<CodingProblem[]> {
  const { data } = await supabase
    .from("coding_problems")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as CodingProblem[]) ?? [];
}

export interface ApplicationAnalytics {
  submitted: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  avgResponseDays: number | null;
  bestSource: string | null;
}

export async function getApplicationAnalytics(
  supabase: SupabaseClient,
  userId: string
): Promise<ApplicationAnalytics> {
  const since90 = daysAgo(90).toISOString();
  const { data } = await supabase
    .from("job_applications")
    .select("status, source, date_applied, created_at, updated_at")
    .eq("user_id", userId)
    .gte("created_at", since90);

  const apps = data ?? [];
  const submitted = apps.filter((a) => a.date_applied || a.status !== "saved").length;
  const responded = apps.filter((a) => !["saved", "preparing", "applied"].includes(a.status)).length;
  const interviewed = apps.filter((a) => ["interview", "final_interview", "offer"].includes(a.status)).length;
  const offered = apps.filter((a) => a.status === "offer").length;

  const responseDays = apps
    .filter((a) => a.date_applied && !["saved", "preparing", "applied"].includes(a.status))
    .map((a) => (new Date(a.updated_at).getTime() - new Date(a.date_applied!).getTime()) / 86400000)
    .filter((d) => d >= 0);

  const sourceCounts = new Map<string, { total: number; success: number }>();
  for (const a of apps) {
    if (!a.source) continue;
    const entry = sourceCounts.get(a.source) ?? { total: 0, success: 0 };
    entry.total += 1;
    if (["interview", "final_interview", "offer"].includes(a.status)) entry.success += 1;
    sourceCounts.set(a.source, entry);
  }
  const bestSource = [...sourceCounts.entries()]
    .filter(([, v]) => v.total >= 1)
    .sort((a, b) => b[1].success / b[1].total - a[1].success / a[1].total)[0];

  return {
    submitted,
    responseRate: submitted > 0 ? Math.round((responded / submitted) * 100) : 0,
    interviewRate: submitted > 0 ? Math.round((interviewed / submitted) * 100) : 0,
    offerRate: submitted > 0 ? Math.round((offered / submitted) * 100) : 0,
    avgResponseDays:
      responseDays.length > 0
        ? Math.round((responseDays.reduce((s, d) => s + d, 0) / responseDays.length) * 10) / 10
        : null,
    bestSource: bestSource ? bestSource[0] : null,
  };
}

export interface SourceStat {
  source: string;
  total: number;
  interviews: number;
  offers: number;
  interviewRate: number;
}

/** Per-source breakdown (LinkedIn, referral, company site, ...) for Source Analytics. */
export async function getSourceAnalytics(supabase: SupabaseClient, userId: string): Promise<SourceStat[]> {
  const { data } = await supabase.from("job_applications").select("source, status").eq("user_id", userId);
  const apps = (data ?? []).filter((a) => a.source);

  const bySource = new Map<string, { total: number; interviews: number; offers: number }>();
  for (const a of apps) {
    const entry = bySource.get(a.source!) ?? { total: 0, interviews: 0, offers: 0 };
    entry.total += 1;
    if (["interview", "final_interview", "offer"].includes(a.status)) entry.interviews += 1;
    if (a.status === "offer") entry.offers += 1;
    bySource.set(a.source!, entry);
  }

  return [...bySource.entries()]
    .map(([source, stats]) => ({
      source,
      ...stats,
      interviewRate: stats.total > 0 ? Math.round((stats.interviews / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export interface ApplicationFunnel {
  stage: string;
  label: string;
  count: number;
}

/** Counts per stage of the Saved → Applied → Assessment → Interview → Final → Offer funnel. */
export async function getApplicationFunnel(supabase: SupabaseClient, userId: string): Promise<ApplicationFunnel[]> {
  const { data } = await supabase.from("job_applications").select("status").eq("user_id", userId);
  const apps = data ?? [];
  const stages: { stage: string; label: string }[] = [
    { stage: "saved", label: "Saved" },
    { stage: "applied", label: "Applied" },
    { stage: "assessment", label: "Assessment" },
    { stage: "interview", label: "Interview" },
    { stage: "final_interview", label: "Final Interview" },
    { stage: "offer", label: "Offer" },
  ];
  return stages.map((s) => ({ ...s, count: apps.filter((a) => a.status === s.stage).length }));
}

// -- Career Agent (Phase 1) ----------------------------------------------

export async function getCareerProfile(supabase: SupabaseClient, userId: string): Promise<CareerProfile | null> {
  const { data } = await supabase.from("career_profiles").select("*").eq("user_id", userId).maybeSingle();
  return (data as CareerProfile) ?? null;
}

export async function getJobSearches(supabase: SupabaseClient, userId: string): Promise<JobSearch[]> {
  const { data } = await supabase
    .from("job_searches")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as JobSearch[]) ?? [];
}

export async function getJobListings(supabase: SupabaseClient, userId: string): Promise<JobListing[]> {
  const { data } = await supabase
    .from("job_listings")
    .select("*")
    .eq("user_id", userId)
    .order("match_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return (data as JobListing[]) ?? [];
}

export async function getJobListing(supabase: SupabaseClient, userId: string, id: string): Promise<JobListing | null> {
  const { data } = await supabase.from("job_listings").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
  return (data as JobListing) ?? null;
}

export interface InterviewApplication extends JobApplication {
  company?: Pick<Company, "id" | "name" | "notes" | "culture_notes"> | null;
}

/** Applications in an interview stage — the real, already-scheduled data an Interview Command Center needs. */
export async function getInterviewApplications(
  supabase: SupabaseClient,
  userId: string
): Promise<InterviewApplication[]> {
  const { data } = await supabase
    .from("job_applications")
    .select("*, company:companies(id, name, notes, culture_notes)")
    .eq("user_id", userId)
    .in("status", ["interview", "final_interview"])
    .order("interview_date", { ascending: true, nullsFirst: false });
  return (data as unknown as InterviewApplication[]) ?? [];
}

export async function getAssessments(supabase: SupabaseClient, userId: string): Promise<Assessment[]> {
  const { data } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", userId)
    .order("deadline", { ascending: true, nullsFirst: false });
  return (data as Assessment[]) ?? [];
}

export interface CareerPriority {
  id: string;
  label: string;
  href: string;
  urgency: "overdue" | "today" | "soon";
}

export interface CareerCommandCenterData {
  activeApplications: number;
  applicationsThisWeek: number;
  interviewsScheduled: number;
  highMatchJobs: number;
  offers: number;
  followUpsDue: number;
  priorities: CareerPriority[];
}

/** Aggregate read for the Career Command Center — today's priorities + KPI counts, all from real stored data. */
export async function getCareerCommandCenterData(
  supabase: SupabaseClient,
  userId: string
): Promise<CareerCommandCenterData> {
  const weekAgo = daysAgo(7).toISOString();
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 86400000);

  const [appsRes, listingsRes] = await Promise.all([
    supabase
      .from("job_applications")
      .select("id, position, company_name, status, next_follow_up_at, interview_date, created_at")
      .eq("user_id", userId),
    supabase
      .from("job_listings")
      .select("id, title, company_name, match_score, status")
      .eq("user_id", userId)
      .gte("match_score", 80)
      .eq("status", "saved"),
  ]);

  const apps = appsRes.data ?? [];
  const listings = listingsRes.data ?? [];

  const activeApplications = apps.filter(
    (a) => !["rejected", "withdrawn", "offer"].includes(a.status)
  ).length;
  const applicationsThisWeek = apps.filter((a) => a.created_at >= weekAgo).length;
  const interviewsScheduled = apps.filter(
    (a) => a.interview_date && new Date(a.interview_date) >= now
  ).length;
  const offers = apps.filter((a) => a.status === "offer").length;

  const priorities: CareerPriority[] = [];

  for (const a of apps) {
    if (!a.next_follow_up_at) continue;
    const due = new Date(a.next_follow_up_at);
    if (due > in3Days) continue;
    priorities.push({
      id: `followup-${a.id}`,
      label: `Follow up on ${a.position} at ${a.company_name}`,
      href: "/career/applications",
      urgency: due < now ? "overdue" : due.toDateString() === now.toDateString() ? "today" : "soon",
    });
  }

  for (const a of apps) {
    if (!a.interview_date) continue;
    const date = new Date(a.interview_date);
    if (date < now || date > in3Days) continue;
    priorities.push({
      id: `interview-${a.id}`,
      label: `Prepare for ${a.position} interview at ${a.company_name}`,
      href: "/career/interviews",
      urgency: date.toDateString() === now.toDateString() ? "today" : "soon",
    });
  }

  if (listings.length > 0) {
    priorities.push({
      id: "high-match-jobs",
      label: `Review ${listings.length} new high-match job${listings.length === 1 ? "" : "s"}`,
      href: "/career/job-search",
      urgency: "soon",
    });
  }

  const urgencyRank = { overdue: 0, today: 1, soon: 2 };
  priorities.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);

  return {
    activeApplications,
    applicationsThisWeek,
    interviewsScheduled,
    highMatchJobs: listings.length,
    offers,
    followUpsDue: priorities.filter((p) => p.id.startsWith("followup-")).length,
    priorities: priorities.slice(0, 8),
  };
}
