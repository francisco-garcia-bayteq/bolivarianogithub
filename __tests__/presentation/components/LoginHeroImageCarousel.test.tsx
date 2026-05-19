import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {View} from 'react-native';
import {LoginHeroImageCarousel} from '../../../src/presentation/components/LoginHeroImageCarousel';

jest.mock('../../../src/providers', () => ({
  useTheme: () => ({
    colors: require('../../../src/providers/theme/colors').LightColors,
  }),
}));

const sourceA = {uri: 'https://example.com/a.png'};
const sourceB = {uri: 'https://example.com/b.png'};

const mountedRoots: ReactTestRenderer.ReactTestRenderer[] = [];

function mount(element: React.ReactElement) {
  let root!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    root = ReactTestRenderer.create(element);
  });
  mountedRoots.push(root);
  return root;
}

describe('LoginHeroImageCarousel', () => {
  afterEach(() => {
    act(() => {
      while (mountedRoots.length > 0) {
        mountedRoots.pop()!.unmount();
      }
    });
    jest.useRealTimers();
  });

  test('altura por defecto y etiqueta accesible inicial', () => {
    const root = mount(
      <LoginHeroImageCarousel sourceA={sourceA} sourceB={sourceB} />,
    );
    const container = root.root.findByType(View as never);
    expect(container.props.accessibilityLabel).toBe('Ilustración 1 de 2');
    const flatStyle = container.props.style;
    const heightStyle = Array.isArray(flatStyle)
      ? Object.assign({}, ...flatStyle.filter(Boolean))
      : flatStyle;
    expect(heightStyle.height).toBe(180);
  });

  test('height explícito se aplica al contenedor', () => {
    const root = mount(
      <LoginHeroImageCarousel
        sourceA={sourceA}
        sourceB={sourceB}
        height={220}
      />,
    );
    const container = root.root.findByType(View as never);
    const flatStyle = container.props.style;
    const heightStyle = Array.isArray(flatStyle)
      ? Object.assign({}, ...flatStyle.filter(Boolean))
      : flatStyle;
    expect(heightStyle.height).toBe(220);
  });

  test('intervalo dispara crossfade y actualiza accesibilidad (fake timers)', () => {
    jest.useFakeTimers();
    const root = mount(
      <LoginHeroImageCarousel sourceA={sourceA} sourceB={sourceB} />,
    );
    act(() => {
      jest.advanceTimersByTime(4500);
    });
    const container = root.root.findByType(View as never);
    expect(container.props.accessibilityLabel).toBe('Ilustración 2 de 2');

    act(() => {
      jest.advanceTimersByTime(4500);
    });
    expect(root.root.findByType(View as never).props.accessibilityLabel).toBe(
      'Ilustración 1 de 2',
    );
  });
});
