import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Archive,
  Bell,
  Calendar,
  Check,
  CircleCheck,
  Flame,
  Hash,
  Star,
  Target,
  Trash2,
  Trophy,
} from 'lucide-react-native';
import { ReactNode, useEffect, useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitIcon } from '@/components/HabitIcon';
import { HeatMap } from '@/components/HeatMap';
import { LogPastDay } from '@/components/LogPastDay';
import { SectionLabel } from '@/components/SectionLabel';
import { StatCard } from '@/components/StatCard';
import { WeekBars } from '@/components/WeekBars';
import { useTheme } from '@/hooks/useTheme';
import { buildHabitHeat, getHabitStats, HEAT_DAYS } from '@/lib/analytics';
import { formatTime, fromDateKey, scheduleLabel } from '@/lib/date';
import { errorMessage, plural } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useHabitStore } from '@/store/habitStore';
import { useTodayStore } from '@/store/todayStore';
import { HeatCell } from '@/types';

export function HabitDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const habit = useHabitStore((s) => s.habits.find((h) => h.id === id));
  const done = useHabitStore((s) => s.done);
  const counts = useHabitStore((s) => s.counts);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const archiveHabit = useHabitStore((s) => s.archiveHabit);
  const todayKey = useTodayStore((s) => s.today);

  const today = useMemo(() => fromDateKey(todayKey), [todayKey]);
  const cells = useMemo(
    () => (habit ? buildHabitHeat(habit, counts, HEAT_DAYS, today) : []),
    [habit, counts, today],
  );
  const week = useMemo(() => cells.slice(-7), [cells]);
  const stats = useMemo(
    () => (habit ? getHabitStats(habit, done, counts, today) : null),
    [habit, done, counts, today],
  );

  // Once the habit is deleted or archived (or the id is unknown), leave this page
  useEffect(() => {
    if (habit) return;
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [habit, router]);

  if (!habit || !stats) return null;

  const isCount = habit.trackingType === 'count';
  const levelColors = [
    colors.heat0,
    habit.color + '55',
    habit.color + '88',
    habit.color + 'BB',
    habit.color,
  ];

  const describe = (cell: HeatCell) => {
    if (cell.scheduled === 0) return 'Not scheduled';
    const count = cell.count ?? 0;
    if (isCount) {
      return count > habit.target
        ? `${count} of ${habit.target} (goal beaten)`
        : `${count} of ${habit.target}`;
    }
    if (cell.done > 0) return 'Done';
    return cell.date === todayKey ? 'Not done yet' : 'Missed';
  };

  const onArchive = () => {
    haptics.light();
    Alert.alert(
      'Archive habit?',
      `"${habit.name}" will be hidden from Today and Habits, and its reminders stop. Your history is kept. Restore it from Settings > Archived habits.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              haptics.success();
              // The effect above closes this page once the habit is archived
              await archiveHabit(habit.id);
            } catch (e) {
              Alert.alert('Could not archive', errorMessage(e));
            }
          },
        },
      ],
    );
  };

  const onDelete = () => {
    haptics.warning();
    Alert.alert(
      'Delete habit?',
      `"${habit.name}" and its history will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              haptics.heavy();
              // The effect above closes this page once the habit is gone
              await removeHabit(habit.id);
            } catch (e) {
              Alert.alert('Could not delete', errorMessage(e));
            }
          },
        },
      ],
    );
  };

  const onClose = () => {
    haptics.light();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: habit.name,
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable onPress={onClose} hitSlop={10}>
              <Text
                style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}
              >
                Close
              </Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/habit', params: { id: habit.id } })
              }
              hitSlop={10}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                Edit
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* Header card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.top}>
            <HabitIcon name={habit.icon} color={habit.color} size={56} />
            <View style={styles.topText}>
              <Text style={[styles.name, { color: colors.text }]}>
                {habit.name}
              </Text>
              {habit.description ? (
                <Text
                  style={[styles.description, { color: colors.textSecondary }]}
                >
                  {habit.description}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoLine
              icon={<Calendar size={16} color={colors.textSecondary} />}
              text={scheduleLabel(habit)}
            />
            {habit.reminderTime ? (
              <InfoLine
                icon={<Bell size={16} color={colors.textSecondary} />}
                text={`Reminder at ${formatTime(habit.reminderTime)}`}
              />
            ) : null}
            <InfoLine
              icon={
                isCount ? (
                  <Hash size={16} color={colors.textSecondary} />
                ) : (
                  <Check size={16} color={colors.textSecondary} />
                )
              }
              text={
                isCount
                  ? `Count · goal ${habit.target} per day`
                  : 'Checkbox · once a day'
              }
            />
          </View>
        </View>

        {/* Statistics */}
        <SectionLabel>STATISTICS</SectionLabel>
        <View style={styles.grid}>
          <StatCard
            icon={<Flame size={22} color="#F59E0B" />}
            value={plural(stats.current, 'day')}
            label="Current streak"
          />
          <StatCard
            icon={<Trophy size={22} color={colors.primary} />}
            value={plural(stats.best, 'day')}
            label="Best streak"
          />
          <StatCard
            icon={<Target size={22} color={colors.success} />}
            value={`${stats.rate}%`}
            label="Completion rate"
          />
          <StatCard
            icon={<CircleCheck size={22} color={colors.primary} />}
            value={String(stats.daysDone)}
            label={isCount ? 'Days goal reached' : 'Total check-ins'}
          />
          {isCount && (
            <>
              <StatCard
                icon={<Hash size={22} color={habit.color} />}
                value={String(stats.totalCount)}
                label="Total count"
              />
              <StatCard
                icon={<Star size={22} color="#F59E0B" />}
                value={String(stats.bestDay)}
                label="Best day"
              />
            </>
          )}
        </View>

        {/* Last 7 days */}
        <SectionLabel>LAST 7 DAYS</SectionLabel>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <WeekBars cells={week} />
        </View>

        {/* Heat map */}
        <SectionLabel>LAST 12 MONTHS</SectionLabel>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <HeatMap
            cells={cells}
            levelColors={levelColors}
            legend
            describe={describe}
          />
        </View>

        {/* Log a missed day */}
        <LogPastDay habit={habit} />

        {/* Archive */}
        <Pressable
          onPress={onArchive}
          style={[styles.archive, { backgroundColor: colors.card }]}
        >
          <Archive size={18} color={colors.text} />
          <Text style={[styles.archiveText, { color: colors.text }]}>
            Archive habit
          </Text>
        </Pressable>

        {/* Delete */}
        <Pressable
          onPress={onDelete}
          style={[styles.delete, { backgroundColor: colors.dangerSolid }]}
        >
          <Trash2 size={18} color="#FFFFFF" />
          <Text style={styles.deleteText}>Delete habit</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

function InfoLine({ icon, text }: { icon: ReactNode; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoLine}>
      {icon}
      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  topText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800' },
  description: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  infoList: { marginTop: 16, gap: 8 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  archive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 12,
  },
  archiveText: { fontSize: 16, fontWeight: '700' },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 12,
  },
  deleteText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
