import {AppState, type AppStateStatus} from 'react-native';
import type {DeviceSecuritySnapshot} from '../../domain/entities/DeviceSecuritySnapshot';

export interface InfoFingerprintModel {
  /** Primer / segundo plano: `foreground` | `background` | `inactive` (ver `getAppLifecycleDeviceState`). */
  deviceState: string;
  isRoot: boolean;
  isDebugger: boolean;
  isDevelopment: boolean;
  isPhysicalDevice: boolean;
}

/**
 * Mapea el estado nativo de React Native a etiquetas de primer/segundo plano para el backend.
 */
export function mapAppStateStatusToDeviceState(status: AppStateStatus): string {
  switch (status) {
    case 'active':
      return 'foreground';
    case 'background':
      return 'background';
    case 'inactive':
      return 'inactive';
    default:
      return String(status);
  }
}

/**
 * Control de ciclo de vida: primer plano (`foreground`) vs segundo plano (`background`) / transición (`inactive`).
 */
export function getAppLifecycleDeviceState(): string {
  return mapAppStateStatusToDeviceState(AppState.currentState);
}

export function buildInfoFingerprintModelFromSnapshot(
  snapshot: DeviceSecuritySnapshot,
): InfoFingerprintModel {
  return {
    deviceState: getAppLifecycleDeviceState(),
    isRoot: snapshot.isRootedOrJailbroken,
    isDebugger: snapshot.isDebuggedMode,
    isDevelopment: snapshot.isDeveloperModeEnabled,
    isPhysicalDevice: !snapshot.isEmulator,
  };
}

export function infoFingerprintModelToJson(model: InfoFingerprintModel): string {
  return JSON.stringify({
    deviceState: model.deviceState,
    isRoot: model.isRoot,
    isDebugger: model.isDebugger,
    isDevelopment: model.isDevelopment,
    isPhysicalDevice: model.isPhysicalDevice,
  });
}
