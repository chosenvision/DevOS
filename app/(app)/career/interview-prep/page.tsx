import type { Metadata } from "next";

import { requireUser } from "@/services/auth";
import { getInterviewQuestions, getStarResponses } from "@/services/queries/career";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InterviewQuestionsList } from "@/components/career/interview-questions-list";
import { StarBuilder } from "@/components/career/star-builder";
import { MockInterview } from "@/components/career/mock-interview";

export const metadata: Metadata = { title: "Interview Prep — DevOS" };

export default async function InterviewPrepPage() {
  const { supabase, user } = await requireUser();
  const [questions, starResponses] = await Promise.all([
    getInterviewQuestions(supabase, user.id),
    getStarResponses(supabase, user.id),
  ]);

  return (
    <Tabs defaultValue="questions">
      <TabsList>
        <TabsTrigger value="questions">Questions</TabsTrigger>
        <TabsTrigger value="star">STAR Builder</TabsTrigger>
        <TabsTrigger value="mock">Mock Interview</TabsTrigger>
      </TabsList>
      <div className="mt-4">
        <TabsContent value="questions">
          <InterviewQuestionsList questions={questions} />
        </TabsContent>
        <TabsContent value="star">
          <StarBuilder responses={starResponses} />
        </TabsContent>
        <TabsContent value="mock">
          <MockInterview questions={questions} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
