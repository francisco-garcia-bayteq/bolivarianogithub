export interface BeneficiaryContactDto {
  beneficiaryGuid: string;
  contactName: string;
  bankName: string;
  /** Código numérico (contactos) o texto (p. ej. cuentas propias en ContractBalance). */
  accountType: number | string;
  lastFourDigits: string;
  accountTypeLabel?: string;
  beneficiaryAccountNumber?: string;
}

export interface BeneficiaryContactsContentModel {
  contacts: BeneficiaryContactDto[];
}
