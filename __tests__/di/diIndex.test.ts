jest.mock('react-native-view-shot', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props: object, ref: unknown) =>
      React.createElement(View, {...props, ref}),
    ),
  };
});

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn().mockResolvedValue(undefined),
  },
}));

import {DIProvider, useDI} from '../../src/di';

describe('src/di index (barrel)', () => {
  it('reexporta DIProvider y useDI', () => {
    expect(typeof DIProvider).toBe('function');
    expect(typeof useDI).toBe('function');
  });
});
