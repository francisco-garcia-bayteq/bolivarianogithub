import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {AppNavigator} from '../../src/navigation/AppNavigator';

const mockUseAuth = jest.fn();

jest.mock('../../src/providers', () => ({
  useAuth: () => mockUseAuth(),
  useSecurity: () => mockUseSecurity(),
  useTheme: () => ({
    colors: require('../../src/providers/theme/colors').LightColors,
  }),
}));

jest.mock('@react-navigation/native-stack', () => {
  const R = require('react');
  const {View, Text} = require('react-native');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({children}: {children: R.ReactNode}) =>
        R.createElement(View, {testID: 'root-stack'}, children),
      Screen: ({
        name,
        component: Comp,
      }: {
        name: string;
        component: R.ComponentType;
      }) =>
        R.createElement(
          View,
          {key: name, testID: `stack-screen-${name}`},
          R.createElement(Text, null, name),
          Comp ? R.createElement(Comp) : null,
        ),
    }),
  };
});

jest.mock('../../src/navigation/MainTabNavigator', () => {
  const R = require('react');
  const {Text} = require('react-native');
  return {
    MainTabNavigator: () =>
      R.createElement(Text, {testID: 'main-tab-mock'}, 'Main'),
  };
});

jest.mock('../../src/presentation/auth/LoginScreen', () => {
  const R = require('react');
  const {Text} = require('react-native');
  return {
    LoginScreen: () =>
      R.createElement(Text, {testID: 'login-mock'}, 'Login'),
  };
});

jest.mock('../../src/presentation/otp', () => {
  const R = require('react');
  const {Text} = require('react-native');
  return {
    OtpValidationScreen: () =>
      R.createElement(Text, {testID: 'otp-mock'}, 'Otp'),
  };
});

jest.mock('../../src/presentation/auth/RegisterAliasScreen', () => {
  const R = require('react');
  const {Text} = require('react-native');
  return {
    RegisterAliasScreen: () =>
      R.createElement(Text, {testID: 'register-alias-mock'}, 'RegisterAlias'),
  };
});

jest.mock('../../src/presentation/auth/BiometricOfferScreen', () => {
  const R = require('react');
  const {Text} = require('react-native');
  return {
    BiometricOfferScreen: () =>
      R.createElement(Text, {testID: 'bio-mock'}, 'Bio'),
  };
});

jest.mock('../../src/presentation/splash', () => {
  const R = require('react');
  const {View, Text} = require('react-native');
  return {
    SplashScreen: () =>
      R.createElement(Text, {testID: 'splash-mock'}, 'Splash'),
    PublicKeyErrorScreen: ({message}: {message: string}) =>
      R.createElement(
        View,
        {testID: 'public-key-error'},
        R.createElement(Text, null, message),
      ),
  };
});

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('tras el timer de splash y sin sesión, muestra stack de login', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<AppNavigator />);
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(root!.root.findByProps({testID: 'root-stack'})).toBeTruthy();
    expect(root!.root.findByProps({testID: 'login-mock'})).toBeTruthy();
    expect(root!.root.findByProps({testID: 'register-alias-mock'})).toBeTruthy();
    expect(root!.root.findAllByProps({testID: 'stack-screen-Login'}).length).toBeGreaterThan(
      0,
    );
  });

  test('con sesión autenticada muestra Main', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<AppNavigator />);
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(root!.root.findByProps({testID: 'main-tab-mock'})).toBeTruthy();
  });

  test('mantiene Splash si auth aún está cargando', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<AppNavigator />);
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(root!.root.findByProps({testID: 'splash-mock'})).toBeTruthy();
  });
});
