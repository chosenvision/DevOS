import { generateJson } from "@/lib/ai/client";
import type { ResumeContent } from "@/types/database";

export interface TailorResult {
  content: ResumeContent;
  changeSummary: string[];
}

interface TailorInput {
  source: ResumeContent;
  jobTitle: string;
  companyName: string;
  jobDescription: string | null;
  jobSkills: string[];
}

const SYSTEM_PROMPT = `You are helping a job seeker tailor their existing resume for a specific job. You will be given their resume content as JSON and a job description.

HARD RULES — violating any of these makes your response unusable:
1. Never invent work experience, employers, job titles, or dates that aren't in the source resume.
2. Never invent metrics, numbers, or results not already present in a bullet.
3. Never add a skill, certification, project, or achievement that isn't already in the source resume.
4. Never change a company name, degree, school, or date range.

What you MAY do:
- Reorder experience entries, bullets within an entry, projects, and skills to put the most relevant ones first.
- Reword existing bullets for clarity or to better match the job's terminology — but the underlying fact/claim must stay the same.
- Rewrite the professional summary to emphasize relevant existing experience (still using only real facts from the resume).
- Omit less-relevant items if it improves focus (but don't fabricate omissions as if they don't exist elsewhere — just leave them out of this version).

Return JSON with exactly this shape:
{
  "content": { same shape as the input resume content, tailored },
  "changeSummary": ["short bullet describing one specific change", ...]
}`;

export async function tailorResume(input: TailorInput): Promise<TailorResult> {
  const prompt = `SOURCE RESUME (the only facts you may use):
${JSON.stringify(input.source, null, 2)}

TARGET JOB:
Title: ${input.jobTitle}
Company: ${input.companyName}
Requested skills: ${input.jobSkills.join(", ") || "(none listed)"}
Description: ${input.jobDescription ?? "(no description provided)"}

Tailor the resume for this job following the rules exactly.`;

  const result = await generateJson<TailorResult>({ system: SYSTEM_PROMPT, prompt, maxTokens: 4096 });
  validateNoInvention(input.source, result.content);
  return result;
}

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Defensive check, not just a prompt instruction — the "never invent"
 * rule is load-bearing (a fabricated employer or skill on someone's
 * resume is a real-world harm), so we verify the model actually followed
 * it rather than trusting it. Throws if the tailored version introduces
 * anything not present in the source.
 */
function validateNoInvention(source: ResumeContent, tailored: ResumeContent) {
  const sourceCompanies = new Set((source.experience ?? []).map((e) => norm(e.company)));
  const invented = (tailored.experience ?? []).filter((e) => !sourceCompanies.has(norm(e.company)));
  if (invented.length > 0) {
    throw new Error(`AI introduced an employer not in your resume (${invented[0].company}) — discarded for safety.`);
  }

  const sourceSchools = new Set((source.education ?? []).map((e) => norm(e.school)));
  const investedEdu = (tailored.education ?? []).filter((e) => !sourceSchools.has(norm(e.school)));
  if (investedEdu.length > 0) {
    throw new Error(`AI introduced a school not in your resume (${investedEdu[0].school}) — discarded for safety.`);
  }

  const sourceSkills = new Set((source.skills ?? []).map(norm));
  const investedSkills = (tailored.skills ?? []).filter((s) => !sourceSkills.has(norm(s)));
  if (investedSkills.length > 0) {
    throw new Error(`AI introduced a skill not in your resume (${investedSkills[0]}) — discarded for safety.`);
  }

  const sourceProjects = new Set((source.projects ?? []).map((p) => norm(p.name)));
  const investedProjects = (tailored.projects ?? []).filter((p) => !sourceProjects.has(norm(p.name)));
  if (investedProjects.length > 0) {
    throw new Error(`AI introduced a project not in your resume (${investedProjects[0].name}) — discarded for safety.`);
  }
}
