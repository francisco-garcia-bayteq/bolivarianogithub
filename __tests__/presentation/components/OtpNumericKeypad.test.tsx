jest.mock('../../../src/providers/theme', () => {
  const {LightColors} = jest.requireActual<
    typeof import('../../../src/providers/theme/colors')
  >('../../../src/providers/theme/colors');
  return {
    useTheme: () => ({
      colors: LightColors,
      isDark: false,
      mode: 'light' as const,
      setMode: jest.fn(),
      toggleTheme: jest.fn(),
    }),
  };
});

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {TouchableOpacity} from 'react-native';
import {OtpNumericKeypad} from '../../../src/presentation/components/OtpNumericKeypad';

const DELETE_SRC = {uri: 'otp-delete-test'};

describe('OtpNumericKeypad', () => {
  it('expone accessibilityLabel en el contenedor', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <OtpNumericKeypad onKeyPress={jest.fn()} deleteIconSource={DELETE_SRC} />,
      );
    });
    const wrap = root!.root.findByProps({
      accessibilityLabel: 'Teclado numérico',
    });
    expect(wrap).toBeDefined();
    act(() => root!.unmount());
  });

  it('al pulsar un dígito invoca onKeyPress con la tecla', () => {
    const onKeyPress = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <OtpNumericKeypad onKeyPress={onKeyPress} deleteIconSource={DELETE_SRC} />,
      );
    });
    const digitBtn = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(t => t.props.accessibilityLabel === 'Digito 7');
    expect(digitBtn).toBeDefined();
    act(() => digitBtn!.props.onPress());
    expect(onKeyPress).toHaveBeenCalledWith('7');
    act(() => root!.unmount());
  });

  it('al pulsar borrar invoca onKeyPress con backspace', () => {
    const onKeyPress = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <OtpNumericKeypad onKeyPress={onKeyPress} deleteIconSource={DELETE_SRC} />,
      );
    });
    const back = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(t => t.props.accessibilityLabel === 'Borrar');
    expect(back).toBeDefined();
    act(() => back!.props.onPress());
    expect(onKeyPress).toHaveBeenCalledWith('backspace');
    act(() => root!.unmount());
  });

  it('con disabled marca las teclas como no interactivas', () => {
    const onKeyPress = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <OtpNumericKeypad
          onKeyPress={onKeyPress}
          disabled
          deleteIconSource={DELETE_SRC}
        />,
      );
    });
    const touches = root!.root.findAllByType(TouchableOpacity as never);
    expect(touches.length).toBeGreaterThan(0);
    for (const t of touches) {
      expect(t.props.disabled).toBe(true);
    }
    act(() => root!.unmount());
  });
});
