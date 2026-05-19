import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Platform, Text, TouchableOpacity} from 'react-native';
import {
  CreditCardPreview,
  SavingsAccountCard,
} from '../ProductCarouselCards';

jest.mock('../../../../providers/theme', () => ({
  useTheme: () => ({
    colors: require('../../../../providers/theme/colors').LightColors,
  }),
}));

jest.mock('react-native-linear-gradient', () => {
  const R = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: ({children, style}: {children?: R.ReactNode; style?: object}) =>
      R.createElement(View, {testID: 'linear-gradient', style}, children),
  };
});

jest.mock('react-native-svg', () => {
  const R = require('react');
  const {View} = require('react-native');
  const Svg = ({children}: {children?: R.ReactNode}) =>
    R.createElement(View, {testID: 'svg'}, children);
  const Path = () => null;
  return {__esModule: true, default: Svg, Svg, Path};
});

describe('ProductCarouselCards — SavingsAccountCard', () => {
  test('isFirst true muestra estrella rellena y etiqueta de favorita', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <SavingsAccountCard
          maskedAccountNumber="****1111"
          balance={100}
          title="Ahorros"
          isFirst
        />,
      );
    });
    const starBtn = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(
        (n: {props: {accessibilityLabel?: string}}) =>
          n.props.accessibilityLabel === 'Cuenta favorita',
      );
    expect(starBtn).toBeTruthy();
  });

  test('isFirst false muestra estrella vacía', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <SavingsAccountCard
          maskedAccountNumber="****2222"
          balance={200}
          title="Corriente"
          isFirst={false}
        />,
      );
    });
    const starBtn = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(
        (n: {props: {accessibilityLabel?: string}}) =>
          n.props.accessibilityLabel === 'Marcar como favorita',
      );
    expect(starBtn).toBeTruthy();
  });

  test('toggle ojo alterna saldo enmascarado y visible', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <SavingsAccountCard
          maskedAccountNumber="****3333"
          balance={99.5}
          title="Ahorros"
        />,
      );
    });
    const flat0 = JSON.stringify(root!.toJSON());
    expect(flat0).toContain('$**.**');

    const eye = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(
        (n: {props: {accessibilityLabel?: string}}) =>
          n.props.accessibilityLabel === 'Mostrar saldo',
      );
    act(() => {
      eye?.props.onPress?.();
    });
    const flat1 = JSON.stringify(root!.toJSON());
    expect(flat1).not.toContain('$**.**');

    act(() => {
      eye?.props.onPress?.();
    });
    const flat2 = JSON.stringify(root!.toJSON());
    expect(flat2).toContain('$**.**');
  });

  test('Platform.select en tarjeta ahorros (ios / android)', () => {
    const spy = jest
      .spyOn(Platform, 'select')
      .mockImplementation(spec => (spec as {ios?: unknown}).ios as never);
    act(() => {
      ReactTestRenderer.create(
        <SavingsAccountCard maskedAccountNumber="*" balance={1} title="T" />,
      );
    });
    spy.mockRestore();
    const spy2 = jest
      .spyOn(Platform, 'select')
      .mockImplementation(spec => (spec as {android?: unknown}).android as never);
    act(() => {
      ReactTestRenderer.create(
        <SavingsAccountCard maskedAccountNumber="*" balance={1} title="T" />,
      );
    });
    spy2.mockRestore();
  });
});

describe('ProductCarouselCards — CreditCardPreview', () => {
  test('fecha de pago inválida muestra guión en pill', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <CreditCardPreview
          maskedCardNumber="****4242"
          totalDue={100}
          maxPaymentDate="no-es-fecha"
        />,
      );
    });
    const texts = root!.root.findAllByType(Text as never).map(
      (n: {props: {children?: unknown}}) => String(n.props.children ?? ''),
    );
    expect(texts.some(t => t.includes('—'))).toBe(true);
  });

  test('toggle total en tarjeta crédito', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <CreditCardPreview
          maskedCardNumber="****9999"
          totalDue={250}
          maxPaymentDate="2026-12-31"
        />,
      );
    });
    const eye = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(
        (n: {props: {accessibilityLabel?: string}}) =>
          n.props.accessibilityLabel === 'Mostrar total',
      );
    act(() => {
      eye?.props.onPress?.();
    });
    expect(JSON.stringify(root!.toJSON())).not.toContain('$**.**');
  });
});
