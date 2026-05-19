import {NativeModules, Platform} from 'react-native';
import {DEFAULT_PINNING_EXCLUDED_HOSTS} from './pinningExcludedHosts';
import type {TlsPinningState} from './tlsPinningPolicy';

type NativeTlsPinning = {
  setConfig: (
    enabled: boolean,
    expectedSha256Hex: string | null,
    excludedHostsJson: string,
  ) => void;
};

const Native: NativeTlsPinning | undefined =
  NativeModules.TlsPinningModule as NativeTlsPinning | undefined;

/**
 * Propaga la política de pinning al código nativo (OkHttp / NSURLSession).
 * Sin op si el módulo no existe (p. ej. tests).
 */
export function syncTlsPinningNative(state: TlsPinningState): void {
  if (!Native?.setConfig) {
    return;
  }
  const excludedJson = JSON.stringify([...DEFAULT_PINNING_EXCLUDED_HOSTS]);
  Native.setConfig(
    state.pinningEnabled,
    state.expectedSha256Hex,
    excludedJson,
  );
}

export function isTlsPinningNativeAvailable(): boolean {
  return Platform.OS !== 'web' && !!Native?.setConfig;
}
