/** Pure helpers for streaks, productivity scoring, and date bucketing — no I/O. */

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Longest run of consecutive days (ending today or yesterday) present in `dates`. */
export function computeCurrentStreak(dates: string[]): number {
  const daySet = new Set(dates.map((d) => d.slice(0, 10)));
  if (daySet.size === 0) return 0;

  const today = new Date();
  let cursor = new Date(today);

  if (!daySet.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!daySet.has(toDateKey(cursor))) return 0;
  }

  let streak = 0;
  while (daySet.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function computeLongestStreak(dates: string[]): number {
  const days = Array.from(new Set(dates.map((d) => d.slice(0, 10)))).sort();
  if (days.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }

  return longest;
}

export interface ProductivityInputs {
  taskCompletionRate: number; // 0-100: tasks completed vs due, this week
  codingConsistency: number; // 0-100: days coded / 7
  learningConsistency: number; // 0-100: days studied / 7
  projectProgress: number; // 0-100: avg progress of active projects
  goalCompletion: number; // 0-100: goals on track this period
}

/** Weighted, informational-only score. Never punitive — floors at 0, never negative. */
export function computeProductivityScore(inputs: ProductivityInputs): number {
  const weights: Record<keyof ProductivityInputs, number> = {
    taskCompletionRate: 0.25,
    codingConsistency: 0.25,
    learningConsistency: 0.15,
    projectProgress: 0.2,
    goalCompletion: 0.15,
  };

  const score = (Object.keys(weights) as (keyof ProductivityInputs)[]).reduce(
    (sum, key) => sum + inputs[key] * weights[key],
    0
  );

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return toDateKey(da) === toDateKey(db);
}

/** Buckets a list of {date, value} points into a fixed range of daily labels, summing values per day. */
export function bucketByDay<T>(
  items: T[],
  getDate: (item: T) => string,
  getValue: (item: T) => number,
  rangeDays: number
): { date: string; label: string; value: number }[] {
  const buckets = new Map<string, number>();
  const labels: { date: string; label: string }[] = [];

  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const key = toDateKey(d);
    buckets.set(key, 0);
    labels.push({ date: key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
  }

  for (const item of items) {
    const key = getDate(item).slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + getValue(item));
    }
  }

  return labels.map(({ date, label }) => ({ date, label, value: buckets.get(date) ?? 0 }));
}
