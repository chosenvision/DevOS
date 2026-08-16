"use client";

import * as React from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Resume } from "@/types/database";

export function ResumePrintView({ resume }: { resume: Resume }) {
  const { content } = resume;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="size-4" /> Print / Save as PDF
        </Button>
      </div>

      <div className="space-y-6 bg-white p-10 text-black shadow-sm print:shadow-none">
        <header className="space-y-1 border-b border-neutral-300 pb-4">
          <h1 className="text-2xl font-bold">{content.personal?.name || resume.name}</h1>
          <p className="text-sm text-neutral-600">
            {[content.personal?.email, content.personal?.phone, content.personal?.location].filter(Boolean).join(" · ")}
          </p>
        </header>

        {content.summary && (
          <section>
            <h2 className="mb-1 text-xs font-bold tracking-wide text-neutral-500 uppercase">Summary</h2>
            <p className="text-sm">{content.summary}</p>
          </section>
        )}

        {content.experience && content.experience.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-bold tracking-wide text-neutral-500 uppercase">Experience</h2>
            <div className="space-y-3">
              {content.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm font-medium">
                    <span>{exp.title} · {exp.company}</span>
                    <span className="text-neutral-500">{[exp.start, exp.end].filter(Boolean).join(" – ")}</span>
                  </div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-neutral-700">
                    {exp.bullets.filter(Boolean).map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.projects && content.projects.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-bold tracking-wide text-neutral-500 uppercase">Projects</h2>
            <div className="space-y-2">
              {content.projects.map((p, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium">
                    {p.name}
                    {p.tech && p.tech.length > 0 && <span className="font-normal text-neutral-500"> — {p.tech.join(", ")}</span>}
                  </p>
                  <p className="text-neutral-700">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.education && content.education.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-bold tracking-wide text-neutral-500 uppercase">Education</h2>
            <div className="space-y-1">
              {content.education.map((ed, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{ed.degree} · {ed.school}</span>
                  <span className="text-neutral-500">{[ed.start, ed.end].filter(Boolean).join(" – ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.skills && content.skills.length > 0 && (
          <section>
            <h2 className="mb-1 text-xs font-bold tracking-wide text-neutral-500 uppercase">Skills</h2>
            <p className="text-sm">{content.skills.join(", ")}</p>
          </section>
        )}

        {content.certifications && content.certifications.length > 0 && (
          <section>
            <h2 className="mb-1 text-xs font-bold tracking-wide text-neutral-500 uppercase">Certifications</h2>
            <ul className="list-disc space-y-0.5 pl-5 text-sm">
              {content.certifications.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {content.achievements && content.achievements.length > 0 && (
          <section>
            <h2 className="mb-1 text-xs font-bold tracking-wide text-neutral-500 uppercase">Achievements</h2>
            <ul className="list-disc space-y-0.5 pl-5 text-sm">
              {content.achievements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
