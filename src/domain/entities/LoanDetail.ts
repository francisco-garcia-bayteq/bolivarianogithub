/**
 * Detalle de préstamo: datos del contrato (`LoanBalance`) más campos
 * enriquecidos cuando el API no los expone.
 */
export interface LoanDetail {
  loanGuid: string;
  productLabel: string;
  maskedAccountNumber: string;
  nextInstallmentAmount: number;
  nextInstallmentDate: string;
  outstandingBalance: number;
  capitalPaid: number;
  amountGranted: number;
  /** 0–1 para la barra de progreso (capital pagado / monto otorgado). */
  paidProgress: number;
  installmentIndex: number;
  installmentTotal: number;
  interestAtMaturity: number;
  interestRatePercent: number;
  termDays: number;
  maturityDateIso: string;
  agencyName: string;
  creditOfficerName: string;

  /** Monto principal del hero y “Total a recibir” (capital + interés al vencimiento). */
  totalToReceiveAmount: number;
  periodInterestDateIso: string;
  periodInterestAmount: number;
  /** Progreso temporal para la barra (0–1). */
  primaryProgressRatio: number;
  secondaryProgressRatio: number;
  monthsElapsed: number;
  monthsTotal: number;
  termMonthsLabel: string;
  interestEarnedToPeriodAmount: number;
  openingDateIso: string;
  creditPurposeLabel: string;
  maskedCreditAccount: string;
}
