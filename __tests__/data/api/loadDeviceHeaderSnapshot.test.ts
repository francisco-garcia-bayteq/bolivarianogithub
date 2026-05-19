import {Platform} from 'react-native';
import {
  alphanumericDeviceField,
  loadDeviceHeaderSnapshot,
} from '../../../src/data/api/loadDeviceHeaderSnapshot';

jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => Promise.resolve('2.1.0')),
  getBuildNumber: jest.fn(() => Promise.resolve('99')),
  getModel: jest.fn(() => Promise.resolve('Pixel 6')),
  getBrand: jest.fn(() => Promise.resolve('Google')),
  getSystemVersion: jest.fn(() => Promise.resolve('14')),
}));

describe('loadDeviceHeaderSnapshot', () => {
  const osDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');

  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: 'android',
    });
  });

  afterAll(() => {
    if (osDescriptor) {
      Object.defineProperty(Platform, 'OS', osDescriptor);
    }
  });

  it('alphanumericDeviceField elimina caracteres no alfanuméricos', () => {
    expect(alphanumericDeviceField('Abc-123')).toBe('Abc123');
    expect(alphanumericDeviceField('')).toBe('');
  });

  it('agrega snapshot con plataforma ANDROID y versión formateada', async () => {
    const snap = await loadDeviceHeaderSnapshot();
    expect(snap.platform).toBe('ANDROID');
    expect(snap.version).toBe('2.1.0.99');
    expect(snap.model).toBe('Pixel6');
    expect(snap.brand).toBe('Google');
    expect(snap.systemVersion).toBe('14');
  });

  it('marca IOS cuando Platform.OS es ios', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: 'ios',
    });
    const snap = await loadDeviceHeaderSnapshot();
    expect(snap.platform).toBe('IOS');
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: 'android',
    });
  });
});
