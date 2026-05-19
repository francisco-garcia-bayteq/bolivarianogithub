import {NativeModules, Platform} from 'react-native';
import {
  getDebuggedModeFromNative,
  getDeveloperSettingsModeFromNative,
  getJailBrokenFromNative,
  isJailMonkeyNativeLoaded,
} from '../jailMonkeyBridge';

function setPlatformOs(os: string): void {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: os,
  });
}

describe('jailMonkeyBridge', () => {
  let savedJailMonkey: (typeof NativeModules)['JailMonkey'];
  let savedPlatformOs: string;

  beforeEach(() => {
    savedJailMonkey = NativeModules.JailMonkey;
    savedPlatformOs = Platform.OS;
  });

  afterEach(() => {
    NativeModules.JailMonkey = savedJailMonkey;
    setPlatformOs(savedPlatformOs);
    jest.restoreAllMocks();
  });

  it('isJailMonkeyNativeLoaded es true cuando existe el módulo', () => {
    NativeModules.JailMonkey = {isJailBroken: false};
    expect(isJailMonkeyNativeLoaded()).toBe(true);
  });

  it('isJailMonkeyNativeLoaded es false sin módulo', () => {
    delete (NativeModules as {JailMonkey?: unknown}).JailMonkey;
    expect(isJailMonkeyNativeLoaded()).toBe(false);
  });

  it('getJailBrokenFromNative devuelve false si no hay módulo', () => {
    delete (NativeModules as {JailMonkey?: unknown}).JailMonkey;
    expect(getJailBrokenFromNative()).toBe(false);
  });

  it('getJailBrokenFromNative refleja isJailBroken === true', () => {
    NativeModules.JailMonkey = {isJailBroken: true};
    expect(getJailBrokenFromNative()).toBe(true);
  });

  it('getJailBrokenFromNative es false si isJailBroken no es true', () => {
    NativeModules.JailMonkey = {isJailBroken: undefined};
    expect(getJailBrokenFromNative()).toBe(false);
  });

  it('getDeveloperSettingsModeFromNative devuelve false en iOS', async () => {
    setPlatformOs('ios');
    NativeModules.JailMonkey = {
      isDevelopmentSettingsMode: jest.fn(() => Promise.resolve(true)),
    };
    await expect(getDeveloperSettingsModeFromNative()).resolves.toBe(false);
  });

  it('getDeveloperSettingsModeFromNative en Android sin nativo devuelve false', async () => {
    setPlatformOs('android');
    delete (NativeModules as {JailMonkey?: unknown}).JailMonkey;
    await expect(getDeveloperSettingsModeFromNative()).resolves.toBe(false);
  });

  it('getDeveloperSettingsModeFromNative en Android llama al nativo', async () => {
    setPlatformOs('android');
    const fn = jest.fn(() => Promise.resolve(true));
    NativeModules.JailMonkey = {isDevelopmentSettingsMode: fn};
    await expect(getDeveloperSettingsModeFromNative()).resolves.toBe(true);
    expect(fn).toHaveBeenCalled();
  });

  it('getDeveloperSettingsModeFromNative es false si el método no es función', async () => {
    setPlatformOs('android');
    NativeModules.JailMonkey = {isDevelopmentSettingsMode: 'nope' as never};
    await expect(getDeveloperSettingsModeFromNative()).resolves.toBe(false);
  });

  it('getDeveloperSettingsModeFromNative atrapa rechazos del nativo', async () => {
    setPlatformOs('android');
    NativeModules.JailMonkey = {
      isDevelopmentSettingsMode: jest.fn(() => Promise.reject(new Error('fail'))),
    };
    await expect(getDeveloperSettingsModeFromNative()).resolves.toBe(false);
  });

  it('getDebuggedModeFromNative llama isDebuggedMode cuando existe', async () => {
    const fn = jest.fn(() => Promise.resolve(true));
    NativeModules.JailMonkey = {isDebuggedMode: fn};
    await expect(getDebuggedModeFromNative()).resolves.toBe(true);
    expect(fn).toHaveBeenCalled();
  });

  it('getDebuggedModeFromNative es false sin módulo', async () => {
    delete (NativeModules as {JailMonkey?: unknown}).JailMonkey;
    await expect(getDebuggedModeFromNative()).resolves.toBe(false);
  });

  it('getDebuggedModeFromNative es false si isDebuggedMode no es función', async () => {
    NativeModules.JailMonkey = {isDebuggedMode: 'x' as never};
    await expect(getDebuggedModeFromNative()).resolves.toBe(false);
  });

  it('getDebuggedModeFromNative atrapa errores del nativo', async () => {
    NativeModules.JailMonkey = {
      isDebuggedMode: jest.fn(() => Promise.reject(new Error('dbg'))),
    };
    await expect(getDebuggedModeFromNative()).resolves.toBe(false);
  });
});
