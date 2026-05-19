import {getDebuggedModeFromNative} from './jailMonkeyBridge';

export function getDebuggedMode(): Promise<boolean> {
  return getDebuggedModeFromNative();
}
