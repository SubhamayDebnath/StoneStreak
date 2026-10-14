import { Platform } from 'react-native';
import { isScheduledOn, parseTime, toDateKey } from '@/lib/date';
import { Habit } from '@/types';

type NotificationsModule = typeof import('expo-notifications');

// Safe load: if the native module isn't in the installed build, the app still opens
let Notifications: NotificationsModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications') as NotificationsModule;
} catch {
  Notifications = null;
}

/** The notifications module, or null when the build does not include it. */
export function getNotificationsModule(): NotificationsModule | null {
  return Notifications;
}

const CHANNEL_ID = 'habit-reminders';
const MAX_DAYS = 14; // how far ahead reminders are scheduled
const MAX_TOTAL = 150; // keeps the number of scheduled alarms safe on Android

try {
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // module present but not usable; reminders are simply skipped
}

async function ensureChannel(N: NotificationsModule) {
  if (Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Habit reminders',
    importance: N.AndroidImportance.HIGH,
  });
}

async function ensurePermission(N: NotificationsModule): Promise<boolean> {
  const current = await N.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await N.requestPermissionsAsync();
  return asked.granted;
}

/** Asks for notification permission. Returns false if denied or unavailable. */
export async function requestReminderPermission(): Promise<boolean> {
  const N = Notifications;
  if (!N) return false;
  try {
    return await ensurePermission(N);
  } catch {
    return false;
  }
}

function bodyFor(habit: Habit) {
  return habit.trackingType === 'count'
    ? `Goal today: ${habit.target}`
    : 'Time to check in.';
}

interface SyncJob {
  habits: Habit[];
  enabled: boolean;
  done: Record<string, true>;
}

async function runSync({ habits, enabled, done }: SyncJob): Promise<void> {
  const N = Notifications;
  if (!N) return;

  try {
    await N.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;

    const withReminder = habits.filter((h) => !!h.reminderTime);
    if (withReminder.length === 0) return;

    if (!(await ensurePermission(N))) return;
    await ensureChannel(N);

    // Fewer days when there are many habits, so the alarm count stays safe
    const windowDays = Math.max(
      3,
      Math.min(MAX_DAYS, Math.floor(MAX_TOTAL / withReminder.length)),
    );
    const now = new Date();

    for (const habit of withReminder) {
      const { hour, minute } = parseTime(habit.reminderTime as string);
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) continue;

      for (let i = 0; i < windowDays; i++) {
        const when = new Date(now);
        when.setDate(now.getDate() + i);
        when.setHours(hour, minute, 0, 0);

        if (!isScheduledOn(habit, when)) continue;

        if (i === 0) {
          if (when.getTime() <= now.getTime()) continue; // time already passed
          if (done[`${habit.id}|${toDateKey(when)}`]) continue; // already done today
        }

        try {
          await N.scheduleNotificationAsync({
            content: {
              title: habit.name,
              body: bodyFor(habit),
              data: { habitId: habit.id },
            },
            trigger: {
              type: N.SchedulableTriggerInputTypes.DATE,
              date: when,
              channelId: CHANNEL_ID,
            },
          });
        } catch {
          // skip this reminder; the others still get scheduled
        }
      }
    }
  } catch {
    // never crash the app because of reminders
  }
}

// Syncs never overlap. Two syncs running at once would cancel each other's
// reminders half way and leave duplicates, so they run one after another and
// only the newest request is used.
let queue: Promise<void> = Promise.resolve();
let pending: SyncJob | null = null;

/**
 * Cancels everything, then (if enabled) schedules one-time reminders for the next
 * days. Today's reminder is skipped when the habit is already done today, or when
 * its time has already passed.
 *
 * `done` is habitStore's "habitId|YYYY-MM-DD" -> true map.
 */
export function syncReminders(
  habits: Habit[],
  enabled: boolean = true,
  done: Record<string, true> = {},
): Promise<void> {
  pending = { habits, enabled, done };
  queue = queue.then(async () => {
    const job = pending;
    if (!job) return; // a newer request already ran
    pending = null;
    await runSync(job);
  });
  return queue;
}
