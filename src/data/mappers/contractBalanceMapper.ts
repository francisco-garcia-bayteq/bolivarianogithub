import type {BeneficiaryContact} from '../../domain/entities/BeneficiaryContact';
import {
  AccountKind,
  AccountBalance,
  ContractBalance,
  CreditCardBalance,
  FrequentPayment,
  HomeBanner,
  HomeDashboardIcon,
  HomeRecentTransaction,
  InvestmentBalance,
  LoanBalance,
} from '../../domain/entities/ContractBalance';
import {
  AccountBalanceModel,
  ContractBalanceContentModel,
  CreditCardBalanceModel,
  FrequentPaymentModel,
  HomeBannerModel,
  HomeDashboardIconModel,
  HomeRecentTransactionModel,
  InvestmentBalanceModel,
  LoanBalanceModel,
} from '../models/ContractBalanceContentModel';
import {mapDtoToEntity} from './beneficiaryMapper';

/** Valores provisionales hasta documentación del API */
export const ACCOUNT_TYPE_SAVINGS = 1;
export const ACCOUNT_TYPE_CHECKING = 2;

function mapAccountKindFromNumeric(accountType: number): AccountKind {
  if (accountType === ACCOUNT_TYPE_SAVINGS) {
    return 'savings';
  }
  if (accountType === ACCOUNT_TYPE_CHECKING) {
    return 'checking';
  }
  return 'other';
}

function mapAccountKindFromString(accountType: string): AccountKind {
  const normalized = accountType.toLowerCase();
  if (normalized === 'savings' || normalized === 'checking') {
    return normalized;
  }
  return 'other';
}

function resolveAccountKind(accountType: number | string): AccountKind {
  if (typeof accountType === 'number') {
    return mapAccountKindFromNumeric(accountType);
  }
  return mapAccountKindFromString(accountType);
}

function lastFourFromMasked(maskedAccountNumber: string): string {
  const digits = maskedAccountNumber.replaceAll(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  return digits.length > 0 ? digits.padStart(4, '0').slice(-4) : '0000';
}

function syntheticBeneficiaryForAccount(
  model: AccountBalanceModel,
): BeneficiaryContact {
  const label = model.accountTypeLabel?.trim() || 'Cuenta propia';
  return {
    beneficiaryGuid: `own-${model.accountGuid}`,
    contactName: label,
    bankName: '',
    accountType: model.accountType,
    lastFourDigits: lastFourFromMasked(model.maskedAccountNumber),
    accountTypeLabel: model.accountTypeLabel,
  };
}

function mapAccount(model: AccountBalanceModel): AccountBalance {
  const beneficiary = model.beneficiary
    ? mapDtoToEntity(model.beneficiary)
    : syntheticBeneficiaryForAccount(model);

  return {
    accountGuid: model.accountGuid,
    maskedAccountNumber: model.maskedAccountNumber,
    accountKind: resolveAccountKind(model.accountType),
    balance: model.balance,
    beneficiary,
    maskedAccountHome:
      model.maskedAccountHome ?? model.maskedAccountNumber ?? '',
    accountTypeLabel: model.accountTypeLabel ?? '',
    accountAlias: model.accountAlias,
  };
}

function mapCreditCard(model: CreditCardBalanceModel): CreditCardBalance {
  return {
    maskedCardNumber: model.maskedCardNumber,
    totalDue: model.totalDue,
    maxPaymentDate: model.maxPaymentDate,
  };
}

function mapLoan(model: LoanBalanceModel): LoanBalance {
  return {
    loanGuid: model.loanGuid,
    outstandingBalance: model.outstandingBalance,
    nextInstallmentAmount: model.nextInstallmentAmount,
    nextInstallmentDate: model.nextInstallmentDate,
  };
}

function mapInvestment(model: InvestmentBalanceModel): InvestmentBalance {
  return {
    investmentGuid: model.investmentGuid,
    productName: model.productName,
    currentValue: model.currentValue,
    currency: model.currency,
  };
}

function mapFrequentPayment(model: FrequentPaymentModel): FrequentPayment {
  return {
    beneficiaryName: model.beneficiaryName,
    beneficiaryType: model.beneficiaryType,
  };
}

function mapHomeBanner(model: HomeBannerModel): HomeBanner {
  return {
    text: model.text,
    buttonText: model.buttonText,
    buttonLink: model.buttonLink,
    landscape: model.landscape,
    durationMilliseconds: model.durationMilliseconds,
  };
}

function mapHomeDashboardIcon(model: HomeDashboardIconModel): HomeDashboardIcon {
  return {
    iconCode: model.iconCode,
    text: model.text,
  };
}

function mapHomeRecentTransaction(
  model: HomeRecentTransactionModel,
): HomeRecentTransaction {
  return {
    transactionGuid: model.transactionGuid,
    transactionIdentifier: model.transactionIdentifier,
    beneficiaryName: model.beneficiaryName,
    beneficiaryAccountType: model.beneficiaryAccountType,
    beneficiaryAccountTypeLabel: model.beneficiaryAccountTypeLabel,
    beneficiaryAccountNumber: model.beneficiaryAccountNumber,
    ownerAccountType: model.ownerAccountType,
    ownerAccountLabel: model.ownerAccountLabel,
    accountNumber: model.accountNumber,
    accountType: model.accountType,
    accountTypeLabel: model.accountTypeLabel,
    amount: model.amount,
    transferDate: model.transferDate,
    transactionTypeLabel: model.transactionTypeLabel,
    transactionType: model.transactionType,
    concept: model.concept,
    balanceAfterTransaction: model.balanceAfterTransaction,
    allowedShared: model.allowedShared,
  };
}

export function mapContractBalanceContentToEntity(
  model: ContractBalanceContentModel,
): ContractBalance {
  return {
    accounts: (model.accounts ?? []).map(mapAccount),
    creditCards: (model.creditCards ?? []).map(mapCreditCard),
    loans: (model.loans ?? []).map(mapLoan),
    investments: (model.investments ?? []).map(mapInvestment),
    frequentPayments: (model.frequentPayments ?? []).map(mapFrequentPayment),
    banners: (model.banners ?? []).map(mapHomeBanner),
    homeDashboardIcons: (model.homeDashboardIcons ?? []).map(
      mapHomeDashboardIcon,
    ),
    recentTransactions: (model.recentTransactions ?? []).map(
      mapHomeRecentTransaction,
    ),
  };
}
