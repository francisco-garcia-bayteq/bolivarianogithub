/** Ratio aproximado inversión inicial / total a recibir (referencia diseño). */
const INITIAL_TO_TOTAL_RATIO = 0.529;

const JOINT_HOLDERS = [
  'Cuenca Armijos Edwin',
  'García López María',
  'Pérez Ruiz Juan',
] as const;

const DEBIT_PURPOSES = [
  'Gastos',
  'Servicios',
  'Consumo',
  'Vivienda',
] as const;

function hashGuid(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    const cp = s.codePointAt(i) ?? 0;
    h = (h * 31 + cp) % 2147483647;
  }
  return Math.abs(h);
}

export interface InvestmentDetailMockSupplement {
  maskedAccountNumber: string;
  interestRatePercent: number;
  termDays: number;
  openingDateIso: string;
  maturityDateIso: string;
  irfRetentionAmount: number;
  paymentFrequencyLabel: string;
  jointHolderName: string;
  nextPaymentDateIso: string;
  paidAmount: number;
  remainingToPayAmount: number;
  initialDebtAmount: number;
  totalDebtAmount: number;
  installmentsPaid: number;
  installmentsTotal: number;
  paidProgressRatio: number;
  secondaryProgressRatio: number;
  debitPurposeLabel: string;
  maskedDebitAccount: string;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Fecha ISO YYYY-MM-DD con meses de desfase determinista. */
function offsetMonthIso(baseY: number, baseM: number, baseD: number, addMonths: number): string {
  let y = baseY;
  let m = baseM + addMonths;
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  const dim = new Date(y, m, 0).getDate();
  const d = Math.min(baseD, dim);
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export function getMockInvestmentDetailSupplement(
  investmentGuid: string,
  currentValue: number,
): InvestmentDetailMockSupplement {
  const h = hashGuid(investmentGuid);
  let acc = h;
  let digits = '';
  for (let i = 0; i < 11; i += 1) {
    acc = (acc * 1103515245 + 12345) % 2147483647;
    digits += String(Math.abs(acc) % 10);
  }
  const maskedAccountNumber = `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;

  const rateBase = 5.5 + (h % 11) / 10;

  const openingDateIso = offsetMonthIso(2025, 4, 2, -(h % 3));
  const maturityDateIso = offsetMonthIso(2027, 5, 14, h % 2);
  const nextPaymentDateIso = offsetMonthIso(2026, 5, 15, (h % 5) - 2);

  const installmentsTotal = 12 + (h % 13);
  const installmentsPaid = Math.max(
    1,
    Math.min(
      installmentsTotal - 1,
      Math.floor(installmentsTotal * (0.35 + ((h % 40) + 1) / 100)),
    ),
  );

  const safeValue = Number.isFinite(currentValue) ? Math.max(currentValue, 0) : 0;
  const scale = 3.5 + ((h % 50) / 10);
  const totalDebtAmount =
    Math.round(Math.max(safeValue * scale, safeValue + 100) * 100) / 100;
  const paidAmount =
    Math.round(totalDebtAmount * (installmentsPaid / installmentsTotal) * 100) / 100;
  const remainingToPayAmount =
    Math.round(Math.max(totalDebtAmount - paidAmount, 0) * 100) / 100;

  const initialDebtAmount =
    Math.round(totalDebtAmount * (0.88 + ((h % 20) + 1) / 200) * 100) / 100;

  const paidProgressRatio =
    totalDebtAmount > 0 ? Math.min(1, paidAmount / totalDebtAmount) : 0;
  const secondaryProgressRatio = Math.min(
    paidProgressRatio,
    paidProgressRatio * (0.82 + ((h % 8) + 1) / 100),
  );

  let accDebit = h;
  let debitDigits = '';
  for (let i = 0; i < 3; i += 1) {
    accDebit = (accDebit * 1103515245 + 12345) % 2147483647;
    debitDigits += String(Math.abs(accDebit) % 10);
  }
  const maskedDebitAccount = `Cta. Ahorros ******${debitDigits}`;

  return {
    maskedAccountNumber,
    interestRatePercent: Math.round(rateBase * 10) / 10,
    termDays: 360 + (h % 20),
    openingDateIso,
    maturityDateIso,
    irfRetentionAmount: 0,
    paymentFrequencyLabel: 'Al vencimiento',
    jointHolderName: JOINT_HOLDERS[h % JOINT_HOLDERS.length],
    nextPaymentDateIso,
    paidAmount,
    remainingToPayAmount,
    initialDebtAmount,
    totalDebtAmount,
    installmentsPaid,
    installmentsTotal,
    paidProgressRatio,
    secondaryProgressRatio,
    debitPurposeLabel: DEBIT_PURPOSES[h % DEBIT_PURPOSES.length],
    maskedDebitAccount,
  };
}

export function deriveAmountsFromCurrentValue(totalToReceive: number): {
  initialAmount: number;
  interestAtMaturity: number;
} {
  const safe = Number.isFinite(totalToReceive) ? totalToReceive : 0;
  const initialAmount =
    Math.round(Math.max(safe * INITIAL_TO_TOTAL_RATIO, 0) * 100) / 100;
  const interestAtMaturity =
    Math.round(Math.max(safe - initialAmount, 0) * 100) / 100;
  return {initialAmount, interestAtMaturity};
}
