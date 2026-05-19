import {
  resolveHomeDashboardIconSource,
  renderHomeDashboardIcon,
} from '../homeDashboardIconMap';

const USER = require('../../../../../assets/images/frequent_payments/user.png');
const BANK = require('../../../../../assets/images/frequent_payments/bank.png');
const BULB = require('../../../../../assets/images/frequent_payments/bulb.png');

describe('resolveHomeDashboardIconSource', () => {
  test('match directo por código', () => {
    expect(resolveHomeDashboardIconSource('bank')).toBe(BANK);
    expect(resolveHomeDashboardIconSource('BANK')).toBe(BANK);
    expect(resolveHomeDashboardIconSource('  water  ')).toBe(
      require('../../../../../assets/images/frequent_payments/water.png'),
    );
  });

  test('alias person → user, lightbulb → bulb', () => {
    expect(resolveHomeDashboardIconSource('person')).toBe(USER);
    expect(resolveHomeDashboardIconSource('lightbulb')).toBe(BULB);
  });

  test('código desconocido → default user', () => {
    expect(resolveHomeDashboardIconSource('xyz')).toBe(USER);
    expect(resolveHomeDashboardIconSource('')).toBe(USER);
  });
});

describe('renderHomeDashboardIcon', () => {
  test('devuelve nodo Image con source resuelto', () => {
    const node = renderHomeDashboardIcon('bank', '#000', 24);
    expect(node).not.toBeNull();
    expect((node as {props: {source: unknown}}).props.source).toBe(BANK);
    expect((node as {props: {style: {width: number; height: number}}}).props.style).toEqual({
      width: 24,
      height: 24,
    });
  });
});
