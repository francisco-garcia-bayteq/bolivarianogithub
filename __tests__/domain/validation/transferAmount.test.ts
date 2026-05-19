import {
  balanceDollarsToCents,
  getLiveTransferAmountError,
  MAX_TRANSFER_CENTS,
  parseTransferAmountInputToCents,
  sanitizeTransferAmountInput,
  transferAmountMessages,
  validateTransferAmountForSubmit,
} from '../../../src/domain/validation';

describe('sanitizeTransferAmountInput', () => {
  test('keeps digits without dot', () => {
    expect(sanitizeTransferAmountInput('500')).toBe('500');
  });

  test('allows one dot and at most two decimals', () => {
    expect(sanitizeTransferAmountInput('20.053')).toBe('20.05');
  });

  test('strips currency symbols and thousands separators from paste', () => {
    expect(sanitizeTransferAmountInput('$1,234.56')).toBe('1234.56');
  });
});

describe('parseTransferAmountInputToCents', () => {
  test('returns null for empty or lone dot', () => {
    expect(parseTransferAmountInputToCents('')).toBeNull();
    expect(parseTransferAmountInputToCents('.')).toBeNull();
  });

  test('without dot, treats input as whole dollars', () => {
    expect(parseTransferAmountInputToCents('1')).toBe(100);
    expect(parseTransferAmountInputToCents('500')).toBe(50000);
  });

  test('with dot, combines dollars and up to two decimal digits', () => {
    expect(parseTransferAmountInputToCents('20.')).toBe(2000);
    expect(parseTransferAmountInputToCents('20.05')).toBe(2005);
    expect(parseTransferAmountInputToCents('.5')).toBe(50);
    expect(parseTransferAmountInputToCents('0.01')).toBe(1);
  });

  test('clamps to MAX_TRANSFER_CENTS', () => {
    expect(
      parseTransferAmountInputToCents(
        '9999999999999', // > max when interpreted as dollars
      ),
    ).toBe(MAX_TRANSFER_CENTS);
  });
});

describe('transferAmount validation', () => {
  test('converts balance dollars to cents', () => {
    expect(balanceDollarsToCents(15642.5)).toBe(1564250);
  });

  test('requires a positive amount on submit', () => {
    expect(validateTransferAmountForSubmit(0, 100)).toBe(
      transferAmountMessages.requiredPositive,
    );
  });

  test('rejects amount above balance on submit', () => {
    expect(validateTransferAmountForSubmit(10_001, 10_000)).toBe(
      transferAmountMessages.exceedsBalance,
    );
  });

  test('rejects amount above max transfer on submit', () => {
    expect(validateTransferAmountForSubmit(MAX_TRANSFER_CENTS + 1, 10_000_000)).toBe(
      transferAmountMessages.exceedsMax,
    );
  });

  test('accepts amount at max transfer when balance allows', () => {
    expect(validateTransferAmountForSubmit(MAX_TRANSFER_CENTS, MAX_TRANSFER_CENTS)).toBeNull();
  });

  test('does not show live error while amount is zero', () => {
    expect(getLiveTransferAmountError(0, 10_000)).toBeNull();
  });

  test('shows live error when amount exceeds balance', () => {
    expect(getLiveTransferAmountError(500, 400)).toBe(
      transferAmountMessages.exceedsBalance,
    );
  });

  test('shows live error when amount exceeds max transfer', () => {
    expect(getLiveTransferAmountError(MAX_TRANSFER_CENTS + 1, 10_000_000)).toBe(
      transferAmountMessages.exceedsMax,
    );
  });
});
