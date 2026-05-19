/**
 * Unit tests for src/presentation/components/
 * Goal: maximise line, branch and function coverage for SonarQube.
 */
import React from 'react';
import {create, act} from 'react-test-renderer';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockColors = {
  background: '#fff',
  surface: '#fff',
  primary: '#008292',
  primaryLight: '#B3E5EC',
  textPrimary: '#1A1A1A',
  textSecondary: '#474747',
  textTertiary: '#757575',
  textLabel: '#1A1A1A',
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderSubtle: '#F2F2F2',
  inputBg: '#FFFFFF',
  placeholder: '#757575',
  buttonSecondaryBg: '#E2E2E2',
  iconPrimary: '#000',
  linkPrimary: '#008292',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  success: '#059669',
  successBg: '#ECFDF5',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  white: '#FFFFFF',
  balanceDivider: 'rgba(255,255,255,0.2)',
};

const mockTheme = {
  colors: mockColors,
  isDark: false,
  mode: 'light',
  setMode: jest.fn(),
  toggleTheme: jest.fn(),
};

// Theme providers
jest.mock('../../../providers/theme', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('../../../providers', () => ({
  useTheme: () => mockTheme,
}));

// react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const {View} = require('react-native');
  const Svg = ({children}: any) => React.createElement(View, null, children);
  const Path = () => null;
  const Circle = () => null;
  return {__esModule: true, default: Svg, Svg, Path, Circle};
});

// react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  SafeAreaView: ({children}: any) => children,
}));

