import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  icon: ReactNode;
  iconBg?: string;
  value: string;
  label: string;
}

export function StatCard({ icon, iconBg, value, label }: Props) {
  const { colors } = useTheme();
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
      <View
        style={[styles.iconWrap, { backgroundColor: iconBg || colors.primary }]}
      >
        {icon}
      </View>
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.value, { color: colors.text }]}>
          {value}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.label, { color: colors.textSecondary }]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
