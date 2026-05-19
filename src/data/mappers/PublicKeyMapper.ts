import {PublicKey} from '../../domain/entities/PublicKey';
import {PublicKeyContentModel} from '../models/PublicKeyContentModel';

export function mapPublicKeyContentToEntity(
  model: PublicKeyContentModel,
): PublicKey {
  return {value: model.publicKey};
}
