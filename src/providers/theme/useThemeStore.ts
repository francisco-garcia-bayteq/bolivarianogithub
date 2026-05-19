import {create} from 'zustand';
import {DarkColors, LightColors, type ThemeColors} from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Si es `true`, con `mode === 'system'` la app **no** sigue el modo oscuro del SO:
 * siempre usa la paleta clara hasta que el usuario elija explícitamente "oscuro" en la app.
 * Complementar con apariencia nativa: iOS `UIUserInterfaceStyle` y tema Light en Android.
 */
export const IGNORE_SYSTEM_DARK_MODE = true;

interface ThemeState {
  mode: ThemeMode;
  systemIsDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSystemIsDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>(set => ({
  mode: 'system',
  systemIsDark: false,
  setMode: (mode: ThemeMode) => set({mode}),
  toggleTheme: () =>
    set(state => {
      const currentlyDark = resolveIsDark(state.mode, state.systemIsDark);
      return {mode: currentlyDark ? 'light' : 'dark'};
    }),
  setSystemIsDark: (isDark: boolean) => set({systemIsDark: isDark}),
}));

export function resolveIsDark(mode: ThemeMode, systemIsDark: boolean): boolean {
  if (mode === 'system') {
    if (IGNORE_SYSTEM_DARK_MODE) {
      return false;
    }
    return systemIsDark;
  }
  return mode === 'dark';
}

export function resolveColors(isDark: boolean): ThemeColors {
  return isDark ? DarkColors : LightColors;
}
