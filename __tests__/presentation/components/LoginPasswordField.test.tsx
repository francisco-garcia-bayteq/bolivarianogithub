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

jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({children}: {children?: React.ReactNode}) =>
      React.createElement('SvgMock', null, children),
    Path: () => null,
  };
});

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, TextInput, TouchableOpacity} from 'react-native';
import {LoginPasswordField} from '../../../src/presentation/components/LoginPasswordField';

describe('LoginPasswordField', () => {
  it('muestra la etiqueta y enlaza testID al TextInput', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <LoginPasswordField
          label="Contraseña"
          testID="login-password"
          placeholder="Ingresa"
        />,
      );
    });
    const texts = root!.root.findAllByType(Text as never);
    expect(texts.some(t => t.props.children === 'Contraseña')).toBe(true);
    const input = root!.root.findAllByType(TextInput as never)[0];
    expect(input.props.testID).toBe('login-password');
    expect(input.props.placeholder).toBe('Ingresa');
    expect(input.props.secureTextEntry).toBe(true);
    act(() => root!.unmount());
  });

  it('el botón ojo alterna secureTextEntry', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <LoginPasswordField label="C" testID="pwd" value="" onChangeText={jest.fn()} />,
      );
    });
    const showBtn = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(t => t.props.accessibilityLabel === 'Mostrar contraseña');
    expect(showBtn).toBeDefined();

    act(() => showBtn!.props.onPress());
    let input = root!.root.findAllByType(TextInput as never)[0];
    expect(input.props.secureTextEntry).toBe(false);

    const hideBtn = root!.root
      .findAllByType(TouchableOpacity as never)
      .find(t => t.props.accessibilityLabel === 'Ocultar contraseña');
    expect(hideBtn).toBeDefined();
    act(() => hideBtn!.props.onPress());
    input = root!.root.findAllByType(TextInput as never)[0];
    expect(input.props.secureTextEntry).toBe(true);
    act(() => root!.unmount());
  });

  it('muestra errorMessage con errorTestID cuando se pasa mensaje', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <LoginPasswordField
          label="C"
          errorMessage="Mínimo 6 caracteres"
          errorTestID="pwd-error"
        />,
      );
    });
    const err = root!.root
      .findAllByType(Text as never)
      .find(t => t.props.testID === 'pwd-error');
    expect(err).toBeDefined();
    expect(err!.props.children).toBe('Mínimo 6 caracteres');
    act(() => root!.unmount());
  });

  it('no renderiza texto de error si errorMessage está vacío', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <LoginPasswordField label="C" errorTestID="pwd-error" />,
      );
    });
    const errText = root!.root
      .findAllByType(Text as never)
      .find(t => t.props.testID === 'pwd-error');
    expect(errText).toBeUndefined();
    act(() => root!.unmount());
  });

  it('reenvía props al TextInput', () => {
    const onChangeText = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <LoginPasswordField
          label="C"
          testID="pwd"
          value="abc"
          onChangeText={onChangeText}
          editable={false}
        />,
      );
    });
    const input = root!.root.findAllByType(TextInput as never)[0];
    expect(input.props.testID).toBe('pwd');
    expect(input.props.value).toBe('abc');
    expect(input.props.editable).toBe(false);
    act(() => input.props.onChangeText('x'));
    expect(onChangeText).toHaveBeenCalledWith('x');
    act(() => root!.unmount());
  });
});
