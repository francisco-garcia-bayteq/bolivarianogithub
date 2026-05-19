import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {useThemeStore, resolveIsDark} from './useThemeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({
  children,
}: Readonly<ThemeProviderProps>) {
  const systemScheme = useColorScheme();
  const {mode, systemIsDark, setSystemIsDark} = useThemeStore();

  useEffect(() => {
    setSystemIsDark(systemScheme === 'dark');
  }, [systemScheme, setSystemIsDark]);

  const isDark = resolveIsDark(mode, systemIsDark);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {children}
    </>
  );
}
