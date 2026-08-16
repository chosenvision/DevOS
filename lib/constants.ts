import type {
  ApplicationStatus,
  BugSeverity,
  CourseStatus,
  DifficultyLevel,
  GoalStatus,
  IdeaStatus,
  Priority,
  ProjectStatus,
  SkillLevel,
  TaskStatus,
} from "@/types/database";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Idea",
  planning: "Planning",
  in_progress: "In Progress",
  testing: "Testing",
  completed: "Completed",
  on_hold: "On Hold",
  archived: "Archived",
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "idea",
  "planning",
  "in_progress",
  "testing",
  "completed",
  "on_hold",
];

export const PROJECT_STATUS_BADGE: Record<ProjectStatus, "default" | "secondary" | "outline" | "success" | "warning" | "muted"> = {
  idea: "muted",
  planning: "outline",
  in_progress: "default",
  testing: "warning",
  completed: "success",
  on_hold: "secondary",
  archived: "muted",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  review: "Review",
  completed: "Completed",
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "blocked",
  "review",
  "completed",
];

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_BADGE: Record<Priority, "muted" | "outline" | "warning" | "destructive"> = {
  low: "muted",
  medium: "outline",
  high: "warning",
  urgent: "destructive",
};

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  paused: "Paused",
};

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  learning: "Learning",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  confident: "Confident",
};

export const SKILL_LEVEL_ORDER: SkillLevel[] = [
  "learning",
  "beginner",
  "intermediate",
  "advanced",
  "confident",
];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: "Saved",
  preparing: "Preparing",
  applied: "Applied",
  assessment: "Assessment",
  interview: "Interview",
  final_interview: "Final Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "saved",
  "preparing",
  "applied",
  "assessment",
  "interview",
  "final_interview",
  "offer",
  "rejected",
  "withdrawn",
];

export const BUG_SEVERITY_LABEL: Record<BugSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const IDEA_STATUS_LABEL: Record<IdeaStatus, string> = {
  inbox: "Inbox",
  researching: "Researching",
  validated: "Validated",
  planned: "Planned",
  building: "Building",
  archived: "Archived",
};

export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  missed: "Missed",
};

export const TECH_STACK_SUGGESTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Tailwind CSS",
  "Supabase",
  "PostgreSQL",
  "Python",
  "PHP",
  "Laravel",
  "Vue",
  "Express",
  "GraphQL",
  "Redis",
  "Docker",
];

export const COURSE_PLATFORMS = [
  "Udemy",
  "Coursera",
  "YouTube",
  "FreeCodeCamp",
  "Documentation",
  "University",
  "Other",
];

export const CODING_PLATFORMS = ["LeetCode", "HackerRank", "Codewars", "CodeSignal", "Other"];
