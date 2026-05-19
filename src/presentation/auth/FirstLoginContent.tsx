import React, {useMemo} from 'react';
import {View, Text, Image, StyleSheet, Pressable, type TextStyle, type ViewStyle} from 'react-native';

import {useTheme, type ThemeColors} from '../../providers';
import {
  Button,
  ErrorMessage,
  LoginTextField,
  LoginPasswordField,
  DevelopmentNoticeModal,
} from '../components';
import {Lexend} from '../../theme/lexend';
import {LoginFooterBlock} from './LoginFooterBlock';
import {useDevelopmentNoticeModalState} from './useDevelopmentNoticeModalState';
import {useLoginVersionLabel} from './useLoginVersionLabel';

const loginSubmitArrowIcon = require('../../../assets/images/arrow-right-from-bracket.png');

const bankMark = require('../../../assets/images/BBIcon.png');

const FORGOT_LINK_ROWS = [
  {
    key: 'username',
    label: '¿Olvidaste tu usuario?',
    accessibilityLabel: '¿Olvidaste tu usuario?',
  },
  {
    key: 'password',
    label: '¿Olvidaste tu contraseña?',
    accessibilityLabel: '¿Olvidaste tu contraseña?',
  },
] as const;

export interface FirstLoginContentProps {
  email: string;
  password: string;
  emailError: string | null;
  passwordError: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  isBusy: boolean;
  isLoadingLogin: boolean;
  /** true cuando usuario y contraseña cumplen las reglas de validación (mismo criterio que el envío). */
  isCredentialLoginEnabled: boolean;
  error: string | null;
  onLogin: () => void;
}

export function FirstLoginContent({
  email,
  password,
  emailError,
  passwordError,
  onEmailChange,
  onPasswordChange,
  isBusy,
  isLoadingLogin,
  isCredentialLoginEnabled,
  error,
  onLogin,
}: Readonly<FirstLoginContentProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const {visible, show, close} = useDevelopmentNoticeModalState();
  const versionLabel = useLoginVersionLabel();

  const submitDisabled = isBusy || !isCredentialLoginEnabled;

  return (
    <View style={styles.column}>
      <View style={styles.brandBlock}>
        <Image
          source={bankMark}
          style={styles.logoMark}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <Text style={styles.heroTitleContainer} accessibilityRole="text">
          <Text style={styles.heroTitle}>Bienvenido a</Text>
          {'\n'}
          <Text style={styles.heroTitle}>tu banca móvil</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Ingresa con usuario y contraseña
        </Text>
      </View>

      <View style={styles.inputs}>
        <LoginTextField
          testID="login-email-input"
          placeholder="Alias o usuario"
          value={email}
          onChangeText={onEmailChange}
          hasError={!!emailError}
          errorMessage={emailError ?? undefined}
          errorTestID="login-username-error"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isBusy}
          autoComplete="username"
        />
        <LoginForgotRow
          label={FORGOT_LINK_ROWS[0].label}
          accessibilityLabel={FORGOT_LINK_ROWS[0].accessibilityLabel}
          onPress={show}
          styles={styles}
        />

        <LoginPasswordField
          testID="login-password-input"
          placeholder="Contraseña"
          value={password}
          onChangeText={onPasswordChange}
          hasError={!!passwordError}
          errorMessage={passwordError ?? undefined}
          errorTestID="login-password-error"
          editable={!isBusy}
          autoComplete="password"
          variant="elevated"
        />
        <LoginForgotRow
          label={FORGOT_LINK_ROWS[1].label}
          accessibilityLabel={FORGOT_LINK_ROWS[1].accessibilityLabel}
          onPress={show}
          styles={styles}
        />
      </View>

      {error ? (
        <ErrorMessage
          testID="login-error"
          message={error}
          style={styles.errorBanner}
        />
      ) : null}

      <View style={styles.actions}>
        <Button
          testID="login-submit"
          title="Iniciar sesión"
          onPress={onLogin}
          iconRightTintColor={colors.white}
          iconSourceRight={loginSubmitArrowIcon}
          loading={isLoadingLogin}
          disabled={submitDisabled}
          disabledBackgroundColor={colors.textTertiary}
          variant="loginPrimary"
        />
      </View>

      <View style={styles.actionsSecondary}>
        <Pressable
          testID="login-create-user"
          onPress={show}
          style={({pressed}) => [
            styles.createUserLinkHit,
            pressed && styles.createUserLinkHitPressed,
          ]}
          accessibilityRole="link"
          accessibilityLabel="Crear usuario">
          <Text style={styles.createUserLinkText}>Crear usuario</Text>
        </Pressable>
      </View>

      <LoginFooterBlock
        versionLabel={versionLabel}
        onShowDevelopmentNotice={show}
        contactVariant="first"
      />

      <DevelopmentNoticeModal visible={visible} onClose={close} />
    </View>
  );
}

interface LoginForgotRowStyles {
  forgotRow: ViewStyle;
  forgotText: TextStyle;
}

function LoginForgotRow({
  label,
  accessibilityLabel,
  onPress,
  styles,
}: Readonly<{
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  styles: LoginForgotRowStyles;
}>) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.forgotRow}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <Text style={styles.forgotText}>{label}</Text>
    </Pressable>
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
        brandBlock: {
          alignItems: 'center',
          marginBottom: 28,
          marginTop: 8,
          gap: 12,
        },
        logoMark: {
          width: 72,
          height: 72,
          marginTop: 30,
        },
        heroTitle: {
          fontFamily: Lexend.regular,
          color: colors.textPrimary,
          textAlign: 'center',
          width: '65%',
        },
        heroTitleContainer: {
          fontFamily: Lexend.regular,
          fontSize: 20,
          color: colors.textPrimary,
          textAlign: 'center',
          paddingTop: 24,
          paddingBottom: 25,
          width: '65%',
        },
        heroSubtitle: {
          fontFamily: Lexend.regular,
          fontSize: 17,
          lineHeight: 26,
          color: colors.textTertiary,
          textAlign: 'center',
        },
        inputs: {
          gap: 8,
          marginBottom: 8,
        },
        forgotRow: {
          alignSelf: 'flex-end',
          marginTop: -4,
          marginBottom: 4,
          paddingVertical: 4,
        },
        forgotText: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 22,
          opacity: 0.8,
          color: colors.textSecondary,
        },
        errorBanner: {
          marginBottom: 16,
        },
        actions: {
          marginTop: 8,
          gap: 8,
          marginBottom: 16,
        },
        /** Misma caja táctil que `Button` outline (`base`: 14/24, radio 12). */
        createUserLinkHit: {
          alignSelf: 'stretch',
          borderRadius: 12,
          paddingVertical: 4,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        },
        createUserLinkHitPressed: {
          opacity: 0.85,
        },
        createUserLinkText: {
          fontFamily: Lexend.bold,
          fontSize: 16,
          lineHeight: 26,
          color: colors.linkPrimary,
        },
        actionsSecondary: {
          marginBottom: 16,
        },
      }),
    [colors],
  );
}
