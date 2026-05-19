import type {BeneficiaryOption} from '../transferTypes';

export type TransferReviewRouteParams = {
  amountCents: number;
  displayAmount: string;
  beneficiary: BeneficiaryOption;
  fromHolderName: string;
  fromAccountLine: string;
  fromAccountTitle: string;
  fromAccountSubtitle: string;
  toAccountTitle: string;
  toAccountSubtitle: string;
  fromBalanceDisplay: string;
  toBalanceDisplay: string;
  accountId: string;
  concept: string;
  fromAccountSubtitleMasked:string;
  toAccountSubtitleMasked:string;
  resultFromOtp?:{
    otpValidated:boolean
  }
};
