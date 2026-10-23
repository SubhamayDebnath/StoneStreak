import { CheckCircle2, PartyPopper, Target } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  dateLabel: string;
  done: number;
  total: number;
}

export function ProgressHeader({ dateLabel, done, total }: Props) {
  const { colors } = useTheme();
  const pct = total === 0 ? 0 : Math.min(1, done / total);
  const percent = Math.round(pct * 100);
  const allDone = total > 0 && done === total;
  const accent = allDone ? colors.success : colors.primary;

  const title =
    total === 0
      ? 'Nothing scheduled'
      : allDone
        ? 'All done for today!'
        : `${done} of ${total} completed`;

  const subtitle =
    total === 0
      ? 'Add a habit to get started'
      : allDone
        ? 'Great consistency, keep it up'
        : `${total - done} habit${total - done === 1 ? '' : 's'} remaining`;

  const Icon = total === 0 ? Target : allDone ? PartyPopper : CheckCircle2;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: accent }]}>
          <Icon size={19} color="#FFFFFF" strokeWidth={2.5} />
        </View>

        <View style={styles.textColumn}>
          <View style={styles.headerTitleRow}>
            <Text
              numberOfLines={1}
              style={[styles.title, { color: colors.text }]}
            >
              {title}
            </Text>
            <View style={[styles.pill, { backgroundColor: accent + '1E' }]}>
              <Text style={[styles.pillText, { color: accent }]}>
                {percent}%
              </Text>
            </View>
          </View>
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Progress track */}
      <View style={[styles.track, { backgroundColor: colors.cardSubtle }]}>
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  pill: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
