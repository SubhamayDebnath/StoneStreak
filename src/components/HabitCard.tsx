import { useRouter } from 'expo-router';
import { Bell, Flame, GripVertical, Hash } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';
import { HabitIcon } from '@/components/HabitIcon';
import { useTheme } from '@/hooks/useTheme';
import { formatTime, scheduleLabel } from '@/lib/date';
import { Habit } from '@/types';

interface Props {
  habit: Habit;
  streak?: number;
}

function HabitCardBase({ habit, streak }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const drag = useReorderableDrag();

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/habit-detail', params: { id: habit.id } })
      }
      onLongPress={drag}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <HabitIcon name={habit.icon} color={habit.color} size={42} />

      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
          {habit.name}
        </Text>

        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {scheduleLabel(habit)}
          </Text>
          {typeof streak === 'number' && streak > 0 && (
            <View style={styles.inline}>
              <Flame size={12} color={colors.streak} fill={colors.streak} />
              <Text
                style={[
                  styles.metaText,
                  { color: colors.streak, fontWeight: '600' },
                ]}
              >
                {streak}
              </Text>
            </View>
          )}
          {habit.trackingType === 'count' && (
            <View style={styles.inline}>
              <Hash size={11} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                Goal {habit.target}
              </Text>
            </View>
          )}
          {habit.reminderTime && (
            <View style={styles.inline}>
              <Bell size={11} color={colors.textSecondary} />
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
        style={styles.dragHandle}
        accessibilityLabel={`Reorder ${habit.name}`}
      >
        <GripVertical size={20} color={colors.textSecondary} />
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
    borderWidth: 1,
    padding: 13,
    marginBottom: 10,
    gap: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, fontWeight: '500' },
  dragHandle: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
