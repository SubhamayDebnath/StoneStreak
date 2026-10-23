import { useRouter } from 'expo-router';
import { LayoutGrid } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { HabitCard } from '@/components/HabitCard';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { fromDateKey } from '@/lib/date';
import { haptics } from '@/lib/haptics';
import { getCurrentStreak } from '@/lib/streak';
import { useHabitStore } from '@/store/habitStore';
import { useTodayStore } from '@/store/todayStore';
import { Habit } from '@/types';

export function HabitsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const habits = useHabitStore((s) => s.habits);
  const doneMap = useHabitStore((s) => s.done);
  const reorderHabits = useHabitStore((s) => s.reorderHabits);
  const todayKey = useTodayStore((s) => s.today);

  const today = useMemo(() => fromDateKey(todayKey), [todayKey]);
  const streaks = useMemo(() => {
    const s: Record<string, number> = {};
    for (const h of habits) s[h.id] = getCurrentStreak(h, doneMap, today);
    return s;
  }, [habits, doneMap, today]);

  const onReorder = useCallback(
    ({ from, to }: ReorderableListReorderEvent) => {
      haptics.light();
      const next = reorderItems(habits, from, to);
      reorderHabits(next.map((h) => h.id)).catch(() => {});
    },
    [habits, reorderHabits],
  );

  const openNew = useCallback(() => router.push('/habit'), [router]);

  const renderItem = useCallback(
    ({ item }: { item: Habit }) => (
      <HabitCard habit={item} streak={streaks[item.id] ?? 0} />
    ),
    [streaks],
  );

  const keyExtractor = useCallback((h: Habit) => h.id, []);

  return (
    <Screen title="Habits">
      <GestureHandlerRootView style={styles.flex}>
        <ReorderableList
          data={habits}
          keyExtractor={keyExtractor}
          onReorder={onReorder}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 130 },
          ]}
          ListEmptyComponent={
            <EmptyState
              Icon={LayoutGrid}
              title="No habits yet"
              text="Tap the + button to create your first habit."
            />
          }
          ListFooterComponent={
            habits.length > 1 ? (
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Hold and drag a habit to reorder
              </Text>
            ) : null
          }
        />
        <Fab onPress={openNew} />
      </GestureHandlerRootView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingTop: 4 },
  hint: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 13,
    fontWeight: '500',
  },
});
