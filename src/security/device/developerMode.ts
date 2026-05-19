import {getDeveloperSettingsModeFromNative} from './jailMonkeyBridge';

/** Opciones de desarrollador del sistema (Android). En iOS resuelve a false. */
export function getDeveloperSettingsModeEnabled(): Promise<boolean> {
  return getDeveloperSettingsModeFromNative();
}
