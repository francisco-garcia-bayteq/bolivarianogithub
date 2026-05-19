import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {TransferStackNavigator} from '../../src/features/transfer/navigation/TransferStackNavigator';

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const {View, Text} = require('react-native');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({children}: {children: React.ReactNode}) =>
        React.createElement(View, {testID: 'transfer-stack'}, children),
      Screen: ({
        name,
        component: Comp,
      }: {
        name: string;
        component: React.ComponentType;
      }) =>
        React.createElement(
          View,
          {key: name, testID: `transfer-screen-${name}`},
          React.createElement(Text, null, name),
          Comp ? React.createElement(Comp) : null,
        ),
    }),
  };
});

jest.mock('../../src/features/transfer/presentation/transferInit/TransferInitScreen', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    TransferInitScreen: () =>
      React.createElement(Text, {testID: 'transfer-init'}, 'TransferInit'),
  };
});

jest.mock('../../src/features/transfer/presentation/TransferScreen', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    TransferScreen: () =>
      React.createElement(Text, {testID: 'transfer-main'}, 'TransferMain'),
  };
});

jest.mock(
  '../../src/features/transfer/presentation/TransferReview/TransferReviewScreen',
  () => {
    const React = require('react');
    const {Text} = require('react-native');
    return {
      TransferReviewScreen: () =>
        React.createElement(Text, {testID: 'transfer-review'}, 'Review'),
    };
  },
);

jest.mock('../../src/presentation/otp', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    OtpValidationScreen: () =>
      React.createElement(Text, {testID: 'transfer-otp'}, 'Otp'),
  };
});

jest.mock(
  '../../src/features/transfer/presentation/transferResult/TranferVoucherScreen.tsx',
  () => {
    const React = require('react');
    const {Text} = require('react-native');
    return {
      TransferVoucherScreen: () =>
        React.createElement(Text, {testID: 'transfer-voucher'}, 'Voucher'),
    };
  },
);

describe('TransferStackNavigator', () => {
  test('registra las pantallas del flujo de transferencia', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<TransferStackNavigator />);
    });

    expect(root!.root.findByProps({testID: 'transfer-stack'})).toBeTruthy();
    expect(
      root!.root.findByProps({testID: 'transfer-screen-TransferInit'}),
    ).toBeTruthy();
    expect(
      root!.root.findByProps({testID: 'transfer-screen-TransferMain'}),
    ).toBeTruthy();
    expect(
      root!.root.findByProps({testID: 'transfer-screen-TransferReview'}),
    ).toBeTruthy();
    expect(
      root!.root.findByProps({testID: 'transfer-screen-OtpValidationTransfer'}),
    ).toBeTruthy();
    expect(
      root!.root.findByProps({testID: 'transfer-screen-TransferVoucher'}),
    ).toBeTruthy();
  });
});
