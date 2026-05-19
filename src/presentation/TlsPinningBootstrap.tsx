import {useEffect} from 'react';
import {useDI} from '../di';
import {syncTlsPinningFromStorage} from '../security/tls';

/**
 * Sincroniza el estado de pinning TLS desde secure storage al arranque (sesiones ya inicializadas).
 */
export function TlsPinningBootstrap() {
  const {secureStorageService} = useDI();

  useEffect(() => {
    syncTlsPinningFromStorage(secureStorageService).catch(() => {
      /* noop: fallo silencioso al sincronizar pinning en arranque */
    });
  }, [secureStorageService]);

  return null;
}
