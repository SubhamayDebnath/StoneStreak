import {
  CircleCheck,
  Flame,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { HeatMap } from '@/components/HeatMap';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { StatCard } from '@/components/StatCard';
import { WeekBars } from '@/components/WeekBars';
import { useTheme } from '@/hooks/useTheme';
import { buildOverallHeat, getOverview, HEAT_DAYS } from '@/lib/analytics';
import { fromDateKey } from '@/lib/date';
import { plural } from '@/lib/format';
import { useHabitStore } from '@/store/habitStore';
import { useTodayStore } from '@/store/todayStore';
import { HeatCell } from '@/types';

export function AnalyticsScreen() {
  const { colors } = useTheme();

  const habits = useHabitStore((s) => s.habits);
  const done = useHabitStore((s) => s.done);
  const todayKey = useTodayStore((s) => s.today);

  const today = useMemo(() => fromDateKey(todayKey), [todayKey]);
  const cells = useMemo(
    () => buildOverallHeat(habits, done, HEAT_DAYS, today),
    [habits, done, today],
  );
  const week = useMemo(() => cells.slice(-7), [cells]);
  const overview = useMemo(
    () => getOverview(habits, done, today, cells),
    [habits, done, today, cells],
  );

  const levelColors = [
    colors.heat0,
    colors.heat1,
    colors.heat2,
    colors.heat3,
    colors.heat4,
  ];

  const describe = (cell: HeatCell) =>
    cell.scheduled === 0
      ? 'Nothing scheduled'
      : `${cell.done} of ${cell.scheduled} done`;

  return (
    <Screen title="Analytics">
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: 32,
        }}
      >
        {habits.length === 0 ? (
          <EmptyState
            Icon={TrendingUp}
            title="No data yet"
            text="Create a habit and check it off. Your analytics will show up here."
          />
        ) : (
          <>
            <SectionLabel>OVERVIEW</SectionLabel>
            <View style={styles.grid}>
              <StatCard
                icon={<Flame size={22} color="#F59E0B" />}
                value={plural(overview.activeStreak, 'day')}
                label="Current streak"
              />
              <StatCard
                icon={<Trophy size={22} color={colors.primary} />}
                value={plural(overview.bestStreak, 'day')}
                label="Best streak"
              />
              <StatCard
                icon={<Target size={22} color={colors.success} />}
                value={`${overview.rate30}%`}
                label="Last 30 days"
              />
              <StatCard
                icon={<CircleCheck size={22} color={colors.primary} />}
                value={String(overview.totalCheckins)}
                label="Total check-ins"
              />
            </View>

            <SectionLabel>LAST 7 DAYS</SectionLabel>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <WeekBars cells={week} />
            </View>

            <SectionLabel>LAST 12 MONTHS</SectionLabel>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <HeatMap
                cells={cells}
                levelColors={levelColors}
                legend
                describe={describe}
              />
            </View>

            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Tap a habit on Today or Habits to see its own statistics.
            </Text>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { borderRadius: 16, padding: 16 },
  hint: { textAlign: 'center', marginTop: 24, fontSize: 13 },
});
