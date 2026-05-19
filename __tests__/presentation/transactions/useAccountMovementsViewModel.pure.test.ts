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

import {
  localDateKey,
  parseLocalDateKey,
  isValidMovementsAmountRange,
  MAX_MOVEMENTS_FILTER_AMOUNT,
} from '../../../src/presentation/transactions/useAccountMovementsViewModel';

describe('useAccountMovementsViewModel (funciones puras)', () => {
  describe('localDateKey / parseLocalDateKey', () => {
    it('redondea ida y vuelta en zona local', () => {
      const d = new Date(2026, 3, 7);
      const key = localDateKey(d);
      expect(key).toBe('2026-04-07');
      const back = parseLocalDateKey(key);
      expect(back.getFullYear()).toBe(2026);
      expect(back.getMonth()).toBe(3);
      expect(back.getDate()).toBe(7);
    });
  });

  describe('isValidMovementsAmountRange', () => {
    it('acepta rangos finitos ordenados dentro del límite', () => {
      expect(isValidMovementsAmountRange(-100, 200)).toBe(true);
      expect(isValidMovementsAmountRange(0, MAX_MOVEMENTS_FILTER_AMOUNT)).toBe(
        true,
      );
    });

    it('rechaza NaN, infinito o min > max', () => {
      expect(isValidMovementsAmountRange(NaN, 1)).toBe(false);
      expect(isValidMovementsAmountRange(1, Number.POSITIVE_INFINITY)).toBe(
        false,
      );
      expect(isValidMovementsAmountRange(10, 5)).toBe(false);
    });

    it('rechaza valores fuera del máximo absoluto', () => {
      expect(
        isValidMovementsAmountRange(
          -MAX_MOVEMENTS_FILTER_AMOUNT - 1,
          0,
        ),
      ).toBe(false);
      expect(
        isValidMovementsAmountRange(
          0,
          MAX_MOVEMENTS_FILTER_AMOUNT + 0.01,
        ),
      ).toBe(false);
    });
  });
});
