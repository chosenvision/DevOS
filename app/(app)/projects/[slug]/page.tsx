import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getProjectBySlug } from "@/services/queries/projects";
import { ProjectHeader } from "@/components/projects/project-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/projects/tabs/overview-tab";
import { TasksTab } from "@/components/projects/tabs/tasks-tab";
import { MilestonesTab } from "@/components/projects/tabs/milestones-tab";
import { NotesTab } from "@/components/projects/tabs/notes-tab";
import { FilesTab } from "@/components/projects/tabs/files-tab";
import { BugsTab } from "@/components/projects/tabs/bugs-tab";
import { ActivityTab } from "@/components/projects/tabs/activity-tab";
import { SettingsTab } from "@/components/projects/tabs/settings-tab";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} — DevOS` };
}

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const { supabase, user } = await requireUser();
  const detail = await getProjectBySlug(supabase, user.id, slug);

  if (!detail) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <ProjectHeader project={detail.project} />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="bugs">Bugs</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="overview">
            <OverviewTab detail={detail} />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksTab projectId={detail.project.id} tasks={detail.tasks} />
          </TabsContent>
          <TabsContent value="milestones">
            <MilestonesTab projectId={detail.project.id} milestones={detail.milestones} />
          </TabsContent>
          <TabsContent value="notes">
            <NotesTab projectId={detail.project.id} />
          </TabsContent>
          <TabsContent value="files">
            <FilesTab projectId={detail.project.id} userId={user.id} />
          </TabsContent>
          <TabsContent value="bugs">
            <BugsTab projectId={detail.project.id} bugs={detail.bugs} />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityTab activity={detail.activity} />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab project={detail.project} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
