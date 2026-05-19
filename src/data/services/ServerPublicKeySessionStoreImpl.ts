import type {ServerPublicKeySessionStore} from '../../domain/services/ServerPublicKeySessionStore';

export class ServerPublicKeySessionStoreImpl implements ServerPublicKeySessionStore {
  private value: string | null = null;

  get(): string | null {
    return this.value;
  }

  set(next: string): void {
    this.value = next;
  }
}
