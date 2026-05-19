import React, {useEffect, useMemo, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';

import {useTheme, type ThemeColors} from '../../providers';
import {
  ErrorMessage,
  LoginPasswordField,
  TertiaryLinkButton,
  DevelopmentNoticeModal,
  LoginHeroImageCarousel,
} from '../components';
import {LoginFooterBlock} from './LoginFooterBlock';
import {useDevelopmentNoticeModalState} from './useDevelopmentNoticeModalState';
import {useLoginVersionLabel} from './useLoginVersionLabel';
import {Lexend} from '../../theme/lexend';

import LoginSubmitArrowSvg from '../../../assets/images/svg/arrow-right-from-bracket.svg';
import FingerprintSvg from '../../../assets/images/svg/fingerprint.svg';

const bankBannerTwoLines = require('../../../assets/images/BBBannerTwoLines.png');
const heroLoginA = require('../../../assets/images/imagenfondo_login1.png');
const heroLoginB = require('../../../assets/images/imagenfondo_login2.png');
const faceViewfinderIcon = require('../../../assets/images/face-viewfinder.png');

const LOGIN_SUBMIT_ICON_SIZE = 24;
const SUBMIT_SQUARE_SIZE_WIDTH = 60;
const SUBMIT_SQUARE_SIZE_HEIGHT = 52;
const BIOMETRIC_ICON_SIZE = 24;
const IS_IOS = Platform.OS === 'ios';
const BIOMETRIC_LABEL = IS_IOS ? 'Face ID' : 'Huella';
const BIOMETRIC_ACCESSIBILITY_LABEL = IS_IOS
  ? 'Iniciar sesión con Face ID'
  : 'Iniciar sesión con huella';
const AUTO_BIOMETRIC_PROMPT_DELAY_MS = 250;
/** Mismo `paddingHorizontal` que `LoginScreen` scrollContent (24 + 24). */
const LOGIN_SCREEN_HORIZONTAL_INSET = 48;
/** `maxWidth` de `contentColumn` en LoginScreen. */
const LOGIN_CONTENT_MAX_WIDTH = 400;

export interface CompactLoginContentProps {
  /** Nombre de pila del API; si está vacío no se muestra prefijo en el saludo. */
  greetingFirstName?: string;
  greetingName: string;
  password: string;
  passwordError: string | null;
  onPasswordChange: (value: string) => void;
  isBusy: boolean;
  isLoadingLogin: boolean;
  isLoadingBiometric: boolean;
  /** true cuando la contraseña cumple las reglas de validación (mismo criterio que el envío). */
  isCredentialLoginEnabled: boolean;
  error: string | null;
  showBiometricLogin: boolean;
  /** Si true, no se dispara el prompt biométrico al montar (p. ej. tras cerrar sesión). */
  suppressAutoBiometricPromptOnce?: boolean;
  onLogin: () => void;
  onBiometricLogin: () => void;
  onChangeUser: () => void;
}

export function CompactLoginContent({
  greetingFirstName = '',
  greetingName,
  password,
  passwordError,
  onPasswordChange,
  isBusy,
  isLoadingLogin,
  isLoadingBiometric,
  isCredentialLoginEnabled,
  error,
  showBiometricLogin,
  suppressAutoBiometricPromptOnce = false,
  onLogin,
  onBiometricLogin,
  onChangeUser,
}: Readonly<CompactLoginContentProps>) {
  const {colors} = useTheme();
  const {width: windowWidth} = useWindowDimensions();
  const heroCarouselWidth = Math.min(
    windowWidth - LOGIN_SCREEN_HORIZONTAL_INSET,
    LOGIN_CONTENT_MAX_WIDTH,
  );
  const heroHeight = Math.max(
    160,
    Math.min(230, Math.round(heroCarouselWidth * 0.55)),
  );
  const styles = useStyles(colors);
  const {visible, show, close} = useDevelopmentNoticeModalState();
  const versionLabel = useLoginVersionLabel();
  const autoBiometricTriggeredRef = useRef(false);

  // Solicita biometría automáticamente al entrar al login compacto cuando hay
  // una credencial biométrica registrada. Sólo se dispara una vez por montaje
  // para no acosar al usuario si cancela o si el componente re-renderiza.
  useEffect(() => {
    if (
      !showBiometricLogin ||
      suppressAutoBiometricPromptOnce ||
      autoBiometricTriggeredRef.current
    ) {
      return;
    }
    autoBiometricTriggeredRef.current = true;
    const timeoutId = setTimeout(() => {
      onBiometricLogin();
    }, AUTO_BIOMETRIC_PROMPT_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [
    showBiometricLogin,
    suppressAutoBiometricPromptOnce,
    onBiometricLogin,
  ]);

  const notYouTitle = useMemo(
    () => {
      const first = greetingFirstName.trim();
      if (!first) {
        return `¿No eres ${greetingName}?`;
      }
      return `¿No eres ${first}?`;
    },
    [greetingFirstName, greetingName],
  );

  const welcomeBoldName = useMemo(() => {
    const first = greetingFirstName.trim();
    if (!first) {
      return greetingName;
    }
    return `${first}`;
  }, [greetingFirstName, greetingName]);

  const loginSubmitDisabled =
    isBusy || isLoadingLogin || !isCredentialLoginEnabled;

  return (
    <View style={styles.column}>
      <View style={styles.topRow}>
        <Image
          source={bankBannerTwoLines}
          style={styles.bankLogo}
          resizeMode="contain"
          accessibilityLabel="Banco Bolivariano"
        />
      </View>

      <View style={styles.heroCarousel}>
        <LoginHeroImageCarousel
          sourceA={heroLoginA}
          sourceB={heroLoginB}
          height={heroHeight}
        />
      </View>

      <Text style={styles.welcomeLine} accessibilityRole="text">
        <Text style={styles.welcomePrefix}>Bienvenido a tu banca </Text>
        {'\n'}
        <Text style={styles.welcomePrefix}>móvil, </Text>
        <Text style={styles.welcomeName}>{welcomeBoldName}</Text>
      </Text>

      <View style={styles.inputs}>
        <View style={styles.passwordRow}>
          <View style={styles.passwordFieldWrap}>
            <LoginPasswordField
              testID="login-password-input"
              label=""
              placeholder="Contraseña"
              value={password}
              onChangeText={onPasswordChange}
              hasError={!!passwordError}
              errorMessage={passwordError ?? undefined}
              errorTestID="login-password-error"
              editable={!isBusy}
              autoComplete="password"
            />
          </View>
          <Pressable
            testID="login-submit"
            onPress={onLogin}
            disabled={loginSubmitDisabled}
            style={({pressed}) => [
              styles.submitSquare,
              loginSubmitDisabled && styles.submitSquareDisabled,
              pressed && !loginSubmitDisabled && styles.submitSquarePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Ingresar"
            accessibilityState={{disabled: loginSubmitDisabled}}>
            {isLoadingLogin ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <LoginSubmitArrowSvg
                width={LOGIN_SUBMIT_ICON_SIZE}
                height={LOGIN_SUBMIT_ICON_SIZE}
              />
            )}
          </Pressable>
        </View>
      </View>

      {error ? (
        <ErrorMessage
          testID="login-error"
          message={error}
          style={styles.errorBanner}
        />
      ) : null}

      {showBiometricLogin ? (
        <Pressable
          onPress={onBiometricLogin}
          disabled={isBusy}
          style={({pressed}) => [
            styles.biometricButton,
            isBusy && styles.biometricButtonDisabled,
            pressed && !isBusy && styles.biometricButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={BIOMETRIC_ACCESSIBILITY_LABEL}
          accessibilityState={{disabled: isBusy}}>
          {isLoadingBiometric ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              <Text style={styles.biometricLabel}>{BIOMETRIC_LABEL}</Text>
              {IS_IOS ? (
                <Image
                  source={faceViewfinderIcon}
                  style={styles.biometricFaceImage}
                  resizeMode="contain"
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <FingerprintSvg
                  width={BIOMETRIC_ICON_SIZE}
                  height={BIOMETRIC_ICON_SIZE}
                  color={colors.primary}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
              )}
            </>
          )}
        </Pressable>
      ) : null}

      <TertiaryLinkButton
        testID="login-change-user"
        title={notYouTitle}
        onPress={onChangeUser}
        style={styles.changeUserLink}
      />

      <LoginFooterBlock
        versionLabel={versionLabel}
        onShowDevelopmentNotice={show}
        contactVariant="compact"
      />

      <DevelopmentNoticeModal visible={visible} onClose={close} />
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        column: {
          width: '100%',
          alignSelf: 'stretch',
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginTop: 30,
          marginBottom: 24,
        },
        bankLogo: {
          width: 147,
          height: 41,
        },
        heroCarousel: {
          alignSelf: 'stretch',
          marginBottom: 16,
        },
        welcomeLine: {
          fontFamily: Lexend.regular,
          fontSize: 20,
          lineHeight: 32,
          color: colors.textSecondary,
          marginBottom: 20,
          textAlign: 'left', // <-- Justificado a la izquierda
        },
        welcomePrefix: {
          fontFamily: Lexend.regular,
          fontSize: 20,
          lineHeight: 32,
          color: colors.textSecondary,
        },
        welcomeName: {
          fontFamily: Lexend.bold,
          fontSize: 20,
          lineHeight: 32,
          color: colors.textPrimary,
        },
        inputs: {
          marginBottom: 12,
          height: SUBMIT_SQUARE_SIZE_HEIGHT
        },
        passwordRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 16,
        },
        passwordFieldWrap: {
          flex: 1,
          minWidth: 0,
        },
        submitSquare: {
          width: SUBMIT_SQUARE_SIZE_WIDTH,
          height: SUBMIT_SQUARE_SIZE_HEIGHT,
          borderRadius: 12,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        submitSquareDisabled: {
          backgroundColor: colors.textTertiary,
          opacity: 0.85,
        },
        submitSquarePressed: {
          opacity: 0.92,
        },
        changeUserLink: {
          alignSelf: 'center',
          marginTop: 8,
          marginBottom: 20,
        },
        errorBanner: {
          marginBottom: 12,
        },
        biometricButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 12,
          backgroundColor: colors.borderLight,
          borderWidth: 1,
          borderColor: colors.primary,
          marginTop: 12,
          marginBottom: 2,
        },
        biometricButtonDisabled: {
          opacity: 0.6,
        },
        biometricButtonPressed: {
          opacity: 0.9,
        },
        biometricLabel: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 26,
          color: colors.primary,
        },
        biometricFaceImage: {
          width: BIOMETRIC_ICON_SIZE,
          height: BIOMETRIC_ICON_SIZE,
        },
      }),
    [colors],
  );
}
