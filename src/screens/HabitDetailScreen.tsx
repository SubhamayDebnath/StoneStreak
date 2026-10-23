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
import { showToast } from '@/lib/toast';
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
    if (cell.done > 0) return 'Completed';
    return cell.date === todayKey ? 'Pending today' : 'Missed';
  };

  const onArchive = () => {
    haptics.light();
    Alert.alert(
      'Archive habit?',
      `"${habit.name}" will be hidden from Today and Habits. Tracking history is preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              haptics.success();
              await archiveHabit(habit.id);
              showToast('Habit archived');
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
      `"${habit.name}" and all tracking history will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              haptics.heavy();
              await removeHabit(habit.id);
              showToast('Habit deleted');
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: '',
          headerTitle: '',
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable onPress={onClose} hitSlop={10}>
              <Text
                style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}
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
                  fontSize: 15,
                  fontWeight: '600',
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
          paddingBottom: insets.bottom + 48,
        }}
      >
        {/* Header card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.top}>
            <HabitIcon name={habit.icon} color={habit.color} size={50} />
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
              icon={<Calendar size={15} color={colors.textSecondary} />}
              text={scheduleLabel(habit)}
            />
            {habit.reminderTime ? (
              <InfoLine
                icon={<Bell size={15} color={colors.textSecondary} />}
                text={`Reminder at ${formatTime(habit.reminderTime)}`}
              />
            ) : null}
            <InfoLine
              icon={
                isCount ? (
                  <Hash size={15} color={colors.textSecondary} />
                ) : (
                  <Check size={15} color={colors.textSecondary} />
                )
              }
              text={
                isCount
                  ? `Count · Goal ${habit.target} per day`
                  : 'Check-in once a day'
              }
            />
          </View>
        </View>

        {/* Statistics */}
        <SectionLabel>STATISTICS</SectionLabel>
        <View style={styles.grid}>
          <StatCard
            icon={<Flame size={17} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg={colors.streak}
            value={plural(stats.current, 'day')}
            label="Current streak"
          />
          <StatCard
            icon={<Trophy size={17} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg={colors.primary}
            value={plural(stats.best, 'day')}
            label="Best streak"
          />
          <StatCard
            icon={<Target size={17} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg={colors.success}
            value={`${stats.rate}%`}
            label="Completion rate"
          />
          <StatCard
            icon={<CircleCheck size={17} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg={colors.primary}
            value={String(stats.daysDone)}
            label={isCount ? 'Days goal reached' : 'Total check-ins'}
          />
          {isCount && (
            <>
              <StatCard
                icon={<Hash size={17} color="#FFFFFF" strokeWidth={2.4} />}
                iconBg={habit.color}
                value={String(stats.totalCount)}
                label="Total count"
              />
              <StatCard
                icon={<Star size={17} color="#FFFFFF" strokeWidth={2.4} />}
                iconBg="#F59E0B"
                value={String(stats.bestDay)}
                label="Best day"
              />
            </>
          )}
        </View>

        {/* Last 7 days */}
        <SectionLabel>LAST 7 DAYS</SectionLabel>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <WeekBars cells={week} />
        </View>

        {/* Heat map */}
        <SectionLabel>LAST 12 MONTHS</SectionLabel>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
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
          style={[
            styles.archive,
            {
              backgroundColor: colors.cardSubtle,
              borderColor: colors.border,
            },
          ]}
        >
          <Archive size={18} color={colors.text} strokeWidth={2.2} />
          <Text style={[styles.archiveText, { color: colors.text }]}>
            Archive habit
          </Text>
        </Pressable>

        {/* Delete */}
        <Pressable
          onPress={onDelete}
          style={[styles.delete, { backgroundColor: colors.dangerSolid }]}
        >
          <Trash2 size={18} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.deleteText}>Delete habit</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function InfoLine({ icon, text }: { icon: ReactNode; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoLine}>
      {icon}
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  description: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  infoList: { marginTop: 14, gap: 7 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  archive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 15,
    marginTop: 12,
  },
  archiveText: { fontSize: 16, fontWeight: '600' },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 12,
  },
  deleteText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
