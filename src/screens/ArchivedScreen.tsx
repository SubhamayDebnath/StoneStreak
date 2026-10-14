import { Stack } from 'expo-router';
import { Archive, RotateCcw, Trash2 } from 'lucide-react-native';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { HabitIcon } from '@/components/HabitIcon';
import { useTheme } from '@/hooks/useTheme';
import { errorMessage } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useHabitStore } from '@/store/habitStore';
import { Habit } from '@/types';

export function ArchivedScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const archived = useHabitStore((s) => s.archived);
  const restoreHabit = useHabitStore((s) => s.restoreHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);

  const onRestore = async (habit: Habit) => {
    try {
      await restoreHabit(habit.id);
      haptics.success();
    } catch (e) {
      Alert.alert('Could not restore', errorMessage(e));
    }
  };

  const onDelete = (habit: Habit) => {
    haptics.warning();
    Alert.alert(
      'Delete permanently?',
      `"${habit.name}" and its history will be removed. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              haptics.heavy();
              await removeHabit(habit.id);
            } catch (e) {
              Alert.alert('Could not delete', errorMessage(e));
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Archived habits' }} />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {archived.length === 0 ? (
          <EmptyState
            Icon={Archive}
            title="No archived habits"
            text="Archive a habit from its page to hide it without losing its history."
          />
        ) : (
          archived.map((habit) => (
            <View
              key={habit.id}
              style={[styles.card, { backgroundColor: colors.card }]}
            >
              <HabitIcon name={habit.icon} color={habit.color} size={44} />
              <Text
                numberOfLines={1}
                style={[styles.name, { color: colors.text }]}
              >
                {habit.name}
              </Text>

              <Pressable
                onPress={() => onRestore(habit)}
                hitSlop={8}
                accessibilityLabel={`Restore ${habit.name}`}
                style={[styles.action, { backgroundColor: colors.primary }]}
              >
                <RotateCcw size={18} color={colors.onPrimary} />
              </Pressable>
              <Pressable
                onPress={() => onDelete(habit)}
                hitSlop={8}
                accessibilityLabel={`Delete ${habit.name}`}
                style={[styles.action, { backgroundColor: colors.dangerSolid }]}
              >
                <Trash2 size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  name: { flex: 1, fontSize: 17, fontWeight: '600' },
  action: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
