import type {AccountBalance} from '../../domain/entities/ContractBalance.ts';
import type {BeneficiaryContact} from '../../domain/entities/BeneficiaryContact.ts';
import {accountProductTitle} from '../../utils/accountDisplay.ts';
import type {BeneficiaryOption} from './transferTypes.ts';

export type ContactTemplate = {
  id: string;
  name: string;
  bankName: string;
  accountHint: string;
};

function accountTypeLabelFromNumeric(accountType: number): string {
  switch (accountType) {
    case 1:
      return 'ahorros';
    case 2:
      return 'corriente';
    default:
      return 'cuenta';
  }
}

function accountTypeHintForContact(b: BeneficiaryContact): string {
  const fromLabel = b.accountTypeLabel?.trim();
  if (fromLabel) {
    return fromLabel.toLowerCase();
  }
  if (typeof b.accountType === 'string') {
    const n = b.accountType.toLowerCase();
    if (n === 'savings') {
      return 'ahorros';
    }
    if (n === 'checking') {
      return 'corriente';
    }
    return n || 'cuenta';
  }
  return accountTypeLabelFromNumeric(b.accountType);
}

export function beneficiaryContactToTemplate(
  b: BeneficiaryContact,
): ContactTemplate {
  return {
    id: b.beneficiaryGuid,
    name: b.contactName,
    bankName: b.bankName,
    accountHint: `Cta. ${accountTypeHintForContact(b)} • **** ${b.lastFourDigits}`,
  };
}

export function templateToBeneficiary(t: ContactTemplate): BeneficiaryOption {
  return {
    id: t.id,
    name: t.name,
    kind: 'contact',
    bankName: t.bankName,
    accountHint: t.accountHint,
  };
}

export function ownAccountToBeneficiary(account: AccountBalance): BeneficiaryOption {
  return {
    id: `own-${account.accountGuid}`,
    name: accountProductTitle(account),
    kind: 'own_account',
    accountHint: account.maskedAccountNumber,
  };
}

export function groupContactsByLetter(
  contacts: ContactTemplate[],
): {title: string; data: ContactTemplate[]}[] {
  const map = new Map<string, ContactTemplate[]>();
  for (const c of contacts) {
    const letter = c.name.trim().charAt(0).toLocaleUpperCase('es-EC');
    const key = /[A-ZÁÉÍÓÚÑ]/i.test(letter) ? letter : '#';
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(c);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([title, data]) => ({title, data}));
}
