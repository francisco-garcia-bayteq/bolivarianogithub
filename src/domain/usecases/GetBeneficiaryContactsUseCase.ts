import {BeneficiaryContact} from '../entities/BeneficiaryContact';
import {BeneficiaryRepository} from '../repositories/BeneficiaryRepository';

export class GetBeneficiaryContactsUseCase {
  constructor(private readonly beneficiaryRepository: BeneficiaryRepository) {}

  async execute(): Promise<BeneficiaryContact[]> {
    return this.beneficiaryRepository.getContacts();
  }
}
