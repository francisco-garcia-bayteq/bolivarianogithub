import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {
  BankBuildingIcon,
  BellIcon,
  CalendarIcon,
  ChevronRightIcon,
  CreditCardOutlineIcon,
  LightbulbServiceIcon,
  ListBulletsIcon,
  LogoutIcon,
  QrCodeIcon,
  TransferArrowsIcon,
  UserAvatarIcon,
} from '../HomeIcons';

jest.mock('react-native-svg', () => {
  const R = require('react');
  const {View} = require('react-native');
  const Svg = ({children, width, height}: {children?: R.ReactNode; width?: number; height?: number}) =>
    R.createElement(View, {testID: 'svg-mock', width, height}, children);
  const Path = () => null;
  const G = ({children}: {children?: R.ReactNode}) =>
    R.createElement(View, {testID: 'svg-g'}, children);
  return {__esModule: true, default: Svg, Svg, Path, G};
});

describe('HomeIcons', () => {
  const color = '#112233';

  test.each([
    ['BellIcon', BellIcon],
    ['LogoutIcon', LogoutIcon],
    ['UserAvatarIcon', UserAvatarIcon],
    ['TransferArrowsIcon', TransferArrowsIcon],
    ['LightbulbServiceIcon', LightbulbServiceIcon],
    ['QrCodeIcon', QrCodeIcon],
    ['CalendarIcon', CalendarIcon],
    ['CreditCardOutlineIcon', CreditCardOutlineIcon],
    ['ListBulletsIcon', ListBulletsIcon],
  ] as const)('%s usa tamaño por defecto y acepta size explícito', async (_name, Icon) => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<Icon color={color} />);
    });
    const svg1 = root!.root.findByProps({testID: 'svg-mock'});
    expect(svg1.props.width).toBeDefined();
    expect(svg1.props.height).toBeDefined();

    await act(async () => {
      root = ReactTestRenderer.create(<Icon color={color} size={33} />);
    });
    const svg2 = root!.root.findByProps({testID: 'svg-mock'});
    expect(svg2.props.width).toBe(33);
    expect(svg2.props.height).toBe(33);
  });

  test('ChevronRightIcon renderiza Image', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<ChevronRightIcon color={color} />);
    });
    const img = root!.root.findByType('Image' as never);
    expect(img).toBeTruthy();
  });

  test('BankBuildingIcon ajusta imagen interior según size', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<BankBuildingIcon color={color} size={50} />);
    });
    const img = root!.root.findByType('Image' as never);
    expect(img.props.style.width).toBe(Math.round(50 * 0.6));
    expect(img.props.style.height).toBe(Math.round(50 * 0.6));
  });
});
