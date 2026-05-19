import type {LoanBalance} from '../../domain/entities/ContractBalance';
import type {LoanDetail} from '../../domain/entities/LoanDetail';
import {getMockLoanDetailSupplement} from './loanDetailMocks';

export function buildLoanDetail(loan: LoanBalance): LoanDetail {
  const mock = getMockLoanDetailSupplement(loan.loanGuid);
  const outstanding = Math.max(0, loan.outstandingBalance);
  let amountGranted = mock.amountGrantedBase + outstanding;
  if (amountGranted <= outstanding) {
    amountGranted = outstanding + 500;
  }
  const capitalPaid =
    Math.round(Math.max(0, amountGranted - outstanding) * 100) / 100;
  const paidProgress =
    amountGranted > 0
      ? Math.min(1, Math.max(0, capitalPaid / amountGranted))
      : 0;

  const totalToReceiveAmount =
    Math.round((amountGranted + mock.interestAtMaturity) * 100) / 100;

  const termMonths = Math.max(1, Math.round(mock.termDays / 30));
  const termMonthsLabel = `${termMonths} meses`;

  return {
    loanGuid: loan.loanGuid,
    productLabel: mock.productLabel,
    maskedAccountNumber: mock.maskedAccountNumber,
    nextInstallmentAmount: loan.nextInstallmentAmount,
    nextInstallmentDate: loan.nextInstallmentDate,
    outstandingBalance: outstanding,
    capitalPaid,
    amountGranted,
    paidProgress,
    installmentIndex: mock.installmentIndex,
    installmentTotal: mock.installmentTotal,
    interestAtMaturity: mock.interestAtMaturity,
    interestRatePercent: mock.interestRatePercent,
    termDays: mock.termDays,
    maturityDateIso: mock.maturityDateIso,
    agencyName: mock.agencyName,
    creditOfficerName: mock.creditOfficerName,
    totalToReceiveAmount,
    periodInterestDateIso: mock.periodInterestDateIso,
    periodInterestAmount: mock.periodInterestAmount,
    primaryProgressRatio: mock.primaryProgressRatio,
    secondaryProgressRatio: mock.secondaryProgressRatio,
    monthsElapsed: mock.monthsElapsed,
    monthsTotal: mock.monthsTotal,
    termMonthsLabel,
    interestEarnedToPeriodAmount: mock.interestEarnedToPeriodAmount,
    openingDateIso: mock.openingDateIso,
    creditPurposeLabel: mock.creditPurposeLabel,
    maskedCreditAccount: mock.maskedCreditAccount,
  };
}
