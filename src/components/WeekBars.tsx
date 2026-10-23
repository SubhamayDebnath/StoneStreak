import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fromDateKey, WEEKDAY_SHORT } from '@/lib/date';
import { HeatCell } from '@/types';

const MAX_H = 72;

function label(c: HeatCell) {
  if (c.scheduled === 0) return '–';
  // Per-habit count cells: show the real count (it can be above the goal)
  if (c.count !== undefined && c.scheduled > 1) return String(c.count);
  return `${c.done}/${c.scheduled}`;
}

/** Bar chart for 7 days (oldest first, last = today). */
export function WeekBars({ cells }: { cells: HeatCell[] }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {cells.map((c, i) => {
        const isToday = i === cells.length - 1;
        const ratio = c.scheduled === 0 ? 0 : c.done / c.scheduled;
        const full = c.scheduled > 0 && c.done === c.scheduled;
        const height = Math.max(4, Math.round(ratio * MAX_H));
        const barColor =
          c.done === 0 ? colors.heat0 : full ? colors.success : colors.primary;

        return (
          <View key={c.date} style={styles.col}>
            <Text style={[styles.count, { color: colors.textSecondary }]}>
              {label(c)}
            </Text>
            <View style={[styles.track, { height: MAX_H }]}>
              <View
                style={{ height, borderRadius: 6, backgroundColor: barColor }}
              />
            </View>
            <Text
              style={{
                color: isToday ? colors.primary : colors.textSecondary,
                fontWeight: '600',
                fontSize: 12,
              }}
            >
              {WEEKDAY_SHORT[fromDateKey(c.date).getDay()]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { alignItems: 'center', gap: 6, flex: 1 },
  count: { fontSize: 10, fontWeight: '600' },
  track: { width: 22, justifyContent: 'flex-end' },
});
