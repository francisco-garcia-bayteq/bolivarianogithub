import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
import type {DeviceSecuritySnapshot} from '../../domain/entities/DeviceSecuritySnapshot';
import type {DeviceSecurityService} from '../../domain/services/DeviceSecurityService';
import {
  getDebuggedMode,
  getDeveloperSettingsModeEnabled,
  isRootOrJailbreakDetected,
} from '../../security/device';

export class DeviceSecurityServiceImpl implements DeviceSecurityService {
  async getSnapshot(): Promise<DeviceSecuritySnapshot> {
    const [isEmulator, isDeveloperModeEnabled, isDebuggedMode] =
      await Promise.all([
        DeviceInfo.isEmulator(),
        getDeveloperSettingsModeEnabled(),
        getDebuggedMode(),
      ]);

    return {
      isRootedOrJailbroken: isRootOrJailbreakDetected(),
      isEmulator,
      isDeveloperModeEnabled,
      developerModeSupported: Platform.OS === 'android',
      isDebuggedMode,
    };
  }
}
