// Hand-authored domain types mirroring supabase/migrations/*.sql.
// Row shapes match what @supabase/supabase-js returns (snake_case).

export type ProjectStatus =
  | "idea"
  | "planning"
  | "in_progress"
  | "testing"
  | "completed"
  | "on_hold"
  | "archived";
export type Priority = "low" | "medium" | "high" | "urgent";
export type MilestoneStatus = "not_started" | "in_progress" | "completed";
export type BugSeverity = "low" | "medium" | "high" | "critical";
export type BugStatus = "open" | "in_progress" | "resolved" | "wont_fix";

export type TaskStatus = "backlog" | "todo" | "in_progress" | "blocked" | "review" | "completed";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "custom";

export type TimeEntryCategory = "project" | "learning" | "interview_prep" | "other";
export type TimeEntrySource = "timer" | "manual" | "pomodoro";

export type CourseStatus = "not_started" | "in_progress" | "completed" | "paused";
export type SkillLevel = "learning" | "beginner" | "intermediate" | "advanced" | "confident";
export type RoadmapStepStatus = "completed" | "current" | "upcoming";
export type ResourceStatus = "unread" | "reading" | "completed" | "saved_for_later";

export type WorkMode = "remote" | "hybrid" | "onsite";
export type ApplicationStatus =
  | "saved"
  | "preparing"
  | "applied"
  | "assessment"
  | "interview"
  | "final_interview"
  | "offer"
  | "rejected"
  | "withdrawn";
export type InterviewCategory =
  | "behavioral"
  | "technical"
  | "sql"
  | "frontend"
  | "backend"
  | "system_design"
  | "hr"
  | "company_specific";
export type DifficultyLevel = "easy" | "medium" | "hard";

export type NoteType = "general" | "project" | "learning" | "interview" | "meeting" | "code" | "idea";
export type IdeaStatus = "inbox" | "researching" | "validated" | "planned" | "building" | "archived";

export type CalendarEventType =
  | "task"
  | "deadline"
  | "interview"
  | "study_session"
  | "course_deadline"
  | "goal"
  | "reminder"
  | "custom";
export type HabitFrequency = "daily" | "weekly" | "custom";
export type GoalPeriod = "weekly" | "monthly" | "quarterly" | "yearly";
export type GoalStatus = "not_started" | "in_progress" | "completed" | "missed";

export type NotificationType =
  | "task_due"
  | "project_deadline"
  | "interview_reminder"
  | "course_deadline"
  | "goal_milestone"
  | "follow_up"
  | "habit_streak"
  | "system";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  location: string | null;
  bio: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
  timezone: string;
  xp: number;
  level: number;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  notify_task_due: boolean;
  notify_project_deadline: boolean;
  notify_interview_reminder: boolean;
  notify_follow_up: boolean;
  notify_habit_streak: boolean;
  ai_enabled: boolean;
  ai_model: string | null;
  pomodoro_focus_minutes: number;
  pomodoro_short_break_minutes: number;
  pomodoro_long_break_minutes: number;
  pomodoro_sessions_before_long_break: number;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  category: string | null;
  is_client_project: boolean;
  client_name: string | null;
  start_date: string | null;
  deadline: string | null;
  progress: number;
  tech_stack: string[];
  repo_url: string | null;
  live_url: string | null;
  cover_image_url: string | null;
  notes: string | null;
  goals: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: MilestoneStatus;
  progress: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Bug {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  severity: BugSeverity;
  priority: Priority;
  status: BugStatus;
  screenshot_url: string | null;
  steps_to_reproduce: string | null;
  expected_result: string | null;
  actual_result: string | null;
  solution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string | null;
  project_id: string | null;
  action: string;
  message: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  milestone_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  category: string | null;
  tags: string[];
  due_date: string | null;
  start_date: string | null;
  estimated_minutes: number | null;
  actual_minutes: number;
  is_recurring: boolean;
  recurrence_frequency: RecurrenceFrequency | null;
  recurrence_rule: Record<string, unknown> | null;
  recurrence_parent_id: string | null;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  project?: Pick<Project, "id" | "name" | "slug"> | null;
}

