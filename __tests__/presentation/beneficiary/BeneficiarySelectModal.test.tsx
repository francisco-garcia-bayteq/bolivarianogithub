jest.mock('react-native-view-shot', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props: object, ref: unknown) =>
      React.createElement(View, {...props, ref}),
    ),
  };
});

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockUseHomeViewModel = jest.fn();
const mockUseBeneficiaryContactsViewModel = jest.fn();

jest.mock('../../../src/presentation/home/useHomeViewModel', () => ({
  useHomeViewModel: () => mockUseHomeViewModel(),
}));

jest.mock(
  '../../../src/presentation/beneficiary/useBeneficiaryContactsViewModel',
  () => ({
    useBeneficiaryContactsViewModel: () =>
      mockUseBeneficiaryContactsViewModel(),
  }),
);

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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import type {
  ReactTestInstance,
  ReactTestRendererJSON,
} from 'react-test-renderer';
import {TextInput, TouchableOpacity} from 'react-native';
import {BeneficiarySelectModal} from '../../../src/presentation/beneficiary/BeneficiarySelectModal';
import type {ContractBalance} from '../../../src/domain/entities/ContractBalance';
import type {BeneficiaryContact} from '../../../src/domain/entities/BeneficiaryContact';

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

function textFromInstance(inst: ReactTestInstance): string {
  return inst.children
    .map(ch =>
      typeof ch === 'string' || typeof ch === 'number'
        ? String(ch)
        : textFromInstance(ch),
    )
    .join('');
}

function renderModal(props: {
  visible: boolean;
  onRequestClose: () => void;
  onSelect: (b: unknown) => void;
}) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(<BeneficiarySelectModal {...props} />);
  });
  return tree;
}

const emptyContract: ContractBalance = {
  accounts: [],
  creditCards: [],
  loans: [],
  investments: [],
  frequentPayments: [],
  banners: [],
  homeDashboardIcons: [],
  recentTransactions: [],
};

const sampleAccount = {
  accountGuid: 'ag1',
  maskedAccountNumber: '****4242',
  accountKind: 'savings' as const,
  balance: 150.25,
};

const sampleContact: BeneficiaryContact = {
  beneficiaryGuid: 'g1',
  contactName: 'Ana López',
  bankName: 'Banco Demo',
  accountType: 1,
  lastFourDigits: '1234',
};

describe('BeneficiarySelectModal', () => {
  const onRequestClose = jest.fn();
  const onSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHomeViewModel.mockReturnValue({
      data: {...emptyContract, accounts: [sampleAccount]},
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });
    mockUseBeneficiaryContactsViewModel.mockReturnValue({
      contacts: [sampleContact],
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });
  });

  it('renderiza carga cuando home está cargando sin datos', () => {
    mockUseHomeViewModel.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      retry: jest.fn(),
    });
    const tree = renderModal({
      visible: true,
      onRequestClose,
      onSelect,
    });
    try {
      expect(renderedText(tree.toJSON())).toMatch(/BENEFICIARIOS/);
    } finally {
      act(() => tree.unmount());
    }
  });

  it('muestra error de home y permite reintentar', () => {
    const retry = jest.fn();
    mockUseHomeViewModel.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Sin conexión',
      retry,
    });
    const tree = renderModal({
      visible: true,
      onRequestClose,
      onSelect,
    });
    try {
      expect(renderedText(tree.toJSON())).toContain('Sin conexión');
      const buttons = tree.root.findAllByType(TouchableOpacity);
      const retryBtn = buttons.find(b =>
        textFromInstance(b).includes('Reintentar'),
      );
      expect(retryBtn).toBeDefined();
      act(() => retryBtn?.props.onPress());
      expect(retry).toHaveBeenCalled();
    } finally {
      act(() => tree.unmount());
    }
  });

  it('lista mis cuentas y notifica al elegir la primera', () => {
    const tree = renderModal({
      visible: true,
      onRequestClose,
      onSelect,
    });
    try {
      expect(renderedText(tree.toJSON())).toContain('Mis cuentas');
      expect(renderedText(tree.toJSON())).toContain('****4242');
      const withTestId = tree.root.findAll(
        n =>
          n.type === TouchableOpacity &&
          n.props.testID === 'beneficiary-first-own-account',
      );
      expect(withTestId.length).toBeGreaterThan(0);
      act(() => withTestId[0].props.onPress());
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'own_account',
          id: 'own-ag1',
        }),
      );
    } finally {
      act(() => tree.unmount());
    }
  });

  it('muestra banner de error de contactos y reintenta', () => {
    const retryContacts = jest.fn();
    mockUseBeneficiaryContactsViewModel.mockReturnValue({
      contacts: [],
      isLoading: false,
      error: 'Error contactos',
      retry: retryContacts,
    });
    const tree = renderModal({
      visible: true,
      onRequestClose,
      onSelect,
    });
    try {
      expect(renderedText(tree.toJSON())).toContain('Error contactos');
      const buttons = tree.root.findAllByType(TouchableOpacity);
      const retryBtn = buttons.find(b =>
        textFromInstance(b).includes('Reintentar'),
      );
      expect(retryBtn).toBeDefined();
      act(() => retryBtn?.props.onPress());
      expect(retryContacts).toHaveBeenCalled();
    } finally {
      act(() => tree.unmount());
    }
  });

  it('filtra contactos al escribir en el buscador', () => {
    const tree = renderModal({
      visible: true,
      onRequestClose,
      onSelect,
    });
    try {
      expect(renderedText(tree.toJSON())).toContain('Ana López');
      const inputs = tree.root.findAllByType(TextInput);
      expect(inputs.length).toBeGreaterThan(0);
      act(() => {
        inputs[0].props.onChangeText('zzz');
      });
      expect(renderedText(tree.toJSON())).toContain(
        'No hay contactos que coincidan con la búsqueda',
      );
    } finally {
      act(() => tree.unmount());
    }
  });

  it('cierra con el botón Volver', () => {
    const tree = renderModal({
      visible: true,
      onRequestClose,
      onSelect,
    });
    try {
      const back = tree.root.findAll(
        n =>
          n.type === TouchableOpacity &&
          n.props.accessibilityLabel === 'Volver',
      );
      expect(back.length).toBe(1);
      act(() => back[0].props.onPress());
      expect(onRequestClose).toHaveBeenCalled();
    } finally {
      act(() => tree.unmount());
    }
  });
});
