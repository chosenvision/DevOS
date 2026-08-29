import type {
  ApplicationStatus,
  AssessmentStatus,
  AssessmentType,
  BugSeverity,
  CourseStatus,
  CrmClientStatus,
  CrmDealStage,
  CrmActivityType,
  CrmItemUnit,
  InvoiceStatus,
  ExpenseCategory,
  PoStatus,
  PayrollStatus,
  TimeOffType,
  TimeOffStatus,
  DifficultyLevel,
  EmploymentType,
  GoalStatus,
  IdeaStatus,
  JobListingStatus,
  MatchRecommendation,
  Priority,
  ProjectStatus,
  SkillLevel,
  TaskStatus,
} from "@/types/database";

export type Tone = "primary" | "success" | "warning" | "destructive" | "accent";

export const TONE_CLASSES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-[oklch(0.4_0.12_155)] dark:text-success",
  warning: "bg-warning/15 text-[oklch(0.45_0.13_75)] dark:text-warning",
  destructive: "bg-destructive/10 text-destructive",
  accent: "bg-accent text-accent-foreground",
};

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

export const CRM_CLIENT_STATUS_LABEL: Record<CrmClientStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const CRM_CLIENT_STATUS_BADGE: Record<CrmClientStatus, "default" | "muted" | "outline"> = {
  active: "default",
  inactive: "outline",
  archived: "muted",
};

export const CRM_DEAL_STAGE_LABEL: Record<CrmDealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const CRM_DEAL_STAGE_ORDER: CrmDealStage[] = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export const CRM_ACTIVITY_TYPE_LABEL: Record<CrmActivityType, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
};

export const CRM_ITEM_UNIT_LABEL: Record<CrmItemUnit, string> = {
  hour: "Per hour",
  fixed: "Fixed price",
  item: "Per item",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

export const INVOICE_STATUS_BADGE: Record<InvoiceStatus, "muted" | "outline" | "success" | "destructive"> = {
  draft: "muted",
  sent: "outline",
  paid: "success",
  overdue: "destructive",
  void: "muted",
};

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  software: "Software",
  hardware: "Hardware",
  travel: "Travel",
  marketing: "Marketing",
  contractor: "Contractor",
  office: "Office",
  other: "Other",
};

export const EXPENSE_CATEGORY_ORDER: ExpenseCategory[] = [
  "software",
  "hardware",
  "travel",
  "marketing",
  "contractor",
  "office",
  "other",
];

export const PO_STATUS_LABEL: Record<PoStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  received: "Received",
  cancelled: "Cancelled",
};

export const PO_STATUS_BADGE: Record<PoStatus, "muted" | "outline" | "success" | "destructive"> = {
  draft: "muted",
  sent: "outline",
  received: "success",
  cancelled: "destructive",
};

export const PAYROLL_STATUS_LABEL: Record<PayrollStatus, string> = {
  draft: "Draft",
  recorded: "Recorded",
};

export const TIME_OFF_TYPE_LABEL: Record<TimeOffType, string> = {
  vacation: "Vacation",
  sick: "Sick",
  unpaid: "Unpaid",
};

export const TIME_OFF_STATUS_LABEL: Record<TimeOffStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
};

export const TIME_OFF_STATUS_BADGE: Record<TimeOffStatus, "outline" | "success" | "destructive"> = {
  pending: "outline",
  approved: "success",
  denied: "destructive",
};

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

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  internship: "Internship",
};

export const JOB_LISTING_STATUS_LABEL: Record<JobListingStatus, string> = {
  new: "New",
  saved: "Saved",
  dismissed: "Dismissed",
  applied: "Applied",
};

export const MATCH_RECOMMENDATION_LABEL: Record<MatchRecommendation, string> = {
  excellent_match: "Excellent Match",
  strong_match: "Strong Match",
  possible_match: "Possible Match",
  weak_match: "Weak Match",
};

export const MATCH_RECOMMENDATION_TONE: Record<MatchRecommendation, Tone> = {
  excellent_match: "success",
  strong_match: "primary",
  possible_match: "warning",
  weak_match: "destructive",
};

export const ASSESSMENT_TYPE_LABEL: Record<AssessmentType, string> = {
  coding: "Coding",
  sql: "SQL",
  excel: "Excel",
  case_study: "Case Study",
  personality: "Personality",
  video_interview: "Video Interview",
  take_home_project: "Take-Home Project",
  other: "Other",
};

export const ASSESSMENT_STATUS_LABEL: Record<AssessmentStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  submitted: "Submitted",
  passed: "Passed",
  failed: "Failed",
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
