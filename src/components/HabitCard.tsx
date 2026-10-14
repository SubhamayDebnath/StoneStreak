import { useRouter } from 'expo-router';
import { Bell, GripVertical, Hash } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';
import { HabitIcon } from '@/components/HabitIcon';
import { useTheme } from '@/hooks/useTheme';
import { formatTime, scheduleLabel } from '@/lib/date';
import { Habit } from '@/types';

function HabitCardBase({ habit }: { habit: Habit }) {
  const { colors } = useTheme();
  const router = useRouter();
  const drag = useReorderableDrag();

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/habit-detail', params: { id: habit.id } })
      }
      onLongPress={drag}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <HabitIcon name={habit.icon} color={habit.color} />

      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
          {habit.name}
        </Text>
        {habit.description ? (
          <Text
            numberOfLines={1}
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {habit.description}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {scheduleLabel(habit)}
          </Text>
          {habit.trackingType === 'count' && (
            <View style={styles.inline}>
              <Hash size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                Goal {habit.target}
              </Text>
            </View>
          )}
          {habit.reminderTime && (
            <View style={styles.inline}>
              <Bell size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {formatTime(habit.reminderTime)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Pressable
        onPressIn={drag}
        hitSlop={10}
        accessibilityLabel={`Reorder ${habit.name}`}
      >
        <GripVertical size={22} color={colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
}

export const HabitCard = memo(HabitCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '600' },
  description: { fontSize: 13, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12 },
});
