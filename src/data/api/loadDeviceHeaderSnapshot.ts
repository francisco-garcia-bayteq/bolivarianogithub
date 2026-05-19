import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {formatAppVersionHeader} from '../../utils/appVersion';

export interface DeviceHeaderSnapshot {
  platform: string;
  /** Valor para `X-Version`: marketing + build, p. ej. `1.0.0.1`. */
  version: string;
  model: string;
  brand: string;
  systemVersion: string;
}

/** Solo caracteres alfanuméricos (paridad Flutter). */
export function alphanumericDeviceField(value: string): string {
  return value.replaceAll(/[^a-zA-Z0-9]/g, '');
}

export async function loadDeviceHeaderSnapshot(): Promise<DeviceHeaderSnapshot> {
  const [marketingVersion, buildNumber, model, brand, systemVersion] =
    await Promise.all([
      Promise.resolve(DeviceInfo.getVersion()),
      Promise.resolve(DeviceInfo.getBuildNumber()),
      Promise.resolve(DeviceInfo.getModel()),
      Promise.resolve(DeviceInfo.getBrand()),
      Promise.resolve(DeviceInfo.getSystemVersion()),
    ]);

  const version = formatAppVersionHeader(marketingVersion, buildNumber);

  return {
    platform: Platform.OS === 'android' ? 'ANDROID' : 'IOS',
    version,
    model: alphanumericDeviceField(model),
    brand: alphanumericDeviceField(brand),
    systemVersion,
  };
}
