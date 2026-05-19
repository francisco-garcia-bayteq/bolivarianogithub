import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Platform} from 'react-native';
import {FrequentActionsSection} from '../FrequentActionsSection';

jest.mock('../../../../providers/theme', () => ({
  useTheme: () => ({
    colors: require('../../../../providers/theme/colors').LightColors,
  }),
}));

describe('FrequentActionsSection', () => {
  const oneItem = [{beneficiaryName: 'Luz', beneficiaryType: 'luz' as const}];

  test('items vacíos → null', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<FrequentActionsSection items={[]} />);
    });
    expect(root!.toJSON()).toBeNull();
  });

  test('con ítems muestra título y llama onItemPress', () => {
    const onItemPress = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <FrequentActionsSection items={oneItem} onItemPress={onItemPress} />,
      );
    });
    expect(JSON.stringify(root!.toJSON())).toContain('Acciones frecuentes');
    const touch = root!.root.findByProps({accessibilityLabel: 'Luz'});
    act(() => {
      touch.props.onPress?.();
    });
    expect(onItemPress).toHaveBeenCalledWith(oneItem[0], 0);
  });

  test('estilos: Platform.select usa rama ios', () => {
    const spy = jest
      .spyOn(Platform, 'select')
      .mockImplementation(spec => (spec as {ios?: unknown}).ios as never);
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<FrequentActionsSection items={oneItem} />);
    });
    expect(root!.toJSON()).not.toBeNull();
    spy.mockRestore();
  });

  test('estilos: Platform.select usa rama android', () => {
    const spy = jest
      .spyOn(Platform, 'select')
      .mockImplementation(spec => (spec as {android?: unknown}).android as never);
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(<FrequentActionsSection items={oneItem} />);
    });
    expect(root!.toJSON()).not.toBeNull();
    spy.mockRestore();
  });
});
