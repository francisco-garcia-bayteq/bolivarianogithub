function hashGuid(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    const cp = s.codePointAt(i) ?? 0;
    h = (h * 31 + cp) % 2147483647;
  }
  return Math.abs(h);
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

const PRODUCT_LABELS = [
  'Plazo fijo',
  'Credimax online',
  'Crédito de consumo',
  'Préstamo personal',
] as const;

const AGENCIES = ['Agencia 1', 'Agencia Centro', 'Matriz Quito'] as const;

const OFFICERS = [
  'Ramirez Piedra Jonathan Alexander',
  'Torres Vega Ana Lucía',
  'Mendoza Pérez Carlos',
] as const;

const CREDIT_PURPOSES = [
  'Gastos',
  'Servicios',
  'Consumo',
  'Vivienda',
] as const;

export interface LoanDetailMockSupplement {
  productLabel: string;
  maskedAccountNumber: string;
  amountGrantedBase: number;
  installmentIndex: number;
  installmentTotal: number;
  interestAtMaturity: number;
  interestRatePercent: number;
  termDays: number;
  maturityDateIso: string;
  agencyName: string;
  creditOfficerName: string;
  openingDateIso: string;
  periodInterestDateIso: string;
  periodInterestAmount: number;
  interestEarnedToPeriodAmount: number;
  monthsElapsed: number;
  monthsTotal: number;
  primaryProgressRatio: number;
  secondaryProgressRatio: number;
  creditPurposeLabel: string;
  maskedCreditAccount: string;
}

export function getMockLoanDetailSupplement(loanGuid: string): LoanDetailMockSupplement {
  const h = hashGuid(loanGuid);
  let acc = h;
  let digits = '';
  for (let i = 0; i < 11; i += 1) {
    acc = (acc * 1103515245 + 12345) % 2147483647;
    digits += String(Math.abs(acc) % 10);
  }
  const maskedAccountNumber = `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;

  const installmentTotal = Math.max(2, 36 + (h % 48));
  const installmentIndex = 1 + (h % (installmentTotal - 1));

  const monthsTotal = 12 + (h % 13);
  const monthsElapsed = Math.max(
    1,
    Math.min(monthsTotal - 1, 1 + (h % (monthsTotal - 1))),
  );

  const primaryProgressRatio =
    monthsTotal > 0 ? Math.min(1, Math.max(0, monthsElapsed / monthsTotal)) : 0;
  const secondaryProgressRatio = Math.min(
    primaryProgressRatio,
    primaryProgressRatio * (0.88 + ((h % 8) + 1) / 100),
  );

  const dayOpen = 10 + (h % 18);
  const dayMat = 10 + ((h + 3) % 18);
  const openingDateIso = `2025-05-${pad2(dayOpen)}`;
  const maturityDateIso = `2027-05-${pad2(dayMat)}`;
  const periodInterestDateIso = `2026-04-${pad2(10 + (h % 12))}`;

  let accCr = h;
  let creditDigits = '';
  for (let i = 0; i < 3; i += 1) {
    accCr = (accCr * 1103515245 + 12345) % 2147483647;
    creditDigits += String(Math.abs(accCr) % 10);
  }
  const maskedCreditAccount = `Cta. Ahorros ******${creditDigits}`;

  const periodInterestAmount =
    Math.round((15 + (h % 80) + (h % 7) / 10) * 100) / 100;
  const interestEarnedToPeriodAmount =
    Math.round((280 + (h % 220) + (h % 50) / 100) * 100) / 100;

  return {
    productLabel: PRODUCT_LABELS[h % PRODUCT_LABELS.length],
    maskedAccountNumber,
    amountGrantedBase: 2000 + (h % 8000),
    installmentIndex,
    installmentTotal,
    interestAtMaturity: Math.round((150 + (h % 500)) * 100) / 100,
    interestRatePercent: Math.round((5 + (h % 15) / 10) * 10) / 10,
    termDays: 300 + (h % 120),
    maturityDateIso,
    agencyName: AGENCIES[h % AGENCIES.length],
    creditOfficerName: OFFICERS[h % OFFICERS.length],
    openingDateIso,
    periodInterestDateIso,
    periodInterestAmount,
    interestEarnedToPeriodAmount,
    monthsElapsed,
    monthsTotal,
    primaryProgressRatio,
    secondaryProgressRatio,
    creditPurposeLabel: CREDIT_PURPOSES[h % CREDIT_PURPOSES.length],
    maskedCreditAccount,
  };
}
