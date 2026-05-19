import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import {BoundaryAppFallback} from '../../../src/presentation/boundary/BoundaryAppFallback';

describe('BoundaryAppFallback', () => {
  test('muestra message de Error', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <BoundaryAppFallback
          error={new Error('fallo-red')}
          resetErrorBoundary={jest.fn()}
        />,
      );
    });
    const texts = root!.root.findAllByType(Text as never);
    const detail = texts.find(
      t => typeof t.props.children === 'string' && t.props.children === 'fallo-red',
    );
    expect(detail).toBeDefined();
    act(() => {
      root!.unmount();
    });
  });

  test('muestra String(error) cuando error no es instancia de Error', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <BoundaryAppFallback
          error={'texto-plano'}
          resetErrorBoundary={jest.fn()}
        />,
      );
    });
    const texts = root!.root.findAllByType(Text as never);
    const detail = texts.find(
      t => typeof t.props.children === 'string' && t.props.children === 'texto-plano',
    );
    expect(detail).toBeDefined();
    act(() => {
      root!.unmount();
    });
  });

  test('Pressable aplica estilo pressed y onPress llama resetErrorBoundary', () => {
    const reset = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <BoundaryAppFallback
          error={new Error('x')}
          resetErrorBoundary={reset}
        />,
      );
    });
    const pressable = root!.root.find(
      node => typeof node.props.onPress === 'function',
    );
    if (!pressable) {
      throw new Error('No se encontró nodo con onPress');
    }
    const styleFn = pressable.props.style;
    expect(typeof styleFn).toBe('function');
    const pressedTrue = styleFn({pressed: true});
    const pressedFalse = styleFn({pressed: false});
    expect(pressedTrue).toEqual(expect.arrayContaining([expect.any(Object)]));
    expect(pressedFalse).toEqual(expect.arrayContaining([expect.any(Object)]));

    act(() => {
      pressable.props.onPress?.();
    });
    expect(reset).toHaveBeenCalledTimes(1);

    act(() => {
      root!.unmount();
    });
  });
});
