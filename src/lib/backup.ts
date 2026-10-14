import { normalizeIcon } from '@/lib/habitIcons';
import { habitPalette } from '@/theme';
import { BackupFile, Completion, Habit, Weekday } from '@/types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const MAX_COUNT = 99999;

export function buildBackup(
  habits: Habit[],
  completions: Completion[],
): BackupFile {
  return {
    app: 'StoneStreak',
    version: 1,
    exportedAt: new Date().toISOString(),
    habits,
    completions,
  };
}

function parseHabit(raw: any, index: number): Habit | null {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || !raw.id) return null;
  if (typeof raw.name !== 'string' || !raw.name.trim()) return null;

  // Colors are used as "#RRGGBB" + opacity suffix, so anything else would break the UI
  const color =
    typeof raw.color === 'string' && COLOR_RE.test(raw.color)
      ? raw.color
      : habitPalette[0];

  // Unique, sorted week days
  const weekdays: Weekday[] = Array.isArray(raw.weekdays)
    ? ([
        ...new Set(
          raw.weekdays.filter(
            (d: any) => Number.isInteger(d) && d >= 0 && d <= 6,
          ),
        ),
      ].sort((a: any, b: any) => a - b) as Weekday[])
    : [];

  // "Selected days" with no days would never show up anywhere, so treat it as daily
  const scheduleType =
    raw.scheduleType === 'weekdays' && weekdays.length > 0
      ? 'weekdays'
      : 'daily';

  const trackingType = raw.trackingType === 'count' ? 'count' : 'check';
  const target =
    trackingType === 'count' && Number.isInteger(raw.target) && raw.target >= 1
      ? Math.min(raw.target, 9999)
      : 1;

  const createdAt =
    typeof raw.createdAt === 'string' &&
    !Number.isNaN(Date.parse(raw.createdAt))
      ? raw.createdAt
      : new Date().toISOString();

  return {
    id: raw.id,
    name: raw.name.trim().slice(0, 60),
    description:
      typeof raw.description === 'string'
        ? raw.description.trim().slice(0, 200)
        : '',
    color,
    icon: normalizeIcon(raw.icon),
    trackingType,
    target,
    scheduleType,
    weekdays: scheduleType === 'weekdays' ? weekdays : [],
    reminderTime:
      typeof raw.reminderTime === 'string' && TIME_RE.test(raw.reminderTime)
        ? raw.reminderTime
        : null,
    sortOrder: Number.isInteger(raw.sortOrder) ? raw.sortOrder : index,
    createdAt,
    // Old backups have no "archived" field = active habit
    archived: raw.archived === true,
  };
}

/** Validates a backup JSON string. Throws a readable error if it is invalid. */
export function parseBackup(text: string): {
  habits: Habit[];
  completions: Completion[];
} {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }

  if (
    data?.app !== 'StoneStreak' ||
    !Array.isArray(data.habits) ||
    !Array.isArray(data.completions)
  ) {
    throw new Error('This is not a StoneStreak backup file.');
  }

  // Parse habits, skip invalid ones and duplicate ids
  const seen = new Set<string>();
  const habits: Habit[] = [];
  data.habits.forEach((h: any, i: number) => {
    const parsed = parseHabit(h, i);
    if (parsed && !seen.has(parsed.id)) {
      seen.add(parsed.id);
      habits.push(parsed);
    }
  });
  habits.sort((a, b) => a.sortOrder - b.sortOrder);
  habits.forEach((h, i) => (h.sortOrder = i));

  // Keep only completions that point to an imported habit
  const completions: Completion[] = data.completions
    .filter(
      (c: any) =>
        c &&
        typeof c.habitId === 'string' &&
        typeof c.date === 'string' &&
        DATE_RE.test(c.date) &&
        seen.has(c.habitId),
    )
    .map((c: any) => ({
      habitId: c.habitId,
      date: c.date,
      count:
        Number.isInteger(c.count) && c.count >= 1
          ? Math.min(c.count, MAX_COUNT)
          : 1,
    }));

  return { habits, completions };
}
