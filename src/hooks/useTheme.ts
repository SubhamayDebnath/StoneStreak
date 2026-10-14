import { useColorScheme } from 'react-native';
import { useThemeStore, ThemeMode } from '@/store/themeStore';
import { AppColors, darkColors, lightColors } from '@/theme';

export function useTheme(): {
  colors: AppColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
} {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  return { colors: isDark ? darkColors : lightColors, isDark, mode, setMode };
}
