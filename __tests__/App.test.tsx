/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('../src/navigation/AppNavigator', () => ({
  AppNavigator: () => {
    const ReactNative = require('react-native');
    return <ReactNative.Text>App navigator</ReactNative.Text>;
  },
}));

jest.mock('../src/di', () => ({
  DIProvider: ({children}: {children: React.ReactNode}) => children,
  useDI: () => ({
    secureStorageService: {
      get: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  }),
}));

jest.mock('../src/providers', () => ({
  AuthProvider: ({children}: {children: React.ReactNode}) => children,
  SecurityProvider: ({children}: {children: React.ReactNode}) => children,
  SessionTimeoutProvider: ({children}: {children: React.ReactNode}) => children,
  ThemeProvider: ({children}: {children: React.ReactNode}) => children,
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