// TransferIconClose used by DevelopmentNoticeModal
jest.mock('../../../features/transfer/presentation/components/transferIcons.tsx', () => ({
  TransferIconClose: () => null,
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────
import {Button} from '../Button';
import {EmptyState} from '../EmptyState';
import {LoadingState} from '../LoadingState';
import {LabeledInput} from '../LabeledInput';
import {ErrorMessage} from '../ErrorMessage';
import {OrSeparator} from '../OrSeparator';
import {OtpCodeInput} from '../OtpCodeInput';
import {OtpNumericKeypad} from '../OtpNumericKeypad';
import {TertiaryLinkButton} from '../TertiaryLinkButton';
import {LoginTextField} from '../LoginTextField';
import {LoginPasswordField} from '../LoginPasswordField';
import {SecondaryIconButton} from '../SecondaryIconButton';
import {SessionExpiredModal} from '../SessionExpiredModal';
import {SessionTimeoutWarningModal} from '../SessionTimeoutWarningModal';
import {SpacerView} from '../SpacerView';
import {DevelopmentNoticeModal} from '../DevelopmentNoticeModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const noop = jest.fn();
const fakeIcon = {uri: 'https://example.com/icon.png'};

function render(element: React.ReactElement) {
  let tree: any;
  act(() => {
    tree = create(element);
  });
  return tree!;
}

// ─── Button ───────────────────────────────────────────────────────────────────
describe('Button', () => {
  it('renders primary variant', () => {
    const tree = render(<Button title="OK" onPress={noop} />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders outline variant', () => {
    const tree = render(<Button title="Cancel" onPress={noop} variant="outline" />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders loginPrimary variant', () => {
    const tree = render(<Button title="Login" onPress={noop} variant="loginPrimary" />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders loading state (ActivityIndicator branch)', () => {
    const tree = render(<Button title="Loading" onPress={noop} loading />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders outline variant while loading (outline ActivityIndicator color branch)', () => {
    const tree = render(<Button title="X" onPress={noop} variant="outline" loading />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders disabled state', () => {
    const tree = render(<Button title="Disabled" onPress={noop} disabled />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with left icon', () => {
    const tree = render(<Button title="Icon" onPress={noop} iconSource={fakeIcon} />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with right icon', () => {
    const tree = render(<Button title="Icon" onPress={noop} iconSourceRight={fakeIcon} />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('calls onPress when not disabled', () => {
    const handler = jest.fn();
    const tree = render(<Button title="Go" onPress={handler} />);
    act(() => {
      tree.root.findByProps({onPress: handler}).props.onPress();
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ─── EmptyState ───────────────────────────────────────────────────────────────
describe('EmptyState', () => {
  it('renders with a message', () => {
    const tree = render(<EmptyState message="No hay datos" />);
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── LoadingState ─────────────────────────────────────────────────────────────
describe('LoadingState', () => {
  it('renders without message', () => {
    const tree = render(<LoadingState />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with message (text branch)', () => {
    const tree = render(<LoadingState message="Cargando..." />);
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── LabeledInput ─────────────────────────────────────────────────────────────
describe('LabeledInput', () => {
  it('renders without error', () => {
    const tree = render(<LabeledInput label="Nombre" />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with hasError=true (inputError style branch)', () => {
    const tree = render(<LabeledInput label="Nombre" hasError />);
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── ErrorMessage ─────────────────────────────────────────────────────────────
describe('ErrorMessage', () => {
  it('renders the error message', () => {
    const tree = render(<ErrorMessage message="Error inesperado" testID="err" />);
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── OrSeparator ──────────────────────────────────────────────────────────────
describe('OrSeparator', () => {
  it('renders default label "o"', () => {
    const tree = render(<OrSeparator />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders custom label', () => {
    const tree = render(<OrSeparator label="OR" />);
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── OtpCodeInput ─────────────────────────────────────────────────────────────
describe('OtpCodeInput', () => {
  it('renders empty (no digits filled)', () => {
    const tree = render(<OtpCodeInput value="" />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders partially filled (filled vs empty dot branches)', () => {
    const tree = render(<OtpCodeInput value="123" length={6} />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with hasError=true', () => {
    const tree = render(<OtpCodeInput value="12" hasError />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders disabled state', () => {
    const tree = render(<OtpCodeInput value="" disabled />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with custom length', () => {
    const tree = render(<OtpCodeInput value="1234" length={4} />);
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── OtpNumericKeypad ─────────────────────────────────────────────────────────
describe('OtpNumericKeypad', () => {
  const deleteIcon = {uri: 'https://example.com/delete.png'};

  it('renders all keys', () => {
    const tree = render(
      <OtpNumericKeypad onKeyPress={noop} deleteIconSource={deleteIcon} />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders disabled state', () => {
    const tree = render(
      <OtpNumericKeypad onKeyPress={noop} deleteIconSource={deleteIcon} disabled />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('calls onKeyPress with a digit', () => {
    const handler = jest.fn();
    const tree = render(
      <OtpNumericKeypad onKeyPress={handler} deleteIconSource={deleteIcon} />,
    );
    const digitTouch = tree.root.findAll(
      (node: any) => node.props.accessibilityLabel === 'Digito 1',
    )[0];
    act(() => {
      digitTouch?.props?.onPress?.();
    });
    expect(handler).toHaveBeenCalledWith('1');
  });

  it('calls onKeyPress with backspace', () => {
    const handler = jest.fn();
    const tree = render(
      <OtpNumericKeypad onKeyPress={handler} deleteIconSource={deleteIcon} />,
    );
    const backspaceTouch = tree.root.findAll(
      (node: any) => node.props.accessibilityLabel === 'Borrar',
    )[0];
    act(() => {
      backspaceTouch?.props?.onPress?.();
    });
    expect(handler).toHaveBeenCalledWith('backspace');
  });
});

// ─── TertiaryLinkButton ───────────────────────────────────────────────────────
describe('TertiaryLinkButton', () => {
  it('renders without icon', () => {
    const tree = render(<TertiaryLinkButton title="Ayuda" onPress={noop} />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with iconUri (image branch)', () => {
    const tree = render(
      <TertiaryLinkButton
        title="Ayuda"
        onPress={noop}
        iconUri="https://example.com/icon.png"
      />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('calls onPress', () => {
    const handler = jest.fn();
    const tree = render(<TertiaryLinkButton title="Go" onPress={handler} />);
    act(() => {
      tree.root.findByProps({onPress: handler}).props.onPress();
    });
    expect(handler).toHaveBeenCalled();
  });
});

// ─── LoginTextField ───────────────────────────────────────────────────────────
describe('LoginTextField', () => {
  it('renders without error', () => {
    const tree = render(<LoginTextField label="Usuario" />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with errorMessage (error text branch)', () => {
    const tree = render(
      <LoginTextField
        label="Usuario"
        errorMessage="Campo requerido"
        errorTestID="err-user"
      />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with hasError=true (inputError style branch)', () => {
    const tree = render(<LoginTextField label="Usuario" hasError />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with both hasError and errorMessage', () => {
    const tree = render(
      <LoginTextField label="Usuario" hasError errorMessage="Inválido" />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── LoginPasswordField ───────────────────────────────────────────────────────
describe('LoginPasswordField', () => {
  it('renders hidden password by default', () => {
    const tree = render(<LoginPasswordField label="Contraseña" />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('toggles password visibility (EyeOff → EyeOn branch)', () => {
    const tree = render(<LoginPasswordField label="Contraseña" />);
    const eyeBtn = tree.root.findAll(
      (node: any) => node.props.accessibilityLabel === 'Mostrar contraseña',
    )[0];
    act(() => {
      eyeBtn?.props?.onPress?.();
    });
    const eyeOff = tree.root.findAll(
      (node: any) => node.props.accessibilityLabel === 'Ocultar contraseña',
    );
    expect(eyeOff.length).toBeGreaterThan(0);
  });

  it('renders with errorMessage', () => {
    const tree = render(
      <LoginPasswordField
        label="Contraseña"
        errorMessage="Mínimo 6 caracteres"
        errorTestID="pwd-err"
      />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with hasError=true', () => {
    const tree = render(<LoginPasswordField label="Contraseña" hasError />);
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── SecondaryIconButton ──────────────────────────────────────────────────────
describe('SecondaryIconButton', () => {
  it('renders without icon', () => {
    const tree = render(<SecondaryIconButton title="Biometría" onPress={noop} />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with iconSource', () => {
    const tree = render(
      <SecondaryIconButton title="Biometría" onPress={noop} iconSource={fakeIcon} />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with iconTintColor (tintColor branch)', () => {
    const tree = render(
      <SecondaryIconButton
        title="Biometría"
        onPress={noop}
        iconSource={fakeIcon}
        iconTintColor="#ff0000"
      />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with iconSourceRight', () => {
    const tree = render(
      <SecondaryIconButton
        title="Biometría"
        onPress={noop}
        iconSource={fakeIcon}
        iconSourceRight={fakeIcon}
      />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders loading state', () => {
    const tree = render(
      <SecondaryIconButton title="Cargando" onPress={noop} loading />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders disabled state', () => {
    const tree = render(
      <SecondaryIconButton title="Disabled" onPress={noop} disabled />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('calls onPress when not disabled', () => {
    const handler = jest.fn();
    const tree = render(<SecondaryIconButton title="Tap" onPress={handler} />);
    act(() => {
      tree.root.findByProps({onPress: handler}).props.onPress();
    });
    expect(handler).toHaveBeenCalled();
  });
});

// ─── SessionExpiredModal ──────────────────────────────────────────────────────
describe('SessionExpiredModal', () => {
  it('renders when visible', () => {
    const tree = render(<SessionExpiredModal visible onAccept={noop} />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders without throwing when not visible', () => {
    expect(() => render(<SessionExpiredModal visible={false} onAccept={noop} />)).not.toThrow();
  });

  it('calls onAccept when the accept button is pressed', () => {
    const handler = jest.fn();
    const tree = render(<SessionExpiredModal visible onAccept={handler} />);
    // The Button inside passes onPress={handler} as onAccept
    const touchables = tree.root.findAll(
      (node: any) => typeof node.props.onPress === 'function',
    );
    act(() => {
      touchables[0]?.props?.onPress?.();
    });
    expect(handler).toHaveBeenCalled();
  });
});

// ─── SessionTimeoutWarningModal ───────────────────────────────────────────────
describe('SessionTimeoutWarningModal', () => {
  it('renders when visible', () => {
    const tree = render(
      <SessionTimeoutWarningModal visible secondsRemaining={30} onContinue={noop} />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders without throwing when not visible', () => {
    expect(() =>
      render(
        <SessionTimeoutWarningModal visible={false} secondsRemaining={0} onContinue={noop} />,
      ),
    ).not.toThrow();
  });

  it('shows the seconds remaining value', () => {
    const tree = render(
      <SessionTimeoutWarningModal visible secondsRemaining={15} onContinue={noop} />,
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('15');
  });
});

// ─── SpacerView ───────────────────────────────────────────────────────────────
describe('SpacerView', () => {
  it('renders with default height', () => {
    const tree = render(<SpacerView />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with custom height', () => {
    const tree = render(<SpacerView height={24} />);
    expect(tree.toJSON()).toBeTruthy();
  });
});

// ─── DevelopmentNoticeModal ───────────────────────────────────────────────────
describe('DevelopmentNoticeModal', () => {
  it('renders when visible with defaults', () => {
    const tree = render(<DevelopmentNoticeModal visible onClose={noop} />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders without throwing when not visible', () => {
    expect(() => render(<DevelopmentNoticeModal visible={false} onClose={noop} />)).not.toThrow();
  });

  it('renders with custom title and message', () => {
    const tree = render(
      <DevelopmentNoticeModal
        visible
        onClose={noop}
        title="Próximamente"
        message="Esta función estará disponible pronto"
      />,
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Próximamente');
  });

  it('renders with custom icon (icon prop branch)', () => {
    const CustomIcon = () => React.createElement('View' as any, null, 'icon');
    const tree = render(
      <DevelopmentNoticeModal visible onClose={noop} icon={<CustomIcon />} />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const handler = jest.fn();
    const tree = render(<DevelopmentNoticeModal visible onClose={handler} />);
    const closeBtn = tree.root.findAll(
      (node: any) => node.props.accessibilityLabel === 'Cerrar aviso',
    )[0];
    act(() => {
      closeBtn?.props?.onPress?.();
    });
    expect(handler).toHaveBeenCalled();
  });

  it('calls onClose when backdrop (Pressable) is pressed', () => {
    const handler = jest.fn();
    const tree = render(<DevelopmentNoticeModal visible onClose={handler} />);
    const backdrop = tree.root.findAll(
      (node: any) => node.props.accessibilityLabel === 'Cerrar',
    )[0];
    act(() => {
      backdrop?.props?.onPress?.();
    });
    expect(handler).toHaveBeenCalled();
  });
});
