export interface BeneficiaryContact {
  beneficiaryGuid: string;
  contactName: string;
  bankName: string;
  /** Código numérico (API contactos) o texto (p. ej. tipo de cuenta propia). */
  accountType: number | string;
  lastFourDigits: string;
  accountTypeLabel?: string;
  beneficiaryAccountNumber?: string;
}
