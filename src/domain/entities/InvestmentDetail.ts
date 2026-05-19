/**
 * Vista de detalle de inversión: combina datos del API (`ContractBalance.investments`)
 * con campos enriquecidos en presentación cuando el servicio no los expone.
 */
export interface InvestmentDetail {
  investmentGuid: string;
  productName: string;
  currency: string;
  currentValue: number;
  maskedAccountNumber: string;
  initialAmount: number;
  totalToReceive: number;
  interestAtMaturity: number;
  interestRatePercent: number;
  termDays: number;
  openingDateIso: string;
  maturityDateIso: string;
  irfRetentionAmount: number;
  paymentFrequencyLabel: string;
  jointHolderName: string;

  /** Próximo pago (ISO) — enriquecido en presentación. */
  nextPaymentDateIso: string;
  paidAmount: number;
  remainingToPayAmount: number;
  initialDebtAmount: number;
  totalDebtAmount: number;
  installmentsPaid: number;
  installmentsTotal: number;
  /** Ancho relativo del primer segmento de la barra (0–1). */
  paidProgressRatio: number;
  /** Segundo segmento visual (0–1), ≤ paidProgressRatio en el diseño. */
  secondaryProgressRatio: number;
  debitPurposeLabel: string;
  maskedDebitAccount: string;
}
