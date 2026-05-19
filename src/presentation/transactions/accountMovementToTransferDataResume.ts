import type {AccountMovement} from '../../domain/entities/AccountMovement';
import type {TransferDataResume} from '../transfer/transferResult/TransferModalSuccess';
import {formatMoneyEc} from '../../utils/formatMoneyEc';

function beneficiaryAccountHint(m: AccountMovement): string {
  const parts = [
    m.beneficiaryAccountTypeLabel,
    m.beneficiaryAccountNumber,
  ].filter(Boolean);
  return parts.join(' ').trim();
}

function fromAccountLine(m: AccountMovement): string {
  const parts = [m.accountTypeLabel, m.accountNumber].filter(Boolean);
  return parts.join(' ').trim();
}

/**
 * Construye el mismo payload que el comprobante post-transferencia para compartir desde movimientos.
 */
export function accountMovementToTransferDataResume(
  m: AccountMovement,
  voucherDisplayDate: string,
): TransferDataResume {
  const abs = Math.abs(m.amount);
  const concept = m.concept?.trim() ?? '';
  return {
    amountCents: String(Math.round(abs * 100)),
    displayAmount: formatMoneyEc(abs),
    beneficiary: {
      id: m.transactionGuid,
      name: m.beneficiaryName,
      kind: 'contact',
      accountHint: beneficiaryAccountHint(m),
    },
    fromHolderName: m.ownerAccountLabel,
    fromAccountLine: fromAccountLine(m),
    accountId: m.transactionGuid,
    concept,
    transactionIdentifier: m.transactionIdentifier || m.transactionGuid,
    voucherDisplayDate,
    fromAccountTitle: m.ownerAccountLabel,
    fromAccountSubtitle: fromAccountLine(m),
    toAccountTitle: m.beneficiaryName,
    toAccountSubtitle: beneficiaryAccountHint(m),
  };
}
