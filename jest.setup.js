/* eslint-env jest */
const {Buffer} = require('buffer');
global.Buffer = Buffer;

jest.mock('react-native-base64', () => {
  const BufferImpl = require('buffer').Buffer;
  return {
    __esModule: true,
    default: {
      encodeFromByteArray: (arr) =>
        BufferImpl.from(
          arr instanceof Uint8Array ? arr : Uint8Array.from(arr),
        ).toString('base64'),
      encode: (s) => BufferImpl.from(s, 'latin1').toString('base64'),
      decode: (b64) => BufferImpl.from(b64, 'base64').toString('latin1'),
    },
  };
});

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-device-info', () => ({
  /** API real es síncrona; valores por defecto para tests que importan el módulo. */
  getVersion: jest.fn(() => '0.0.1'),
  getBuildNumber: jest.fn(() => '1'),
  getModel: jest.fn(() => Promise.resolve('TestModel')),
  getBrand: jest.fn(() => Promise.resolve('TestBrand')),
  getSystemVersion: jest.fn(() => Promise.resolve('17.0')),
  isEmulator: jest.fn(() => Promise.resolve(false)),
}));

const ReactNative = require('react-native');
if (ReactNative.NativeModules.JailMonkey == null) {
  ReactNative.NativeModules.JailMonkey = {
    isJailBroken: false,
    isDevelopmentSettingsMode: jest.fn(() => Promise.resolve(false)),
    isDebuggedMode: jest.fn(() => Promise.resolve(false)),
  };
}

jest.mock('react-native-keyboard-controller', () => {
  const React = require('react');
  const {ScrollView} = require('react-native');
  return {
    KeyboardProvider: ({children}) => React.createElement(React.Fragment, null, children),
    KeyboardAwareScrollView: ScrollView,
  };
});

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve({service: 's', storage: 'k'})),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  hasGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  ACCESS_CONTROL: {
    BIOMETRY_ANY: 'BiometryAny',
    BIOMETRY_CURRENT_SET: 'BiometryCurrentSet',
  },
  ACCESSIBLE: {WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly'},
  AUTHENTICATION_TYPE: {BIOMETRICS: 'AuthenticationWithBiometrics'},
  STORAGE_TYPE: {AES_GCM: 'KeystoreAESGCM'},
  SECURITY_LEVEL: {SECURE_SOFTWARE: 0, SECURE_HARDWARE: 1, ANY: 2},
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn(() => Promise.resolve(undefined)),
  },
}));

