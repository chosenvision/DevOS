import type { SupabaseClient } from "@supabase/supabase-js";

import { computeCurrentStreak, computeLongestStreak, daysAgo } from "@/lib/analytics";
import type { Goal, Habit, HabitEntry } from "@/types/database";

export interface HabitWithStats extends Habit {
  entries: HabitEntry[];
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export async function getHabits(supabase: SupabaseClient, userId: string): Promise<HabitWithStats[]> {
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("sort_order");

  if (!habits || habits.length === 0) return [];

  const since = daysAgo(365).toISOString().slice(0, 10);
  const { data: entries } = await supabase
    .from("habit_entries")
    .select("*")
    .in("habit_id", habits.map((h) => h.id))
    .gte("entry_date", since);

  return habits.map((h) => {
    const habitEntries = (entries ?? []).filter((e) => e.habit_id === h.id);
    const dates = habitEntries.map((e) => e.entry_date);
    const last90 = dates.filter((d) => new Date(d) >= daysAgo(90));

    return {
      ...h,
      entries: habitEntries as HabitEntry[],
      currentStreak: computeCurrentStreak(dates),
      longestStreak: computeLongestStreak(dates),
      completionRate: Math.round((last90.length / 90) * 100),
    };
  });
}

export async function getGoals(supabase: SupabaseClient, userId: string): Promise<Goal[]> {
  const { data } = await supabase
    .from("goals")
    .select("*, milestones:goal_milestones(*)")
    .eq("user_id", userId)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("sort_order", { foreignTable: "goal_milestones", ascending: true });
  return (data as unknown as Goal[]) ?? [];
}
