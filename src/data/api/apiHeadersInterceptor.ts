import {AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {devLog} from './devLog';
import {generateHMacForContentHeaderFromAxios} from '../../security/http/generateHMacContentHeader';
import {rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64} from '../../security/certificate/rsaUtils';
import type {SecureStorageService} from '../../domain/services/SecureStorageService';
import {SecureStorageKeys} from '../datasources/storage/SecureStorageKeys';
import {ensureDeviceId} from '../bootstrap/ensureDeviceId';
import {
  loadDeviceHeaderSnapshot,
  type DeviceHeaderSnapshot,
} from './loadDeviceHeaderSnapshot';
import {
  buildInfoFingerprintModelFromSnapshot,
  infoFingerprintModelToJson,
} from './infoFingerprintModel';
import type {DeviceSecurityService} from '../../domain/services/DeviceSecurityService';
import type {ServerPublicKeySessionStore} from '../../domain/services/ServerPublicKeySessionStore';

const LOG = 'ApiHeaders/interceptor';

/**
 * Rutas de bootstrap: no disponen de public key en sesión todavía,
 * por lo que X-Secret se envía vacío y la huella cifrada también.
 */
const BOOTSTRAP_PATH_SEGMENTS = [
  'Security/public-key',
  'security/certificate',
] as const;

function isBootstrapRequest(config: InternalAxiosRequestConfig): boolean {
  const pathOnly = (config.url ?? '').split('?')[0] ?? '';
  const absolute = `${config.baseURL ?? ''}${pathOnly}`;
  return BOOTSTRAP_PATH_SEGMENTS.some(
    segment => pathOnly.includes(segment) || absolute.includes(segment),
  );
}

export type ApiHeadersInterceptorDeps = {
  baseURL: string;
  secretKey: string;
  requestId: string;
  secureStorage: SecureStorageService;
  /** PEM en memoria tras el primer GET a public-key; si no hay, fallback embebido. */
  serverPublicKeySessionStore: ServerPublicKeySessionStore;
  serverPublicPemBase64: string;
  deviceSecurityService: DeviceSecurityService;
};

function resolveServerPublicKeyPemBase64ForHeaders(
  sessionStore: ServerPublicKeySessionStore,
  embeddedFallbackPemBase64: string,
): string {
  const fromSession = sessionStore.get()?.trim() ?? '';
  if (fromSession) {
    return fromSession;
  }
  return embeddedFallbackPemBase64;
}

/**
 * Cifrado del fingerprint: mismo esquema que `X-Secret` y que las credenciales en
 * `LoginUseCase` (RSA-OAEP SHA-1 + doble Base64 con la clave pública del servicio);
 * el texto plano es el JSON UTF-8 del modelo de huella.
 */
async function buildEncryptedFingerprint(
  serverPublicPemBase64: string,
  deviceSecurityService: DeviceSecurityService,
): Promise<string> {
  const snapshot = await deviceSecurityService.getSnapshot();
  const model = buildInfoFingerprintModelFromSnapshot(snapshot);
  const json = infoFingerprintModelToJson(model);
  return rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64(
    serverPublicPemBase64,
    json,
  );
}

export function attachApiHeadersInterceptor(
  client: AxiosInstance,
  deps: ApiHeadersInterceptorDeps,
): void {
  let snapshotPromise: Promise<DeviceHeaderSnapshot> | null = null;
  const loadSnapshot = (): Promise<DeviceHeaderSnapshot> => {
    snapshotPromise ??= loadDeviceHeaderSnapshot();
    return snapshotPromise;
  };

  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        config.baseURL = deps.baseURL;
        const timeStamp = String(Math.floor(Date.now() / 1000));
        const skipPublicKeyBootstrap = isBootstrapRequest(config);

        const serverPublicKeyPemBase64 = skipPublicKeyBootstrap
          ? ''
          : resolveServerPublicKeyPemBase64ForHeaders(
              deps.serverPublicKeySessionStore,
              deps.serverPublicPemBase64,
            );

        const [
          authorization,
          deviceId,
          xSecret,
          xFingerPrint,
          snapshot,
        ] = await Promise.all([
          deps.secureStorage
            .get(SecureStorageKeys.AUTH_TOKEN)
            .then(t => t ?? ''),
          ensureDeviceId(deps.secureStorage),
          skipPublicKeyBootstrap
            ? Promise.resolve('')
            : Promise.resolve(
                rsaOaepEncryptUtf8MaterialPemBase64ToDoubleBase64(
                  serverPublicKeyPemBase64,
                  deps.secretKey,
                ),
              ),
          skipPublicKeyBootstrap
            ? Promise.resolve('')
            : buildEncryptedFingerprint(
                serverPublicKeyPemBase64,
                deps.deviceSecurityService,
              ),
          loadSnapshot(),
        ]);

        const xContent = generateHMacForContentHeaderFromAxios(
          deps.secretKey,
          timeStamp,
          config,
        );

        
        const headers = AxiosHeaders.from(config.headers ?? {});

        const set = (key: string, value: string) => {
          headers.set(key, value);
        };

        set('Authorization', 'Bearer ' + authorization);
        set('X-Platform', snapshot.platform);
        set('X-Version', snapshot.version);
        set('X-Device', deviceId);
        set('X-Model', snapshot.model);
        set('X-SystemOperationVersion', snapshot.systemVersion);
        set('X-Brand', snapshot.brand);
        set('X-Content', xContent);
        set('X-Time', timeStamp);
        set('X-Secret', xSecret);
        set('X-FingerPrint', xFingerPrint);
        set('X-RequestId', deps.requestId);                
        config.headers = headers;
        return config;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        devLog(LOG, 'request interceptor failed', {message});
        throw e instanceof Error ? e : new Error(message);
      }
    },
    error => {
      throw error;
    },
  );
}
