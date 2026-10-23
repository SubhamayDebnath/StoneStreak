import { useRouter } from 'expo-router';
import { CalendarCheck, CircleCheck } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { HabitRow } from '@/components/HabitRow';
import { ProgressHeader } from '@/components/ProgressHeader';
import { Screen } from '@/components/Screen';
import { useTodayHabits } from '@/hooks/useTodayHabits';
import { useHabitStore } from '@/store/habitStore';
import { Habit } from '@/types';

export function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { date, dateKey, list, streaks, done, total, hasAnyHabits } =
    useTodayHabits();
  const doneMap = useHabitStore((s) => s.done);
  const counts = useHabitStore((s) => s.counts);

  const dateLabel = useMemo(
    () =>
      date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    [date],
  );

  const renderItem = useCallback(
    ({ item }: { item: Habit }) => {
      const k = `${item.id}|${dateKey}`;
      return (
        <HabitRow
          habit={item}
          date={dateKey}
          completed={!!doneMap[k]}
          count={counts[k] ?? 0}
          streak={streaks[item.id] ?? 0}
        />
      );
    },
    [dateKey, doneMap, counts, streaks],
  );

  const keyExtractor = useCallback((h: Habit) => h.id, []);

  return (
    <Screen title="Today">
      <FlatList
        data={list}
        extraData={{ doneMap, counts }}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 130 },
        ]}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={
          <ProgressHeader dateLabel={dateLabel} done={done} total={total} />
        }
        renderItem={renderItem}
        ListEmptyComponent={
          hasAnyHabits ? (
            <EmptyState
              Icon={CalendarCheck}
              title="Nothing scheduled today"
              text="Enjoy your day off or relax."
            />
          ) : (
            <EmptyState
              Icon={CircleCheck}
              title="No habits yet"
              text="Tap the + button to create your first habit."
            />
          )
        }
      />

      <Fab onPress={() => router.push('/habit')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4 },
});
