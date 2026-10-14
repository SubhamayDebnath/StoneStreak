import { useRouter } from 'expo-router';
import { LayoutGrid } from 'lucide-react-native';
import { StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { HabitCard } from '@/components/HabitCard';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/lib/haptics';
import { useHabitStore } from '@/store/habitStore';
import { Habit } from '@/types';

export function HabitsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const habits = useHabitStore((s) => s.habits);
  const reorderHabits = useHabitStore((s) => s.reorderHabits);

  const onReorder = ({ from, to }: ReorderableListReorderEvent) => {
    haptics.light();
    const next = reorderItems(habits, from, to);
    reorderHabits(next.map((h) => h.id)).catch(() => {});
  };

  const openNew = () => router.push('/habit');

  return (
    <Screen title="Habits">
      <GestureHandlerRootView style={styles.flex}>
        <ReorderableList
          data={habits}
          keyExtractor={(h: Habit) => h.id}
          onReorder={onReorder}
          renderItem={({ item }) => <HabitCard habit={item} />}
          contentContainerStyle={styles.content}
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
                Long-press a habit and drag to reorder
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
  content: { padding: 16, paddingTop: 8, paddingBottom: 110 },
  hint: { textAlign: 'center', marginTop: 12, fontSize: 13 },
});
