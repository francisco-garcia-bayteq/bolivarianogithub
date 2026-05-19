jest.mock('react-native-view-shot', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props: object, ref: unknown) =>
      React.createElement(View, {...props, ref}),
    ),
  };
});

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn().mockResolvedValue(undefined),
  },
}));

import {mapBiometricError} from '../../../src/presentation/auth/useLoginViewModel';
import {BiometricRSAError} from '../../../src/security/biometric/errors';
import {BiometricAuthError} from '../../../src/domain/services/BiometricAuthService';

describe('mapBiometricError', () => {
  it('devuelve null para cancelación RSA', () => {
    expect(
      mapBiometricError(
        new BiometricRSAError('x', 'user_cancelled'),
      ),
    ).toBeNull();
  });

  it('mapea cambio de enrolamiento biométrico', () => {
    const msg = mapBiometricError(
      new BiometricRSAError('x', 'biometric_enrollment_changed'),
    );
    expect(msg).toContain('registros biométricos');
  });

  it('mapea códigos RSA conocidos', () => {
    expect(
      mapBiometricError(
        new BiometricRSAError('x', 'not_available'),
      ),
    ).toContain('no está disponible');
    expect(
      mapBiometricError(
        new BiometricRSAError('falló crypto', 'crypto_error'),
      ),
    ).toBe('falló crypto');
    expect(
      mapBiometricError(
        new BiometricRSAError('', 'crypto_error'),
      ),
    ).toContain('biométrica');
    expect(
      mapBiometricError(
        new BiometricRSAError('sin clave', 'no_private_key'),
      ),
    ).toBe('sin clave');
    expect(
      mapBiometricError(
        new BiometricRSAError('red', 'network_error'),
      ),
    ).toBe('red');
    expect(
      mapBiometricError(
        new BiometricRSAError('', 'network_error'),
      ),
    ).toContain('conexión');
    expect(
      mapBiometricError(
        new BiometricRSAError('reg-msg', 'registration_failed'),
      ),
    ).toBe('reg-msg');
  });

  it('mapea BiometricAuthError', () => {
    expect(
      mapBiometricError(
        new BiometricAuthError('cancel', 'user_cancelled'),
      ),
    ).toBeNull();
    expect(
      mapBiometricError(
        new BiometricAuthError('x', 'not_available'),
      ),
    ).toContain('no está disponible');
    expect(
      mapBiometricError(
        new BiometricAuthError('x', 'prompt_failed'),
      ),
    ).toContain('verificar');
    const fallbackMsg = mapBiometricError(
      new BiometricRSAError('', 'registration_failed'),
    );
    expect(fallbackMsg).toContain('biométrica');
  });

  it('mapea Error genérico y valores desconocidos', () => {
    expect(mapBiometricError(new Error('timeout'))).toBe('timeout');
    expect(mapBiometricError('string')).toBe('Ocurrió un error inesperado');
  });
});
