import {AppState, type AppStateStatus} from 'react-native';
import {
  buildInfoFingerprintModelFromSnapshot,
  mapAppStateStatusToDeviceState,
  infoFingerprintModelToJson,
} from '../../../src/data/api/infoFingerprintModel';
import type {DeviceSecuritySnapshot} from '../../../src/domain/entities/DeviceSecuritySnapshot';

describe('infoFingerprintModel', () => {
  const baseSnapshot: DeviceSecuritySnapshot = {
    isRootedOrJailbroken: false,
    isEmulator: false,
    isDeveloperModeEnabled: false,
    developerModeSupported: true,
    isDebuggedMode: false,
  };

  test('mapAppStateStatusToDeviceState maps RN AppState to foreground/background/inactive', () => {
    expect(mapAppStateStatusToDeviceState('active')).toBe('foreground');
    expect(mapAppStateStatusToDeviceState('background')).toBe('background');
    expect(mapAppStateStatusToDeviceState('inactive')).toBe('inactive');
    expect(mapAppStateStatusToDeviceState('unknown')).toBe('unknown');
  });

  test('buildInfoFingerprintModelFromSnapshot maps security fields; deviceState from AppState', () => {
    const m = buildInfoFingerprintModelFromSnapshot({
      ...baseSnapshot,
      isRootedOrJailbroken: true,
      isEmulator: true,
      isDebuggedMode: true,
    });
    expect(m.deviceState).toBe(
      mapAppStateStatusToDeviceState(AppState.currentState as AppStateStatus),
    );
    expect(m.isRoot).toBe(true);
    expect(m.isPhysicalDevice).toBe(false);
    expect(m.isDebugger).toBe(true);
  });

  test('infoFingerprintModelToJson serializes model', () => {
    const json = infoFingerprintModelToJson({
      deviceState: 'foreground',
      isRoot: false,
      isDebugger: false,
      isDevelopment: false,
      isPhysicalDevice: true,
    });
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(parsed.deviceState).toBe('foreground');
    expect(parsed.isPhysicalDevice).toBe(true);
  });
});
