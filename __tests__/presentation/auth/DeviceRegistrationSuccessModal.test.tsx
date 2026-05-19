import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Modal} from 'react-native';
import {DeviceRegistrationSuccessModal} from '../../../src/presentation/auth/DeviceRegistrationSuccessModal';

jest.mock('../../../src/providers', () => ({
  useTheme: () => ({
    colors: require('../../../src/providers/theme/colors').LightColors,
  }),
}));

jest.mock('../../../src/presentation/components', () => {
  const React = require('react');
  const {Pressable, Text} = require('react-native');
  return {
    Button: ({
      title,
      onPress,
      testID,
    }: {
      title: string;
      onPress: () => void;
      testID?: string;
    }) =>
      React.createElement(
        Pressable,
        {onPress, testID},
        React.createElement(Text, null, title),
      ),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 12, bottom: 10, left: 0, right: 0}),
}));

describe('DeviceRegistrationSuccessModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('con visible=true muestra título y botón continuar', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal visible onContinue={onContinue} />,
      );
    });

    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('¡TODO LISTO!');
    expect(root!.root.findByProps({testID: 'device-registration-success-continue'})).toBeTruthy();
  });

  test('al pulsar continuar invoca onContinue una sola vez', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal visible onContinue={onContinue} />,
      );
    });

    const btn = root!.root.findByProps({testID: 'device-registration-success-continue'});
    await act(async () => {
      btn.props.onPress();
    });
    await act(async () => {
      btn.props.onPress();
    });

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('tras AUTO_DISMISS_MS dispara onContinue', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    await act(async () => {
      ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal visible onContinue={onContinue} />,
      );
    });

    expect(onContinue).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('onContinue rechazado no propaga (catch interno)', async () => {
    const onContinue = jest.fn(() => Promise.reject(new Error('nav')));

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal visible onContinue={onContinue} />,
      );
    });

    const btn = root!.root.findByProps({testID: 'device-registration-success-continue'});
    await act(async () => {
      btn.props.onPress();
    });

    expect(onContinue).toHaveBeenCalled();
  });

  test('cerrar con botón × llama onContinue', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal visible onContinue={onContinue} />,
      );
    });

    const close = root!.root.findByProps({accessibilityLabel: 'Cerrar'});
    await act(async () => {
      close.props.onPress();
    });

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('onRequestClose del Modal ejecuta continuar', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal visible onContinue={onContinue} />,
      );
    });

    const modal = root!.root.findByType(Modal);
    await act(async () => {
      modal.props.onRequestClose();
    });

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('al pasar a visible=false limpia el timer (sin disparar onContinue)', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal visible onContinue={onContinue} />,
      );
    });

    await act(async () => {
      root!.update(
        <DeviceRegistrationSuccessModal visible={false} onContinue={onContinue} />,
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(onContinue).not.toHaveBeenCalled();
  });
});

describe('DeviceRegistrationSuccessModal variant biometricRegistration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('con visible=true muestra mensaje y botón continuar', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal
          variant="biometricRegistration"
          visible
          onContinue={onContinue}
        />,
      );
    });

    const json = JSON.stringify(root!.toJSON());
    expect(json).toContain('Tu acceso biométrico ha sido registrado');
    expect(
      root!.root.findByProps({testID: 'biometric-registration-success-continue'}),
    ).toBeTruthy();
  });

  test('al pulsar continuar invoca onContinue una sola vez', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal
          variant="biometricRegistration"
          visible
          onContinue={onContinue}
        />,
      );
    });

    const btn = root!.root.findByProps({
      testID: 'biometric-registration-success-continue',
    });
    await act(async () => {
      btn.props.onPress();
    });
    await act(async () => {
      btn.props.onPress();
    });

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('tras AUTO_DISMISS_MS dispara onContinue', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    await act(async () => {
      ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal
          variant="biometricRegistration"
          visible
          onContinue={onContinue}
        />,
      );
    });

    expect(onContinue).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('onContinue rechazado no propaga (catch interno)', async () => {
    const onContinue = jest.fn(() => Promise.reject(new Error('nav')));

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal
          variant="biometricRegistration"
          visible
          onContinue={onContinue}
        />,
      );
    });

    const btn = root!.root.findByProps({
      testID: 'biometric-registration-success-continue',
    });
    await act(async () => {
      btn.props.onPress();
    });

    expect(onContinue).toHaveBeenCalled();
  });

  test('cerrar con botón × llama onContinue', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal
          variant="biometricRegistration"
          visible
          onContinue={onContinue}
        />,
      );
    });

    const close = root!.root.findByProps({accessibilityLabel: 'Cerrar'});
    await act(async () => {
      close.props.onPress();
    });

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('onRequestClose del Modal ejecuta continuar', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal
          variant="biometricRegistration"
          visible
          onContinue={onContinue}
        />,
      );
    });

    const modal = root!.root.findByType(Modal);
    await act(async () => {
      modal.props.onRequestClose();
    });

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('al pasar a visible=false limpia el timer (sin disparar onContinue)', async () => {
    const onContinue = jest.fn(() => Promise.resolve());

    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <DeviceRegistrationSuccessModal
          variant="biometricRegistration"
          visible
          onContinue={onContinue}
        />,
      );
    });

    await act(async () => {
      root!.update(
        <DeviceRegistrationSuccessModal
          variant="biometricRegistration"
          visible={false}
          onContinue={onContinue}
        />,
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(onContinue).not.toHaveBeenCalled();
  });
});
