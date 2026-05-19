import type {AccountBalance} from '../../../domain/entities/ContractBalance';

export {
  accountProductTitle,
  accountTypeModalLabel,
} from '../../../utils/accountDisplay';

export function formatAccountKindLine(account: AccountBalance): string {
  return `${account.accountTypeLabel} ${account.beneficiary.lastFourDigits}`.trim();
}
