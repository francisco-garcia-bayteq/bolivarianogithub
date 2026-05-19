import type {RegisterAliasContentModel} from '../models/RegisterAliasContentModel';
import type {RegisterAliasResult} from '../../domain/entities/RegisterAliasResult';

export function mapRegisterAliasContentToEntity(
  model: RegisterAliasContentModel,
): RegisterAliasResult {
  return {userMessage: model.userMessage};
}
