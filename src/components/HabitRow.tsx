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
import { showToast } from '@/lib/toast';
import { Habit } from '@/types';

interface Props {
  habit: Habit;
  date: string;
  completed: boolean;
  count: number;
  streak?: number;
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
      if (nowDone) {
        haptics.success();
        showToast(`${habit.name} completed!`);
      } else {
        haptics.light();
      }
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
    }
  };

  const onChange = async (delta: number) => {
    try {
      const nowDone = await changeCount(habit.id, date, delta);
      if (delta > 0 && nowDone && !completed) {
        haptics.success();
        showToast(`Goal reached for ${habit.name}!`);
      } else {
        haptics.light();
      }
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
    }
  };

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/habit-detail', params: { id: habit.id } })
      }
      style={[
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <HabitIcon name={habit.icon} color={habit.color} size={42} />

      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color: colors.text,
            },
          ]}
        >
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

      {isCount ? (
        <View style={styles.counter}>
          <Pressable
            onPress={() => onChange(-1)}
            disabled={count === 0}
            hitSlop={8}
            style={[
              styles.circleBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.cardSubtle,
                opacity: count === 0 ? 0.35 : 1,
              },
            ]}
            accessibilityLabel={`Decrease count for ${habit.name}`}
          >
            <Minus size={14} color={colors.text} strokeWidth={2.5} />
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
              {
                borderColor: colors.border,
                backgroundColor: colors.cardSubtle,
              },
            ]}
            accessibilityLabel={`Increase count for ${habit.name}`}
          >
            <Plus size={14} color={colors.text} strokeWidth={2.5} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={onToggle}
          hitSlop={10}
          accessibilityLabel={`Mark ${habit.name} as ${completed ? 'incomplete' : 'complete'}`}
          style={[
            styles.check,
            {
              borderColor: completed ? habit.color : colors.border,
              backgroundColor: completed ? habit.color : 'transparent',
            },
          ]}
        >
          {completed && <Check size={16} color="#FFFFFF" strokeWidth={3.2} />}
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
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 13,
    marginBottom: 10,
  },
  info: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },

  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  circleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    minWidth: 42,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
