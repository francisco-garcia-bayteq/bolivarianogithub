jest.mock('react-native-view-shot', () => ({
  __esModule: true,
  default: 'ViewShot',
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn(),
  },
}));

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {MainTabNavigator} from '../../src/navigation/MainTabNavigator';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    getFocusedRouteNameFromRoute: jest.fn(() => 'MovementsList'),
  };
});

const getFocusedRouteNameFromRouteMock =
  getFocusedRouteNameFromRoute as jest.MockedFunction<
    typeof getFocusedRouteNameFromRoute
  >;

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => {
    const R = require('react');
    const {View, Text} = require('react-native');
    return {
      Navigator: ({children}: {children: R.ReactNode}) =>
        R.createElement(View, {testID: 'tab-navigator'}, children),
      Screen: ({
        name,
        component: Comp,
        options,
      }: {
        name: string;
        component: R.ComponentType;
        options?:
          | {title?: string; tabBarStyle?: {display?: string}}
          | ((args: {route: {name: string}}) => {
              title?: string;
              tabBarStyle?: {display?: string};
            });
      }) => {
        const resolved =
          typeof options === 'function'
            ? options({route: {name: 'Movements'} as never})
            : options;
        const label = resolved?.title ?? name;
        const tabBarHidden =
          resolved?.tabBarStyle?.display === 'none' ? 'yes' : 'no';
        return R.createElement(
          View,
          {key: name, testID: `tab-screen-${name}`},
          R.createElement(
            Text,
            {testID: `tab-bar-visibility-${name}`},
            tabBarHidden,
          ),
          R.createElement(Text, null, label),
          Comp ? R.createElement(Comp) : null,
        );
      },
    };
  },
}));

jest.mock('../../src/navigation/HomeStackNavigator.tsx', () => {
  const R = require('react');
  const {Text} = require('react-native');
  return {
    HomeStackNavigator: () =>
      R.createElement(Text, {testID: 'screen-home'}, 'HomeScreen'),
  };
});

jest.mock('../../src/features/transfer/navigation/TransferStackNavigator', () => {
  const R = require('react');
  const {Text} = require('react-native');
  return {
    TransferStackNavigator: () =>
      R.createElement(Text, {testID: 'screen-transfer-stack'}, 'TransferStack'),
  };
});

jest.mock('../../src/presentation/placeholders/TabSectionPlaceholderScreen', () => {
  const R = require('react');
  const {Text} = require('react-native');
  return {
    WithdrawTabScreen: () =>
      R.createElement(Text, {testID: 'screen-withdraw'}, 'WithdrawTab'),
    PaymentsTabScreen: () =>
      R.createElement(Text, {testID: 'screen-payments'}, 'PaymentsTab'),
    OthersTabScreen: () =>
      R.createElement(Text, {testID: 'screen-others'}, 'OthersTab'),
  };
});

jest.mock('../../src/providers/theme', () => ({
  useTheme: () => ({
    colors: require('../../src/providers/theme/colors').LightColors,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 8, left: 0, right: 0}),
}));

describe('MainTabNavigator', () => {
  beforeEach(() => {
    getFocusedRouteNameFromRouteMock.mockReturnValue('MovementsList');
  });

  test('renderiza el navegador de pestañas con títulos y pantallas simuladas', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<MainTabNavigator />);
    });

    const tree = root!.root;
    expect(tree.findByProps({testID: 'tab-navigator'})).toBeTruthy();
    expect(tree.findByProps({testID: 'screen-home'})).toBeTruthy();
    expect(tree.findByProps({testID: 'screen-transfer-stack'})).toBeTruthy();
    expect(tree.findByProps({testID: 'screen-withdraw'})).toBeTruthy();
    expect(tree.findByProps({testID: 'screen-payments'})).toBeTruthy();
    expect(tree.findByProps({testID: 'screen-others'})).toBeTruthy();

    const flat = JSON.stringify(root!.toJSON());
    expect(flat).toContain('Inicio');
    expect(flat).toContain('Transferir');
    expect(flat).toContain('Retirar');
    expect(flat).toContain('Pagos');
    expect(flat).toContain('Otros');
  });

  test('oculta la barra de pestañas en Inicio cuando la ruta enfocada es MovementDetail', async () => {
    getFocusedRouteNameFromRouteMock.mockReturnValue('MovementDetail');

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<MainTabNavigator />);
    });

    const flag = root!.root.findByProps({
      testID: 'tab-bar-visibility-Home',
    });
    expect(flag.props.children).toBe('yes');
  });

  test('oculta la barra de pestañas en Inicio cuando la ruta enfocada es MovementsList', async () => {
    getFocusedRouteNameFromRouteMock.mockReturnValue('MovementsList');

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<MainTabNavigator />);
    });

    const flag = root!.root.findByProps({
      testID: 'tab-bar-visibility-Home',
    });
    expect(flag.props.children).toBe('yes');
  });

  test('muestra la barra de pestañas en Inicio en HomeMain', async () => {
    getFocusedRouteNameFromRouteMock.mockReturnValue('HomeMain');

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<MainTabNavigator />);
    });

    const flag = root!.root.findByProps({
      testID: 'tab-bar-visibility-Home',
    });
    expect(flag.props.children).toBe('no');
  });
});
