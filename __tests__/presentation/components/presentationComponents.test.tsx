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
import {Button} from '../../../src/presentation/components/Button';
import {ErrorMessage} from '../../../src/presentation/components/ErrorMessage';
import {EmptyState} from '../../../src/presentation/components/EmptyState';
import {LoadingState} from '../../../src/presentation/components/LoadingState';
import {SpacerView} from '../../../src/presentation/components/SpacerView';
import {OrSeparator} from '../../../src/presentation/components/OrSeparator';
import {TertiaryLinkButton} from '../../../src/presentation/components/TertiaryLinkButton';
import {SecondaryIconButton} from '../../../src/presentation/components/SecondaryIconButton';

function textTree(node: ReturnType<typeof ReactTestRenderer.create>['toJSON']) {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textTree).join('');
  }
  if (typeof node === 'object' && 'children' in node) {
    return textTree(
      node.children as Parameters<typeof textTree>[0],
    );
  }
  return '';
}

describe('presentation/components', () => {
  it('Button renderiza título y responde a onPress', () => {
    const onPress = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <Button title="Enviar" onPress={onPress} testID="btn" />,
      );
    });
    expect(textTree(root!.toJSON())).toContain('Enviar');
    const touch = root!.root.findByProps({testID: 'btn'});
    act(() => touch.props.onPress());
    expect(onPress).toHaveBeenCalled();
    act(() => root!.unmount());
  });

  it('ErrorMessage muestra el mensaje', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <ErrorMessage message="Algo salió mal" testID="err" />,
      );
    });
    expect(textTree(root!.toJSON())).toContain('Algo salió mal');
    act(() => root!.unmount());
  });

  it('EmptyState y LoadingState muestran texto', () => {
    let r1: ReactTestRenderer.ReactTestRenderer;
    let r2: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      r1 = ReactTestRenderer.create(<EmptyState message="Sin datos" />);
      r2 = ReactTestRenderer.create(<LoadingState message="Cargando…" />);
    });
    expect(textTree(r1!.toJSON())).toContain('Sin datos');
    expect(textTree(r2!.toJSON())).toContain('Cargando');
    act(() => r1!.unmount());
    act(() => r2!.unmount());
  });

  it('SpacerView y OrSeparator montan sin error', () => {
    let r1: ReactTestRenderer.ReactTestRenderer;
    let r2: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      r1 = ReactTestRenderer.create(<SpacerView height={12} />);
      r2 = ReactTestRenderer.create(<OrSeparator />);
    });
    expect(r1!.toJSON()).toBeTruthy();
    expect(textTree(r2!.toJSON())).toContain('o');
    act(() => r1!.unmount());
    act(() => r2!.unmount());
  });

  it('TertiaryLinkButton y SecondaryIconButton ejecutan onPress', () => {
    const onLink = jest.fn();
    const onSecondary = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <>
          <TertiaryLinkButton title="Ayuda" onPress={onLink} />
          <SecondaryIconButton title="Extra" onPress={onSecondary} />
        </>,
      );
    });
    const links = root!.root.findAllByType(TouchableOpacity as never);
    expect(links.length).toBeGreaterThanOrEqual(2);
    act(() => links[0].props.onPress?.());
    act(() => links[1].props.onPress?.());
    expect(onLink).toHaveBeenCalled();
    expect(onSecondary).toHaveBeenCalled();
    act(() => root!.unmount());
  });
});
