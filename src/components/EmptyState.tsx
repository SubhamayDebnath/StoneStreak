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
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.cardSubtle,
            borderColor: colors.border,
          },
        ]}
      >
        <Icon size={24} color={colors.primary} strokeWidth={2} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginTop: 14,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 270,
  },
});
