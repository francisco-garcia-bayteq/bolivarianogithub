import {DarkColors, LightColors} from '../../../src/providers/theme/colors';
import {
  IGNORE_SYSTEM_DARK_MODE,
  resolveColors,
  resolveIsDark,
  useThemeStore,
} from '../../../src/providers/theme/useThemeStore';

describe('useThemeStore helpers', () => {
  test('resolveIsDark follows mode; system follows OS only if IGNORE_SYSTEM_DARK_MODE is false', () => {
    expect(resolveIsDark('light', false)).toBe(false);
    expect(resolveIsDark('dark', false)).toBe(true);
    if (IGNORE_SYSTEM_DARK_MODE) {
      expect(resolveIsDark('system', true)).toBe(false);
      expect(resolveIsDark('system', false)).toBe(false);
    } else {
      expect(resolveIsDark('system', true)).toBe(true);
      expect(resolveIsDark('system', false)).toBe(false);
    }
  });

  test('resolveColors picks palette by boolean', () => {
    expect(resolveColors(false)).toBe(LightColors);
    expect(resolveColors(true)).toBe(DarkColors);
  });
});

describe('useThemeStore actions', () => {
  beforeEach(() => {
    useThemeStore.setState({
      mode: 'system',
      systemIsDark: false,
    });
  });

  test('setMode updates mode', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  test('setSystemIsDark updates flag', () => {
    useThemeStore.getState().setSystemIsDark(true);
    expect(useThemeStore.getState().systemIsDark).toBe(true);
  });

  test('toggleTheme switches between light and dark based on resolved appearance', () => {
    useThemeStore.setState({mode: 'dark'});
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().mode).toBe('light');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  test('toggleTheme when in system mode reflects resolved appearance', () => {
    useThemeStore.setState({mode: 'system', systemIsDark: true});
    useThemeStore.getState().toggleTheme();
    if (IGNORE_SYSTEM_DARK_MODE) {
      // Con IGNORE: la UI ya es clara; el toggle pasa a oscuro explícito.
      expect(useThemeStore.getState().mode).toBe('dark');
    } else {
      expect(useThemeStore.getState().mode).toBe('light');
    }
  });
});
