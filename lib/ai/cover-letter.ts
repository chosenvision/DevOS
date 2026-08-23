import { generateText } from "@/lib/ai/client";
import type { CareerProfile, ResumeContent } from "@/types/database";

interface CoverLetterInput {
  profile: Pick<CareerProfile, "professional_summary" | "skills">;
  resumeSummary: string | undefined;
  resumeExperience: ResumeContent["experience"];
  applicantName: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string | null;
}

const BANNED_PHRASES = [
  "I am thrilled to apply",
  "I am writing to express my interest",
  "I believe my unique blend",
  "leveraging my expertise",
  "I am passionate about",
  "Thank you for taking the time to reach out",
  "I am delighted to confirm",
  "please do not hesitate to reach out",
];

const SYSTEM_PROMPT = `You write cover letters that sound like a real person wrote them in five minutes, not like generated corporate copy.

Ground rules:
- Only use facts given to you (the person's real experience, skills, summary). Never invent achievements, metrics, or experience.
- Write like a normal professional email: direct, warm, specific, no throat-clearing.
- 3-4 short paragraphs. No walls of text.
- Open with something specific to the role or company, not a generic opener.
- Never use any of these phrases or their close equivalents: ${BANNED_PHRASES.map((p) => `"${p}"`).join(", ")}.
- No more than one exclamation point in the whole letter, if any.
- End simply — no "I look forward to hearing from you" clichés stacked with three other sign-off lines.
- Sign off with just the person's first name.

Return ONLY the letter text — no subject line, no "Dear Hiring Manager" boilerplate unless it fits naturally, no commentary.`;

export async function generateCoverLetter(input: CoverLetterInput): Promise<string> {
  const experienceLines = (input.resumeExperience ?? [])
    .slice(0, 4)
    .map((e) => `- ${e.title} at ${e.company}${e.start ? ` (${e.start}${e.end ? `–${e.end}` : "–present"})` : ""}: ${e.bullets.slice(0, 3).join("; ")}`)
    .join("\n");

  const prompt = `Write a cover letter for ${input.applicantName}, applying to ${input.jobTitle} at ${input.companyName}.

Their background:
Summary: ${input.profile.professional_summary ?? input.resumeSummary ?? "(not provided)"}
Key skills: ${input.profile.skills.join(", ") || "(not provided)"}
Relevant experience:
${experienceLines || "(not provided)"}

Job description:
${input.jobDescription ?? "(not provided — write generally about fit based on their background and the role title)"}`;

  const text = await generateText({ system: SYSTEM_PROMPT, prompt, maxTokens: 1024 });
  return text.trim();
}
