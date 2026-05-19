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
import type {ReactTestRendererJSON} from 'react-test-renderer';
import {
  TransactionItem,
  formatCurrency,
} from '../../../src/presentation/transactions/TransactionItem';
import type {Transaction} from '../../../src/domain/entities/Transaction';

function renderedText(
  node: ReactTestRendererJSON | ReactTestRendererJSON[] | string | number | null | undefined,
): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(renderedText).join('');
  }
  if (typeof node === 'object' && node && 'children' in node) {
    return renderedText(
      node.children as ReactTestRendererJSON | ReactTestRendererJSON[],
    );
  }
  return '';
}

function buildItem(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: '1',
    description: 'Pago demo',
    amount: 1234.5,
    date: '2025-03-15',
    type: 'expense',
    category: 'food',
    status: 'completed',
    ...overrides,
  };
}

function renderTransactionItem(item: Transaction) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(<TransactionItem item={item} />);
  });
  return tree;
}

describe('formatCurrency', () => {
  it('formatea con prefijo $ y locale es-MX', () => {
    const s = formatCurrency(1000);
    expect(s.startsWith('$')).toBe(true);
    expect(s).toMatch(/1[.,]000[.,]00/);
  });
});

describe('TransactionItem', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('muestra descripción, categoría, estado y monto de gasto', () => {
    const tree = renderTransactionItem(buildItem());
    try {
      const text = renderedText(tree.toJSON());
      expect(text).toContain('Pago demo');
      expect(text).toContain('🍔');
      expect(text).toContain('Completada');
      expect(text).toMatch(/-/);
      expect(text).toMatch(/1[.,]234[.,]50/);
    } finally {
      act(() => tree.unmount());
    }
  });

  it('usa color de ingreso con prefijo +', () => {
    const tree = renderTransactionItem(buildItem({type: 'income'}));
    try {
      const text = renderedText(tree.toJSON());
      expect(text).toMatch(/\+/);
    } finally {
      act(() => tree.unmount());
    }
  });

  it('muestra etiqueta de estado pendiente', () => {
    const tree = renderTransactionItem(buildItem({status: 'pending'}));
    try {
      expect(renderedText(tree.toJSON())).toContain('Pendiente');
    } finally {
      act(() => tree.unmount());
    }
  });

  it('muestra etiqueta de estado cancelada', () => {
    const tree = renderTransactionItem(buildItem({status: 'cancelled'}));
    try {
      expect(renderedText(tree.toJSON())).toContain('Cancelada');
    } finally {
      act(() => tree.unmount());
    }
  });
});
