import { addDays, fromDateKey, toDateKey } from '@/lib/date';
import {
  getBestStreak,
  getCompletionRate,
  getCurrentStreak,
} from '@/lib/streak';
import { Habit, HeatCell, Weekday } from '@/types';

type DoneMap = Record<string, true>;
type CountMap = Record<string, number>;

/** One year of heat map */
export const HEAT_DAYS = 365;

/** All habits together: how many scheduled habits were completed each day. */
export function buildOverallHeat(
  habits: Habit[],
  done: DoneMap,
  days: number,
  today: Date,
): HeatCell[] {
  const end = fromDateKey(toDateKey(today));
  const created = habits.map((h) => toDateKey(new Date(h.createdAt)));
  const cells: HeatCell[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(end, -i);
    const key = toDateKey(date);
    const dow = date.getDay() as Weekday;
    let scheduled = 0;
    let completed = 0;

    for (let j = 0; j < habits.length; j++) {
      const h = habits[j];
      if (created[j] > key) continue;
      if (h.scheduleType === 'weekdays' && !h.weekdays.includes(dow)) continue;
      scheduled++;
      if (done[`${h.id}|${key}`]) completed++;
    }
    cells.push({ date: key, done: completed, scheduled });
  }
  return cells;
}

/** One habit. For count habits the cell fills up as the count reaches the goal. */
export function buildHabitHeat(
  habit: Habit,
  counts: CountMap,
  days: number,
  today: Date,
): HeatCell[] {
  const end = fromDateKey(toDateKey(today));
  const createdKey = toDateKey(new Date(habit.createdAt));
  const goal = habit.trackingType === 'count' ? Math.max(1, habit.target) : 1;
  const cells: HeatCell[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(end, -i);
    const key = toDateKey(date);
    const dow = date.getDay() as Weekday;
    const isScheduled =
      createdKey <= key &&
      (habit.scheduleType === 'daily' || habit.weekdays.includes(dow));
    const count = counts[`${habit.id}|${key}`] ?? 0;

    cells.push({
      date: key,
      scheduled: isScheduled ? goal : 0,
      done: isScheduled ? Math.min(count, goal) : 0,
      count,
    });
  }
  return cells;
}

export interface HabitStats {
  current: number;
  best: number;
  /** 0-100, scheduled days completed since the habit was created */
  rate: number;
  /** Days the habit was completed */
  daysDone: number;
  /** Sum of all counts */
  totalCount: number;
  /** Highest count in a single day */
  bestDay: number;
}

export function getHabitStats(
  habit: Habit,
  done: DoneMap,
  counts: CountMap,
  today: Date,
): HabitStats {
  const prefix = habit.id + '|';
  let daysDone = 0;
  let totalCount = 0;
  let bestDay = 0;

  for (const k in done) if (k.startsWith(prefix)) daysDone++;
  for (const k in counts) {
    if (!k.startsWith(prefix)) continue;
    totalCount += counts[k];
    if (counts[k] > bestDay) bestDay = counts[k];
  }

  return {
    current: getCurrentStreak(habit, done, today),
    best: getBestStreak(habit, done, today),
    rate: getCompletionRate(habit, done, today),
    daysDone,
    totalCount,
    bestDay,
  };
}

export interface Overview {
  /** Longest streak that is running right now, across all habits */
  activeStreak: number;
  /** Longest streak ever, across all habits */
  bestStreak: number;
  /** 0-100, completion rate over the last 30 days */
  rate30: number;
  /** Total completed habit-days (active habits only) */
  totalCheckins: number;
}

/** `cells` is the overall heat map (oldest first, ending today). */
export function getOverview(
  habits: Habit[],
  done: DoneMap,
  today: Date,
  cells: HeatCell[],
): Overview {
  let activeStreak = 0;
  let bestStreak = 0;
  for (const h of habits) {
    activeStreak = Math.max(activeStreak, getCurrentStreak(h, done, today));
    bestStreak = Math.max(bestStreak, getBestStreak(h, done, today));
  }

  let scheduled = 0;
  let completed = 0;
  for (const cell of cells.slice(-30)) {
    scheduled += cell.scheduled;
    completed += cell.done;
  }

  // Count only the habits the rest of the overview is about (archived ones are left out)
  const activeIds = new Set(habits.map((h) => h.id));
  let totalCheckins = 0;
  for (const k in done) {
    if (activeIds.has(k.slice(0, k.indexOf('|')))) totalCheckins++;
  }

  return {
    activeStreak,
    bestStreak,
    rate30: scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100),
    totalCheckins,
  };
}
