import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Printer } from "lucide-react";

import { requireUser } from "@/services/auth";
import { getResume } from "@/services/queries/career";
import { ResumeEditor } from "@/components/career/resume-editor";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: PageProps<"/career/resume/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Resume ${id} — DevOS` };
}

export default async function ResumeDetailPage({ params }: PageProps<"/career/resume/[id]">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const resume = await getResume(supabase, user.id, id);

  if (!resume) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{resume.name}</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/print/resume/${resume.id}`} target="_blank">
            <Printer className="size-3.5" /> Print / Export PDF
          </Link>
        </Button>
      </div>
      <ResumeEditor resume={resume} />
    </div>
  );
}
