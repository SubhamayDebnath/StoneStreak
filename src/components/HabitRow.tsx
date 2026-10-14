import { useRouter } from 'expo-router';
import { Bell, Check, Flame, Minus, Plus } from 'lucide-react-native';
import { memo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { HabitIcon } from '@/components/HabitIcon';
import { useTheme } from '@/hooks/useTheme';
import { formatTime, scheduleLabel } from '@/lib/date';
import { errorMessage } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useHabitStore } from '@/store/habitStore';
import { Habit } from '@/types';

interface Props {
  habit: Habit;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  /** How many times it was logged today (count habits) */
  count: number;
  streak: number;
}

function HabitRowBase({ habit, date, completed, count, streak }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const toggle = useHabitStore((s) => s.toggleCompletion);
  const changeCount = useHabitStore((s) => s.changeCount);
  const isCount = habit.trackingType === 'count';

  const onToggle = async () => {
    try {
      const nowDone = await toggle(habit.id, date);
      if (nowDone) haptics.success();
      else haptics.light();
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
    }
  };

  const onChange = async (delta: number) => {
    try {
      const nowDone = await changeCount(habit.id, date, delta);
      if (delta > 0 && nowDone && !completed) haptics.success();
      else haptics.light();
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
    }
  };

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/habit-detail', params: { id: habit.id } })
      }
      style={[styles.row, { backgroundColor: colors.card }]}
    >
      <View style={{ opacity: completed ? 0.55 : 1 }}>
        <HabitIcon name={habit.icon} color={habit.color} />
      </View>

      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color: colors.text,
              textDecorationLine: completed ? 'line-through' : 'none',
              opacity: completed ? 0.55 : 1,
            },
          ]}
        >
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
          {habit.reminderTime && (
            <View style={styles.inline}>
              <Bell size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {formatTime(habit.reminderTime)}
              </Text>
            </View>
          )}
          {streak > 0 && (
            <View style={styles.inline}>
              <Flame size={12} color="#F59E0B" />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {streak}
              </Text>
            </View>
          )}
        </View>
      </View>

      {isCount ? (
        <View style={styles.counter}>
          <Pressable
            onPress={() => onChange(-1)}
            disabled={count === 0}
            hitSlop={8}
            style={[
              styles.circleBtn,
              { borderColor: habit.color, opacity: count === 0 ? 0.35 : 1 },
            ]}
          >
            <Minus size={16} color={habit.color} strokeWidth={3} />
          </Pressable>

          <Text
            style={[
              styles.countText,
              { color: completed ? habit.color : colors.text },
            ]}
          >
            {count}/{habit.target}
          </Text>

          <Pressable
            onPress={() => onChange(1)}
            hitSlop={8}
            style={[
              styles.circleBtn,
              { borderColor: habit.color, backgroundColor: habit.color },
            ]}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={3} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={onToggle}
          hitSlop={10}
          style={[
            styles.check,
            {
              borderColor: habit.color,
              backgroundColor: completed ? habit.color : 'transparent',
            },
          ]}
        >
          {completed && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
        </Pressable>
      )}
    </Pressable>
  );
}

export const HabitRow = memo(HabitRowBase);

const styles = StyleSheet.create({
  row: {
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
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  circleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
});
