import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

/** Small uppercase heading used above each group on every screen. */
export function SectionLabel({
  children,
  first,
}: {
  children: string;
  first?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles.label,
        { color: colors.textSecondary },
        first ? styles.firstLabel : undefined,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
  },
  firstLabel: {
    marginTop: 0,
  },
});
