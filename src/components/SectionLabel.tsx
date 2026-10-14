import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

/** Small uppercase heading used above each group on every screen. */
export function SectionLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.label, { color: colors.textSecondary }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 8,
  },
});
