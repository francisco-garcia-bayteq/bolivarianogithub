import {useMemo} from 'react';
import {
  useThemeStore,
  resolveIsDark,
  resolveColors,
  type ThemeMode,
} from './useThemeStore';
import type {ThemeColors} from './colors';

export {ThemeProvider} from './ThemeProvider';
export {useThemeStore} from './useThemeStore';
export type {ThemeColors} from './colors';
export type {ThemeMode} from './useThemeStore';

interface UseThemeReturn {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const {mode, systemIsDark, setMode, toggleTheme} = useThemeStore();
  const isDark = resolveIsDark(mode, systemIsDark);
  const colors = useMemo(() => resolveColors(isDark), [isDark]);

  return {colors, isDark, mode, setMode, toggleTheme};
}