export interface TaskSubtask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string | null;
  task_id: string | null;
  category: TimeEntryCategory;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  is_running: boolean;
  source: TimeEntrySource;
  created_at: string;
  project?: Pick<Project, "id" | "name"> | null;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  instructor: string | null;
  url: string | null;
  status: CourseStatus;
  progress: number;
  total_lessons: number | null;
  completed_lessons: number;
  estimated_duration_minutes: number | null;
  start_date: string | null;
  target_completion_date: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  level: SkillLevel;
  hours_practiced: number;
  last_practiced_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoadmapStep {
  id: string;
  roadmap_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: RoadmapStepStatus;
  resource_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Resource {
  id: string;
  user_id: string;
  title: string;
  url: string | null;
  category: string | null;
  tags: string[];
  description: string | null;
  status: ResourceStatus;
  rating: number | null;
  notes: string | null;
  date_added: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  date_earned: string | null;
  expiration_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  skills: string[];
  certificate_file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  careers_url: string | null;
  notes: string | null;
  culture_notes: string | null;
  salary_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  company_id: string | null;
  name: string;
  role: string | null;
  linkedin_url: string | null;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  company?: Pick<Company, "id" | "name"> | null;
}

export interface JobApplication {
  id: string;
  user_id: string;
  company_id: string | null;
  company_name: string;
  position: string;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  work_mode: WorkMode | null;
  job_url: string | null;
  date_applied: string | null;
  source: string | null;
  recruiter_name: string | null;
  contact_email: string | null;
  status: ApplicationStatus;
  notes: string | null;
  resume_id: string | null;
  cover_letter_used: string | null;
  next_follow_up_at: string | null;
  interview_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  name: string;
  target_job: string | null;
  is_ats_mode: boolean;
  is_portfolio_mode: boolean;
  content: ResumeContent;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeContent {
  personal?: { name?: string; email?: string; phone?: string; location?: string; links?: string[] };
  summary?: string;
  education?: { school: string; degree: string; start?: string; end?: string; notes?: string }[];
  experience?: { company: string; title: string; start?: string; end?: string; bullets: string[] }[];
  projects?: { name: string; description: string; tech?: string[]; url?: string }[];
  skills?: string[];
  certifications?: string[];
  achievements?: string[];
}

export interface InterviewQuestion {
  id: string;
  user_id: string;
  category: InterviewCategory;
  question: string;
  answer: string | null;
  notes: string | null;
  difficulty: DifficultyLevel;
  confidence_level: number;
  last_practiced_at: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StarResponse {
  id: string;
  user_id: string;
  title: string;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CodingProblem {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  url: string | null;
  difficulty: DifficultyLevel;
  topic: string[];
  status: TaskStatus;
  attempts: number;
  time_taken_minutes: number | null;
  solution: string | null;
  notes: string | null;
  review_date: string | null;
  last_attempted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteFolder {
  id: string;
  user_id: string;
  name: string;
  parent_folder_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  project_id: string | null;
  folder_id: string | null;
  title: string;
  content: string;
  type: NoteType;
  tags: string[];
  is_pinned: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CodeSnippet {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  language: string;
  description: string | null;
  code: string;
  tags: string[];
  category: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  potential: number | null;
  difficulty: DifficultyLevel | null;
  estimated_build_time: string | null;
  tech_stack: string[];
  status: IdeaStatus;
  converted_project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  website: string | null;
  category: string | null;
  tags: string[];
  date_saved: string;
}

export interface PortfolioProject {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  images: string[];
  tech_stack: string[];
  role: string | null;
  problem: string | null;
  solution: string | null;
  outcome: string | null;
  github_url: string | null;
  live_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GithubConnection {
  user_id: string;
  github_username: string;
  avatar_url: string | null;
  public_repos: number | null;
  followers: number | null;
  connected_at: string;
  last_synced_at: string | null;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  start_at: string;
  end_at: string | null;
  all_day: boolean;
  related_type: string | null;
  related_id: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  target_frequency: HabitFrequency;
  target_days_per_week: number | null;
  color: string;
  icon: string | null;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  entry_date: string;
  is_completed: boolean;
  note: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  period: GoalPeriod;
  start_date: string;
  deadline: string | null;
  progress: number;
  status: GoalStatus;
  related_project_id: string | null;
  related_skill_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  what_worked_on: string | null;
  what_learned: string | null;
  blockers: string | null;
  tomorrow_plan: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  key: string;
  title: string;
  description: string;
  icon: string | null;
  xp_reward: number;
  criteria: Record<string, unknown>;
  sort_order: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
  achievement?: Achievement;
}
