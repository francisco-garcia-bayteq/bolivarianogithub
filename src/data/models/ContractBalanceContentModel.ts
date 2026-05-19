import type {BeneficiaryContactDto} from './BeneficiaryContactsContentModel';

export interface AccountBalanceModel {
  accountGuid: string;
  maskedAccountNumber: string;
  accountType: number | string;
  balance: number;
  beneficiary?: BeneficiaryContactDto;
  maskedAccountHome?: string;
  accountTypeLabel?: string;
  accountAlias?: string;
}

export interface CreditCardBalanceModel {
  maskedCardNumber: string;
  totalDue: number;
  maxPaymentDate: string;
}

export interface LoanBalanceModel {
  loanGuid: string;
  outstandingBalance: number;
  nextInstallmentAmount: number;
  nextInstallmentDate: string;
}

export interface InvestmentBalanceModel {
  investmentGuid: string;
  productName: string;
  currentValue: number;
  currency: string;
}

export interface FrequentPaymentModel {
  beneficiaryName: string;
  beneficiaryType: string;
}

export interface HomeBannerModel {
  text: string;
  buttonText: string;
  buttonLink: string;
  landscape: string;
  durationMilliseconds?: number;
}

export interface HomeDashboardIconModel {
  iconCode: string;
  text: string;
}

export interface HomeRecentTransactionModel {
  transactionGuid: string;
  transactionIdentifier: string;
  beneficiaryName: string;
  beneficiaryAccountType: string;
  beneficiaryAccountTypeLabel: string;
  beneficiaryAccountNumber: string;
  ownerAccountType: string;
  ownerAccountLabel: string;
  accountNumber: string;
  accountType: string;
  accountTypeLabel: string;
  amount: number;
  transferDate: string;
  transactionTypeLabel: string;
  transactionType: string;
  concept: string;
  balanceAfterTransaction: number;
  allowedShared: boolean;
}

export interface ContractBalanceContentModel {
  accounts: AccountBalanceModel[];
  creditCards: CreditCardBalanceModel[];
  loans: LoanBalanceModel[];
  investments: InvestmentBalanceModel[];
  frequentPayments: FrequentPaymentModel[];
  banners?: HomeBannerModel[];
  homeDashboardIcons?: HomeDashboardIconModel[];
  recentTransactions?: HomeRecentTransactionModel[];
}
