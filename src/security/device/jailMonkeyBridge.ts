import { NativeModules, Platform } from 'react-native';

/**
 * Acceso defensivo al nativo JailMonkey: el paquete `jail-monkey` en JS lanza
 * si el módulo no está enlazado (build antiguo, error de autolinking). Aquí
 * leemos `NativeModules` y usamos valores seguros para no romper las peticiones HTTP.
 */
type JailMonkeyNativeModule = {
  isJailBroken?: boolean;
  isDevelopmentSettingsMode?: () => Promise<boolean>;
  isDebuggedMode?: () => Promise<boolean>;
};

function getModule(): JailMonkeyNativeModule | undefined {
  return NativeModules.JailMonkey as JailMonkeyNativeModule | undefined;
}

let warnedMissingNative = false;

function warnMissingNativeOnce(): void {
  if (!__DEV__ || warnedMissingNative) {
    return;
  }
  warnedMissingNative = true;
  console.warn(
    '[BBApp][DeviceSecurity] JailMonkey no está disponible en el runtime nativo. ' +
      'Tras instalar la dependencia, ejecuta un rebuild completo de la app (iOS: pod install + rebuild; Android: ./gradlew clean + rebuild). ' +
      'Se asumen valores seguros (sin root / sin modo desarrollador) hasta que el módulo cargue.',
  );
}

export function isJailMonkeyNativeLoaded(): boolean {
  return getModule() != null;
}

/** Constante sincronizada desde el nativo (getConstants); false si el módulo no existe. */
export function getJailBrokenFromNative(): boolean {
  const jm = getModule();
  if (jm == null) {
    warnMissingNativeOnce();
    return false;
  }
  return jm.isJailBroken === true;
}

export async function getDeveloperSettingsModeFromNative(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  const jm = getModule();
  if (jm == null) {
    warnMissingNativeOnce();
    return false;
  }
  const fn = jm.isDevelopmentSettingsMode;
  if (typeof fn !== 'function') {
    return false;
  }
  try {
    return await fn();
  } catch {
    return false;
  }
}

export async function getDebuggedModeFromNative(): Promise<boolean> {
  const jm = getModule();
  if (jm == null) {
    warnMissingNativeOnce();
    return false;
  }
  const fn = jm.isDebuggedMode;
  if (typeof fn !== 'function') {
    return false;
  }
  try {
    return await fn();
  } catch {
    return false;
  }
}
