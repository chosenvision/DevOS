import { notFound } from "next/navigation";

import { requireUser } from "@/services/auth";
import { getResume } from "@/services/queries/career";
import { ResumePrintView } from "@/components/career/resume-print-view";

export default async function ResumePrintPage({ params }: PageProps<"/print/resume/[id]">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const resume = await getResume(supabase, user.id, id);

  if (!resume) notFound();

  return (
    <div className="min-h-svh bg-neutral-100 p-8 print:bg-white print:p-0">
      <ResumePrintView resume={resume} />
    </div>
  );
}
