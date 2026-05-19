/** Monto máximo por transferencia en unidades de cuenta (p. ej. soles), sin decimales en esta constante. */
export const MAX_TRANSFER_AMOUNT_UNITS = 5000;

export const MAX_TRANSFER_CENTS = MAX_TRANSFER_AMOUNT_UNITS * 100;

const MAX_TRANSFER_CENTS_BIGINT = BigInt(MAX_TRANSFER_CENTS);

/**
 * Normalizes raw input: strips `$`, commas, spaces; keeps digits and at most one `.`;
 * after `.`, at most two fractional digits.
 */
export function sanitizeTransferAmountInput(raw: string): string {
  const normalized = raw.replaceAll(/[$,\s]/g, '');
  let result = '';
  let dotIndex = -1;
  for (const element of normalized) {
    const c = element;
    if (c === '.' && dotIndex === -1) {
      dotIndex = result.length;
      result += '.';
    } else if (c >= '0' && c <= '9') {
      if (dotIndex !== -1) {
        const fracLen = result.length - dotIndex - 1;
        if (fracLen >= 2) {
          continue;
        }
      }
      result += c;
    }
  }
  return result;
}

function clampCents(cents: bigint): number {
  if (cents < 0n) {
    return 0;
  }
  if (cents > MAX_TRANSFER_CENTS_BIGINT) {
    return MAX_TRANSFER_CENTS;
  }
  return Number(cents);
}

/**
 * Parses sanitized transfer amount: without `.`, value is whole dollars; with `.`,
 * up to two decimal places (cents). Returns `null` when there is no monetary value yet.
 */
export function parseTransferAmountInputToCents(sanitized: string): number | null {
  if (sanitized === '' || sanitized === '.') {
    return null;
  }

  const dotIdx = sanitized.indexOf('.');
  if (dotIdx === -1) {
    if (!/^\d+$/.test(sanitized)) {
      return null;
    }
    const dollars = BigInt(sanitized);
    const cents = dollars * 100n;
    return clampCents(cents);
  }

  const wholeStr = sanitized.slice(0, dotIdx);
  const fracStr = sanitized.slice(dotIdx + 1);

  if (wholeStr !== '' && !/^\d+$/.test(wholeStr)) {
    return null;
  }
  if (fracStr !== '' && !/^\d+$/.test(fracStr)) {
    return null;
  }

  const wholePart = wholeStr === '' ? 0n : BigInt(wholeStr);
  const fracPadded = fracStr.padEnd(2, '0').slice(0, 2);
  const fracNum = Number.parseInt(fracPadded, 10);
  if (Number.isNaN(fracNum)) {
    return null;
  }
  const cents = wholePart * 100n + BigInt(fracNum);
  return clampCents(cents);
}

export const transferAmountMessages = {
  requiredPositive: 'Ingresa un monto mayor a cero.',
  exceedsBalance: 'El monto supera el saldo disponible.',
  exceedsMax: 'El monto excede el máximo permitido.',
} as const;

export function balanceDollarsToCents(balance: number): number {
  if (!Number.isFinite(balance)) {
    return 0;
  }

  return Math.round(balance * 100);
}

export function validateTransferAmountForSubmit(
  amountCents: number,
  availableBalanceCents: number,
): string | null {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return transferAmountMessages.requiredPositive;
  }

  if (amountCents > MAX_TRANSFER_CENTS) {
    return transferAmountMessages.exceedsMax;
  }

  if (amountCents > availableBalanceCents) {
    return transferAmountMessages.exceedsBalance;
  }

  return null;
}

export function getLiveTransferAmountError(
  amountCents: number,
  availableBalanceCents: number,
): string | null {
  if (amountCents <= 0) {
    return null;
  }

  if (amountCents > MAX_TRANSFER_CENTS) {
    return transferAmountMessages.exceedsMax;
  }

  if (amountCents > availableBalanceCents) {
    return transferAmountMessages.exceedsBalance;
  }

  return null;
}
