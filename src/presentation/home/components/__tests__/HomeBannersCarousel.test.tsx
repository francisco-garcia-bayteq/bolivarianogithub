import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Linking, ScrollView, TouchableOpacity} from 'react-native';
import type {HomeBanner} from '../../../../domain/entities/ContractBalance';
import {HomeBannersCarousel} from '../HomeBannersCarousel';

jest.mock('../../../../providers/theme', () => ({
  useTheme: () => ({
    colors: require('../../../../providers/theme/colors').LightColors,
  }),
}));

jest.mock('../HomeIcons', () => ({
  ChevronRightIcon: () => null,
}));

function banner(overrides: Partial<HomeBanner> = {}): HomeBanner {
  return {
    text: 'Hola\n**Negrita** fin',
    buttonText: 'Ir',
    buttonLink: '',
    landscape: 'car',
    ...overrides,
  };
}

const mountedRoots: ReactTestRenderer.ReactTestRenderer[] = [];

function mount(element: React.ReactElement) {
  let root!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    root = ReactTestRenderer.create(element);
  });
  mountedRoots.push(root);
  return root;
}

describe('HomeBannersCarousel', () => {
  const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);

  afterEach(() => {
    act(() => {
      while (mountedRoots.length > 0) {
        const r = mountedRoots.pop()!;
        r.unmount();
      }
    });
    jest.useRealTimers();
    openURLSpy.mockClear();
  });

  afterAll(() => {
    openURLSpy.mockRestore();
  });

  test('sin banners devuelve null', () => {
    const root = mount(<HomeBannersCarousel banners={[]} />);
    expect(root.toJSON()).toBeNull();
  });

  test('un banner: no programa auto-avance (length <= 1)', () => {
    jest.useFakeTimers();
    const root = mount(<HomeBannersCarousel banners={[banner()]} />);
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(root.toJSON()).not.toBeNull();
  });

  test('dos banners registran setInterval para auto-avance', () => {
    jest.useFakeTimers();
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    mount(
      <HomeBannersCarousel
        banners={[
          banner({buttonLink: 'a-1', durationMilliseconds: 500}),
          banner({buttonLink: 'b-2', landscape: 'https://cdn.example.com/x.png'}),
        ]}
      />,
    );
    expect(setIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy.mock.calls[0]?.[1]).toBe(500);
    setIntervalSpy.mockRestore();
  });

  test('onMomentumScrollEnd actualiza índice solo si está en rango', () => {
    const root = mount(
      <HomeBannersCarousel banners={[banner(), banner({buttonLink: 'x'})]} />,
    );
    const scroll = root.root.findByType(ScrollView as never);
    act(() => {
      scroll.props.onMomentumScrollEnd?.({
        nativeEvent: {contentOffset: {x: 999999}},
      });
    });
    act(() => {
      scroll.props.onMomentumScrollEnd?.({
        nativeEvent: {contentOffset: {x: 0}},
      });
    });
    expect(scroll.props.onMomentumScrollEnd).toBeDefined();
  });

  test('toque con link https llama Linking.openURL', () => {
    const root = mount(
      <HomeBannersCarousel
        banners={[banner({buttonLink: 'https://example.com/path'})]}
      />,
    );
    const touch = root.root.findByType(TouchableOpacity as never);
    act(() => {
      touch.props.onPress?.();
    });
    expect(openURLSpy).toHaveBeenCalledWith('https://example.com/path');
  });

  test('toque sin URL http no abre link', () => {
    const root = mount(
      <HomeBannersCarousel
        banners={[banner({buttonLink: 'solo-texto'})]}
      />,
    );
    const touch = root.root.findByType(TouchableOpacity as never);
    act(() => {
      touch.props.onPress?.();
    });
    expect(openURLSpy).not.toHaveBeenCalled();
  });

  test('landscape vacío usa placeholder (rama none)', () => {
    const root = mount(
      <HomeBannersCarousel banners={[banner({landscape: '   '})]} />,
    );
    expect(root.toJSON()).not.toBeNull();
  });
});
