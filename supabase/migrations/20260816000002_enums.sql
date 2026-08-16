-- DevOS enumerated types, grouped by module.

-- Projects
create type project_status as enum ('idea', 'planning', 'in_progress', 'testing', 'completed', 'on_hold', 'archived');
create type project_priority as enum ('low', 'medium', 'high', 'urgent');
create type milestone_status as enum ('not_started', 'in_progress', 'completed');
create type bug_severity as enum ('low', 'medium', 'high', 'critical');
create type bug_status as enum ('open', 'in_progress', 'resolved', 'wont_fix');

-- Tasks
create type task_status as enum ('backlog', 'todo', 'in_progress', 'blocked', 'review', 'completed');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type recurrence_frequency as enum ('daily', 'weekly', 'monthly', 'custom');

-- Time tracking
create type time_entry_category as enum ('project', 'learning', 'interview_prep', 'other');
create type time_entry_source as enum ('timer', 'manual', 'pomodoro');

-- Learning
create type course_status as enum ('not_started', 'in_progress', 'completed', 'paused');
create type skill_level as enum ('learning', 'beginner', 'intermediate', 'advanced', 'confident');
create type roadmap_step_status as enum ('completed', 'current', 'upcoming');
create type resource_status as enum ('unread', 'reading', 'completed', 'saved_for_later');

-- Career
create type work_mode as enum ('remote', 'hybrid', 'onsite');
create type application_status as enum (
  'saved', 'preparing', 'applied', 'assessment', 'interview',
  'final_interview', 'offer', 'rejected', 'withdrawn'
);
create type interview_category as enum (
  'behavioral', 'technical', 'sql', 'frontend', 'backend',
  'system_design', 'hr', 'company_specific'
);
create type difficulty_level as enum ('easy', 'medium', 'hard');

-- Notes / snippets / ideas
create type note_type as enum ('general', 'project', 'learning', 'interview', 'meeting', 'code', 'idea');
create type idea_status as enum ('inbox', 'researching', 'validated', 'planned', 'building', 'archived');

-- Calendar / habits / goals
create type calendar_event_type as enum (
  'task', 'deadline', 'interview', 'study_session', 'course_deadline', 'goal', 'reminder', 'custom'
);
create type habit_frequency as enum ('daily', 'weekly', 'custom');
create type goal_period as enum ('weekly', 'monthly', 'quarterly', 'yearly');
create type goal_status as enum ('not_started', 'in_progress', 'completed', 'missed');

-- Misc
create type notification_type as enum (
  'task_due', 'project_deadline', 'interview_reminder', 'course_deadline',
  'goal_milestone', 'follow_up', 'habit_streak', 'system'
);
