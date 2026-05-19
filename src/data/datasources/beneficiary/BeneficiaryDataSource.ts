import {BeneficiaryContactsContentModel} from '../../models/BeneficiaryContactsContentModel';

export interface BeneficiaryDataSource {
  getContacts(): Promise<BeneficiaryContactsContentModel>;
}
