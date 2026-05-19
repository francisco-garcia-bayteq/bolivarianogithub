export type BeneficiaryOption = {
  id: string;
  name: string;
  kind: 'own_account' | 'contact';
  bankName?: string;
  accountHint?: string;
};
