import {DeviceSecurityServiceImpl} from '../../../src/data/services/DeviceSecurityServiceImpl';
import DeviceInfo from 'react-native-device-info';
import {NativeModules} from 'react-native';

jest.mock('react-native-device-info');

describe('DeviceSecurityServiceImpl', () => {
  const jm = NativeModules.JailMonkey as {
    isJailBroken: boolean;
    isDevelopmentSettingsMode: jest.Mock;
    isDebuggedMode: jest.Mock;
  };

  beforeEach(() => {
    jest.mocked(DeviceInfo.isEmulator).mockResolvedValue(true);
    jm.isJailBroken = true;
    jm.isDevelopmentSettingsMode.mockResolvedValue(false);
    jm.isDebuggedMode.mockResolvedValue(true);
  });

  test('getSnapshot aggregates native signals', async () => {
    const svc = new DeviceSecurityServiceImpl();
    const s = await svc.getSnapshot();
    expect(s.isEmulator).toBe(true);
    expect(s.isRootedOrJailbroken).toBe(true);
    expect(s.isDeveloperModeEnabled).toBe(false);
    expect(s.isDebuggedMode).toBe(true);
  });
});
