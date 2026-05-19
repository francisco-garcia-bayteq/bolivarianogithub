import {normalizePemKeyMaterialBase64} from '../../security/certificate/rsaUtils';
import {PublicKey} from '../entities/PublicKey';
import {SecurityRepository} from '../repositories/SecurityRepository';
import type {ServerPublicKeySessionStore} from '../services/ServerPublicKeySessionStore';

export class GetPublicKeyUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly sessionStore: ServerPublicKeySessionStore,
  ) {}

  /**
   * @param force Si es `true`, ignora el caché en memoria y siempre consulta el servicio.
   *              Usar `true` en el flujo de login para garantizar una clave fresca por intento.
   */
  async execute(force = false): Promise<PublicKey> {
    const cached = this.sessionStore.get()?.trim() ?? '';
    if (cached && !force) {
      return {value: cached};
    }

    const publicKey = await this.securityRepository.getPublicKey();
    const trimmed = publicKey.value.trim();
    if (!trimmed) {
      throw new Error('La clave pública recibida no es válida');
    }
    const pemBase64 = normalizePemKeyMaterialBase64(trimmed);
    this.sessionStore.set(pemBase64);
    return {value: pemBase64};
  }
}
