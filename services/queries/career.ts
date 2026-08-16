import type { SupabaseClient } from "@supabase/supabase-js";

import { daysAgo } from "@/lib/analytics";
import type {
  Company,
  Contact,
  JobApplication,
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
