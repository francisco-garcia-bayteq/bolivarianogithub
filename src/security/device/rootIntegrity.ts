import {getJailBrokenFromNative} from './jailMonkeyBridge';

/** Root (Android) o jailbreak (iOS), según JailMonkey. */
export function isRootOrJailbreakDetected(): boolean {
  return getJailBrokenFromNative();
}
