import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {MovementsStackNavigator} from '../../src/navigation/MovementsStackNavigator';

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const {View, Text} = require('react-native');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({children}: {children: React.ReactNode}) =>
        React.createElement(View, {testID: 'movements-stack'}, children),
      Screen: ({
        name,
        component: Comp,
      }: {
        name: string;
        component: React.ComponentType;
      }) =>
        React.createElement(
          View,
          {key: name, testID: `movements-screen-${name}`},
          React.createElement(Text, null, name),
          Comp ? React.createElement(Comp) : null,
        ),
    }),
  };
});

jest.mock('../../src/presentation/transactions/TransactionsScreen', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    TransactionsScreen: () =>
      React.createElement(Text, {testID: 'movements-list'}, 'List'),
  };
});

jest.mock(
  '../../src/presentation/transactions/MovementDetailScreen',
  () => {
    const React = require('react');
    const {Text} = require('react-native');
    return {
      MovementDetailScreen: () =>
        React.createElement(Text, {testID: 'movement-detail'}, 'Detail'),
    };
  },
);

describe('MovementsStackNavigator', () => {
  test('registra lista y detalle de movimientos', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<MovementsStackNavigator />);
    });

    expect(root!.root.findByProps({testID: 'movements-stack'})).toBeTruthy();
    expect(
      root!.root.findByProps({testID: 'movements-screen-MovementsList'}),
    ).toBeTruthy();
    expect(
      root!.root.findByProps({testID: 'movements-screen-MovementDetail'}),
    ).toBeTruthy();
  });
});
