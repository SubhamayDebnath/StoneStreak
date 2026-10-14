// 0 = Sunday ... 6 = Saturday (matches JS Date.getDay())
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ScheduleType = 'daily' | 'weekdays';

/** check = done / not done, count = reach a daily number (can go above it) */
export type TrackingType = 'check' | 'count';

export interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  /** Key from HABIT_ICONS in lib/habitIcons.ts */
  icon: string;
  trackingType: TrackingType;
  /** Daily goal for count habits. Always 1 for check habits. */
  target: number;
  scheduleType: ScheduleType;
  /** Only used when scheduleType === 'weekdays' */
  weekdays: Weekday[];
  /** "HH:mm" in 24h format, or null for no reminder */
  reminderTime: string | null;
  sortOrder: number;
  createdAt: string; // ISO string
  /** Hidden from Today/Habits, history kept. Missing in old backups = false. */
  archived?: boolean;
}

export type NewHabit = Omit<
  Habit,
  'id' | 'sortOrder' | 'createdAt' | 'archived'
>;

export interface Completion {
  habitId: string;
  date: string; // "YYYY-MM-DD" (local date)
  /** How many times it was done that day (1 for check habits) */
  count: number;
}

export interface BackupFile {
  app: 'StoneStreak';
  version: 1;
  exportedAt: string;
  habits: Habit[];
  completions: Completion[];
}

export interface HeatCell {
  date: string;
  done: number;
  scheduled: number;
  /** Raw count for that day (per-habit maps only, can be above the goal) */
  count?: number;
}
