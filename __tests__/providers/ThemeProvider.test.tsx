import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as RN from 'react-native';
import {ThemeProvider} from '../../src/providers/theme/ThemeProvider';
import * as ThemeStoreModule from '../../src/providers/theme/useThemeStore';

jest.mock('../../src/providers/theme/useThemeStore', () => {
  const mockSetSystemIsDark = jest.fn();
  const actual = jest.requireActual<
    typeof import('../../src/providers/theme/useThemeStore')
  >('../../src/providers/theme/useThemeStore');
  return {
    ...actual,
    useThemeStore: jest.fn(() => ({
      mode: 'light',
      systemIsDark: false,
      setSystemIsDark: mockSetSystemIsDark,
      setMode: jest.fn(),
      toggleTheme: jest.fn(),
    })),
    __getMockSetSystemIsDark: () => mockSetSystemIsDark,
  };
});

function getMockSetSystemIsDark(): jest.Mock {
  const mod = ThemeStoreModule as unknown as {
    __getMockSetSystemIsDark?: () => jest.Mock;
  };
  return mod.__getMockSetSystemIsDark!();
}

describe('ThemeProvider', () => {
  let useColorSchemeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    useColorSchemeSpy = jest.spyOn(RN, 'useColorScheme').mockReturnValue('light');
  });

  afterEach(() => {
    useColorSchemeSpy.mockRestore();
  });

  it('sincroniza esquema oscuro del sistema con setSystemIsDark', async () => {
    useColorSchemeSpy.mockReturnValue('dark');
    const mockSet = getMockSetSystemIsDark();

    await act(async () => {
      ReactTestRenderer.create(
        <ThemeProvider>
          <React.Fragment />
        </ThemeProvider>,
      );
    });

    expect(mockSet).toHaveBeenCalledWith(true);
  });

  it('sincroniza esquema claro del sistema', async () => {
    useColorSchemeSpy.mockReturnValue('light');
    const mockSet = getMockSetSystemIsDark();

    await act(async () => {
      ReactTestRenderer.create(
        <ThemeProvider>
          <React.Fragment />
        </ThemeProvider>,
      );
    });

    expect(mockSet).toHaveBeenCalledWith(false);
  });
});
