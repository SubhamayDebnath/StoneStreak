import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  Icon: LucideIcon;
  title: string;
  text: string;
}

export function EmptyState({ Icon, title, text }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.outer, { backgroundColor: colors.primary + '22' }]}>
        <View style={[styles.inner, { backgroundColor: colors.primary }]}>
          <Icon size={34} color={colors.onPrimary} strokeWidth={2.2} />
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 72 },
  outer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  inner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  text: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 },
});
