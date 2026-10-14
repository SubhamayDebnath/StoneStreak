import { useRouter } from 'expo-router';
import { CalendarCheck, CircleCheck } from 'lucide-react-native';
import { FlatList, StyleSheet } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { HabitRow } from '@/components/HabitRow';
import { ProgressHeader } from '@/components/ProgressHeader';
import { Screen } from '@/components/Screen';
import { useTodayHabits } from '@/hooks/useTodayHabits';
import { useHabitStore } from '@/store/habitStore';

export function TodayScreen() {
  const router = useRouter();
  const { date, dateKey, list, streaks, done, total, hasAnyHabits } =
    useTodayHabits();
  const doneMap = useHabitStore((s) => s.done);
  const counts = useHabitStore((s) => s.counts);

  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen title="Today">
      <FlatList
        data={list}
        // Rows read these maps, so tell the list to redraw when they change
        extraData={{ doneMap, counts }}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <ProgressHeader dateLabel={dateLabel} done={done} total={total} />
        }
        renderItem={({ item }) => {
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
        }}
        ListEmptyComponent={
          hasAnyHabits ? (
            <EmptyState
              Icon={CalendarCheck}
              title="Nothing scheduled today"
              text="Enjoy your day off."
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
  content: { padding: 16, paddingTop: 8, paddingBottom: 110 },
});
