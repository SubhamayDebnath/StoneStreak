import { CircleCheck, PartyPopper, Target } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  dateLabel: string;
  done: number;
  total: number;
}

export function ProgressHeader({ dateLabel, done, total }: Props) {
  const { colors } = useTheme();
  const pct = total === 0 ? 0 : done / total;
  const percent = Math.round(pct * 100);
  const allDone = total > 0 && done === total;
  const accent = allDone ? colors.success : colors.primary;

  const title =
    total === 0
      ? 'Nothing scheduled'
      : allDone
        ? 'All done for today'
        : `${done} of ${total} done`;

  const subtitle =
    total === 0
      ? 'Add a habit to get started'
      : allDone
        ? 'Great work, keep it going'
        : `${total - done} left to go`;

  const Icon = total === 0 ? Target : allDone ? PartyPopper : CircleCheck;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.topRow}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {dateLabel.toUpperCase()}
        </Text>
        <View style={[styles.pill, { backgroundColor: accent + '22' }]}>
          <Text style={[styles.pillText, { color: accent }]}>{percent}%</Text>
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <Icon size={24} color="#FFFFFF" strokeWidth={2.4} />
        </View>
        <View style={styles.texts}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: colors.heat0 }]}>
        <View
          style={[
            styles.fill,
            { width: `${percent}%`, backgroundColor: accent },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 18, marginBottom: 16 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 13, fontWeight: '800' },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
    marginBottom: 16,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});
