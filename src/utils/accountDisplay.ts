import type {AccountBalance} from '../domain/entities/ContractBalance';

export function accountProductTitle(account: AccountBalance): string {
  if (account.accountKind === 'savings') {
    return 'Cuenta de Ahorros';
  }
  if (account.accountKind === 'checking') {
    return 'Cuenta Corriente';
  }
  return 'Cuenta';
}

export function accountTypeModalLabel(account: AccountBalance): string {
  if (account.accountKind === 'savings') {
    return 'Cuenta de ahorros';
  }
  if (account.accountKind === 'checking') {
    return 'Cuenta corriente';
  }
  return 'Cuenta';
}

const ACCOUNT_KIND_SHORT_LABEL: Record<'checking' | 'savings', string> = {
  savings: 'Cta. Ahorros',
  checking: 'Cta. corriente',
};

export function formatAccountKindLine(account: AccountBalance): string {
  const ak = account.accountKind;
  const kind =
    ak === 'savings' || ak === 'checking'
      ? ACCOUNT_KIND_SHORT_LABEL[ak]
      : 'Cuenta';

  return `${kind} ${account.maskedAccountNumber}`.trim();
}
