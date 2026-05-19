import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {TouchableOpacity} from 'react-native';
import {HomeHeader} from '../HomeHeader';

jest.mock('../../../../providers/theme', () => ({
  useTheme: () => ({
    colors: require('../../../../providers/theme/colors').LightColors,
  }),
}));

jest.mock('react-native-svg', () => {
  const R = require('react');
  const {View} = require('react-native');
  const Svg = ({children}: {children?: R.ReactNode}) =>
    R.createElement(View, {testID: 'svg-mock'}, children);
  const Path = () => null;
  const G = ({children}: {children?: R.ReactNode}) =>
    R.createElement(View, null, children);
  return {__esModule: true, default: Svg, Svg, Path, G};
});

function collectText(node: unknown): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(collectText).join('');
  }
  if (typeof node === 'object' && node !== null && 'children' in node) {
    return collectText((node as {children: unknown}).children);
  }
  return '';
}

describe('HomeHeader', () => {
  test.each([
    ['undefined', undefined],
    ['null', null],
    ['vacío', ''],
    ['solo espacios', '   '],
  ] as const)('muestra "Usuario" cuando userName es %s', async (_label, userName) => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <HomeHeader userName={userName as string | null | undefined} />,
      );
    });
    expect(collectText(root!.toJSON())).toContain('Usuario');
  });

  test('muestra nombre recortado cuando hay userName', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<HomeHeader userName="  Ana  " />);
    });
    const flat = collectText(root!.toJSON());
    expect(flat).toContain('Ana');
    expect(flat).not.toMatch(/\s{2,}Ana/);
  });

  test('dispara onNotifications y onLogout', async () => {
    const onNotifications = jest.fn();
    const onLogout = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <HomeHeader
          userName="Pepe"
          onNotifications={onNotifications}
          onLogout={onLogout}
        />,
      );
    });
    const buttons = root!.root.findAllByType(TouchableOpacity as never);
    const notif = buttons.find(
      (n: {props: {accessibilityLabel?: string}}) =>
        n.props.accessibilityLabel === 'Notificaciones',
    );
    const logout = buttons.find(
      (n: {props: {testID?: string}}) => n.props.testID === 'logout-button',
    );
    await act(async () => {
      notif?.props.onPress?.();
      logout?.props.onPress?.();
    });
    expect(onNotifications).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
