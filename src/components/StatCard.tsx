import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  icon: ReactNode;
  value: string;
  label: string;
}

export function StatCard({ icon, value, label }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {icon}
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  value: { fontSize: 24, fontWeight: '800', marginTop: 6 },
  label: { fontSize: 13, fontWeight: '500' },
});
