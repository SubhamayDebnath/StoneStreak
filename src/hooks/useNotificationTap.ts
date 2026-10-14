import { useRouter } from 'expo-router';
import type { NotificationResponse } from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { getNotificationsModule } from '@/lib/notifications';
import { useHabitStore } from '@/store/habitStore';

const Notifications = getNotificationsModule();

// Always the same hook on every render, so the rules of hooks hold
const useLastResponse: () => NotificationResponse | null | undefined =
  Notifications?.useLastNotificationResponse ?? (() => undefined);

/** Opens the habit when its reminder notification is tapped (also from a closed app). */
export function useNotificationTap() {
  const router = useRouter();
  const loaded = useHabitStore((s) => s.loaded);
  const habits = useHabitStore((s) => s.habits);
  const response = useLastResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!Notifications || !response || !loaded) return;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER)
      return;

    const n = response.notification;
    // Repeating reminders share one identifier, so add the delivery time
    const tapId = `${n.request.identifier}:${n.date}`;
    if (handled.current === tapId) return;

    const habitId = n.request.content.data?.habitId;
    if (typeof habitId !== 'string') return;
    if (!habits.some((h) => h.id === habitId)) return; // deleted or archived

    handled.current = tapId;
    router.push({ pathname: '/habit-detail', params: { id: habitId } });
  }, [response, loaded, habits, router]);
}
