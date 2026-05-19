import type {ValidatedCertificateResult} from '../../security/certificate';

export interface CertificateHandshakePersistenceService {
  persistValidatedResult(result: ValidatedCertificateResult): Promise<void>;
}
