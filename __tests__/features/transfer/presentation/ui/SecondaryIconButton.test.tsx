import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import {SecondaryIconButton} from '../../../../../src/features/transfer/presentation/ui/SecondaryIconButton';

jest.mock('../../../../../src/providers', () => ({
  useTheme: () => ({
    colors: require('../../../../../src/providers/theme/colors').LightColors,
  }),
}));

const icon = {uri: 'https://example.com/i.png'};

describe('SecondaryIconButton', () => {
  test('loading muted usa color iconPrimary en ActivityIndicator', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <SecondaryIconButton title="T" onPress={jest.fn()} loading variant="muted" />,
      );
    });
    const indicator = root!.root.findByType(ActivityIndicator as never);
    expect(indicator.props.color).toBe(
      require('../../../../../src/providers/theme/colors').LightColors.iconPrimary,
    );
    act(() => root!.unmount());
  });

  test('loading outline usa color primary en ActivityIndicator', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <SecondaryIconButton title="T" onPress={jest.fn()} loading variant="outline" />,
      );
    });
    const indicator = root!.root.findByType(ActivityIndicator as never);
    expect(indicator.props.color).toBe(
      require('../../../../../src/providers/theme/colors').LightColors.primary,
    );
    act(() => root!.unmount());
  });

  test('sin iconos solo muestra texto; con tint aplica estilo a Image', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <SecondaryIconButton title="Solo" onPress={jest.fn()} />,
      );
    });
    expect(root!.root.findAllByType(Image as never)).toHaveLength(0);
    act(() => root!.unmount());

    act(() => {
      root = ReactTestRenderer.create(
        <SecondaryIconButton
          title="Con iconos"
          onPress={jest.fn()}
          iconSource={icon}
          iconSourceRight={icon}
          iconTintColor="#aabbcc"
        />,
      );
    });
    const images = root!.root.findAllByType(Image as never);
    expect(images).toHaveLength(2);
    expect(images[0]!.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({tintColor: '#aabbcc'}),
      ]),
    );
    act(() => root!.unmount());
  });

  test('variant outline aplica estilos a contenedor y texto', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <SecondaryIconButton
          title="Out"
          onPress={jest.fn()}
          variant="outline"
        />,
      );
    });
    const touch = root!.root.findByType(TouchableOpacity as never);
    const styleArr = touch.props.style;
    expect(Array.isArray(styleArr)).toBe(true);
    expect(styleArr.length).toBeGreaterThan(1);
    const label = root!.root.findByType(Text as never);
    expect(label.props.style).toEqual(
      expect.arrayContaining([expect.any(Object), expect.any(Object)]),
    );
    act(() => root!.unmount());
  });

  test('disabled y loading marcan TouchableOpacity como disabled', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <SecondaryIconButton title="X" onPress={jest.fn()} disabled />,
      );
    });
    expect(root!.root.findByType(TouchableOpacity as never).props.disabled).toBe(
      true,
    );
    act(() => root!.unmount());

    act(() => {
      root = ReactTestRenderer.create(
        <SecondaryIconButton title="Y" onPress={jest.fn()} loading />,
      );
    });
    expect(root!.root.findByType(TouchableOpacity as never).props.disabled).toBe(
      true,
    );
    act(() => root!.unmount());
  });

  test('habilitado: onPress del TouchableOpacity invoca el handler', () => {
    const onPress = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <SecondaryIconButton title="Z" onPress={onPress} />,
      );
    });
    expect(root!.root.findByType(TouchableOpacity as never).props.disabled).toBe(
      false,
    );
    act(() => {
      root!.root.findByType(TouchableOpacity as never).props.onPress?.();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => root!.unmount());
  });
});
