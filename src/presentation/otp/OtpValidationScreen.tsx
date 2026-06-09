import React, {useMemo, useEffect, useRef} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import {RouteProp, StackActions, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useTheme, type ThemeColors, useAuth} from '../../providers';
import {useDI} from '../../di';
import {ErrorMessage, OtpCodeInput} from '../components';
import {Lexend} from '../../theme/lexend';
import {useOtpValidationViewModel} from './useOtpValidationViewModel';
import {RootStackParamList} from '../../navigation/AppNavigator.tsx';
import type {TransferStackParamList} from '../../features/transfer/navigation/TransferStackNavigator';
import {navigatePostLoginEnrollment} from '../auth/navigatePostLoginEnrollment';

const otpBackArrow = require('../../../assets/images/arrow-left.png');
const otpLockOpen = require('../../../assets/images/lock-keyhole-open.png');
const otpShield = require('../../../assets/images/otp-lock.png');
const otpClock = require('../../../assets/images/clock-rotate-left.png');

type OTPScreenRouteProp =
  | RouteProp<RootStackParamList, 'OtpValidation'>
  | RouteProp<TransferStackParamList, 'OtpValidationTransfer'>;

interface OTPScreenComponentProps {
  route: OTPScreenRouteProp;
}

export function OtpValidationScreen({
  route,
}: Readonly<OTPScreenComponentProps>) {
  const {colors} = useTheme();
  const params = route.params;
  const isLogin = params.mode === 'login';
  const styles = useStyles(colors, isLogin ? 'login' : 'transfer');
  const navigation = useNavigation<
    NativeStackNavigationProp<RootStackParamList | TransferStackParamList>
  >();
  const {login} = useAuth();
  const {biometricRSAAuthOrchestrator, secureStorageService} = useDI();

  const {
    code,
    error,
    isLoading,
    onChangeCode,
    handleValidate,
    canResend,
    showResendControl,
    formattedCountdown,
    handleResend,
  } = useOtpValidationViewModel(
    async () => {
      if (params.mode === 'login') {
        const rootNav = navigation as NativeStackNavigationProp<RootStackParamList>;
        if (params.skipRegisterAlias) {
          await navigatePostLoginEnrollment(rootNav, params.user, params.email, {
            biometricRSAAuthOrchestrator,
            secureStorageService,
            login,
          });
        } else {
          rootNav.navigate('RegisterAlias', {
            user: params.user,
            email: params.email,
          });
        }
        return;
      }
      if (params.mode === 'transfer') {
        navigation.dispatch(
          StackActions.popTo(
            'TransferReview',
            {resultFromOtp: {otpValidated: true}},
            {merge: true},
          ),
        );
      }
    },
    {flow: isLogin ? 'login' : 'transfer'},
  );

  const lastSubmitted = useRef<string | null>(null);
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (code.length < 6) {
      lastSubmitted.current = null;
    }
  }, [code]);

  useEffect(() => {
    if (code.length !== 6 || isLoading || error) {
      return;
    }
    if (lastSubmitted.current === code) {
      return;
    }
    lastSubmitted.current = code;
    handleValidate().catch(() => {});
  }, [code, isLoading, error, handleValidate]);

  const handleOtpTextChange = (text: string) => {
    const digits = text.replaceAll(/\D/g, '').slice(0, 6);
    onChangeCode(digits);
  };

  useEffect(() => {
    const id = setTimeout(() => {
      otpInputRef.current?.focus();
    }, 400);
    return () => clearTimeout(id);
  }, []);

  const handleForgotPin = () => {
    Alert.alert(
      'Ayuda',
      'Si no recuerdas tu PIN o no recibiste el código, contacta a soporte.',
    );
  };

  const headerTitle = isLogin ? 'ENROLAMIENTO' : 'AUTENTICACIÓN';

  return (
    <SafeAreaView
      testID="otp-screen"
      style={styles.safe}
      edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Volver">
          <Image
            source={otpBackArrow}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {isLogin ? (
          <>
            <Text style={styles.sectionTitle}>Verificación de seguridad</Text>
            <Image
              source={otpShield}
              style={styles.shieldIcon}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
              accessibilityLabel="Verificación de seguridad"
            />
            <Text style={styles.loginBody}>
              Enviamos un código de verificación de 6 dígitos a tu celular
              terminado en <Text style={styles.loginBodyLastDigits}>****458</Text>.
            </Text>
            <Pressable
              style={styles.pinInputWrap}
              onPress={() => otpInputRef.current?.focus()}
              accessibilityRole="none"
              accessibilityHint="Abre el teclado para ingresar el código">
              <OtpCodeInput
                value={code}
                hasError={!!error}
                disabled={isLoading}
                length={6}
                variant="boxed"
              />
              <TextInput
                ref={otpInputRef}
                testID="otp-input"
                value={code}
                onChangeText={handleOtpTextChange}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={6}
                editable={!isLoading}
                caretHidden
                style={styles.hiddenOtpInput}
                accessibilityLabel="Código de verificación de 6 dígitos"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                importantForAutofill="yes"
              />
            </Pressable>
            <View style={styles.timerRow}>
              <Image
                source={otpClock}
                style={styles.timerIcon}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.timerText}>
                El código expira en: {formattedCountdown}
              </Text>
            </View>
            {showResendControl ? (
              <Pressable
                onPress={() => handleResend()}
                disabled={!canResend}
                style={styles.resendWrap}
                accessibilityRole="button"
                accessibilityState={{disabled: !canResend}}
                accessibilityLabel="Reenviar código">
                <Text
                  style={[
                    styles.resendLabel,
                    canResend ? styles.resendLabelEnabled : styles.resendLabelDisabled,
                  ]}>
                  Reenviar código
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.instruction}>
              Introduce tu PIN para continuar
            </Text>
            <Image
              source={otpLockOpen}
              style={styles.padlock}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
              accessibilityLabel="Candado abierto"
            />
            <Pressable
              style={styles.pinInputWrap}
              onPress={() => otpInputRef.current?.focus()}
              accessibilityRole="none"
              accessibilityHint="Abre el teclado para ingresar el PIN">
              <OtpCodeInput
                value={code}
                hasError={!!error}
                disabled={isLoading}
                length={6}
              />
              <TextInput
                ref={otpInputRef}
                testID="otp-input"
                value={code}
                onChangeText={handleOtpTextChange}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={6}
                editable={!isLoading}
                caretHidden
                style={styles.hiddenOtpInput}
                accessibilityLabel="PIN de 6 dígitos"
                textContentType="oneTimeCode"
              />
            </Pressable>
          </>
        )}

        {error ? (
          <ErrorMessage
            testID="otp-error"
            message={error}
            style={styles.error}
          />
        ) : null}
        {params.mode === 'transfer' ? (
          <TouchableOpacity
            onPress={handleForgotPin}
            activeOpacity={0.8}
            style={styles.forgotWrap}
            accessibilityRole="button">
            <Text style={styles.forgotText}>¿Olvidaste tu PIN?</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function useStyles(colors: ThemeColors, layout: 'login' | 'transfer') {
  return useMemo(
    () =>
      StyleSheet.create({
        safe: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          minHeight: 64,
          backgroundColor: colors.white,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        backIcon: {
          width: 24,
          height: 24,
        },
        headerTitle: {
          flex: 1,
          fontFamily: Lexend.bold,
          fontSize: 16,
          lineHeight: 24,
          letterSpacing: 0.6,
          color: colors.textPrimary,
          textAlign: 'center'
        },
        headerSpacer: {
          width: 24,
        },
        scrollContent: {
          paddingHorizontal: 24,
          paddingTop: layout === 'login' ? 20 : 28,
          paddingBottom: 16,
          alignItems: layout === 'login' ? 'stretch' : 'center',
        },
        sectionTitle: {
          alignSelf: 'stretch',
          fontFamily: Lexend.regular,
          fontSize: 20,
          lineHeight: 42,
          color: colors.textPrimary,
          textAlign: 'left',
          marginTop: 24,
          marginBottom: 8,
        },
        loginBody: {
          alignSelf: 'stretch',
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          textAlign: 'left',
          marginTop: 16,
          marginBottom: 8,
        },
        shieldIcon: {
          width: 96,
          height: 96,
          alignSelf: 'center',
          marginTop: 20,
          marginBottom: 10,
        },
        timerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
          marginBottom: 30,
          gap: 8,
        },
        timerIcon: {
          width: 18,
          height: 18,
          tintColor: colors.textSecondary,
        },
        timerText: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textSecondary,
        },
        instruction: {
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 26,
          color: colors.textPrimary,
          textAlign: 'center',
          paddingHorizontal: 8,
        },
        padlock: {
          width: 120,
          height: 160,
          marginTop: 28,
          marginBottom: 28,
        },
        pinInputWrap: {
          alignSelf: 'stretch',
          alignItems: 'stretch',
          marginTop: layout === 'login' ? 20 : 0,
          position: 'relative',
          minHeight: 52,
        },
        hiddenOtpInput: {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          opacity: 0.02,
          color: 'transparent',
        },
        error: {
          alignSelf: 'stretch',
          marginTop: 12,
          marginBottom: 8,
        },
        forgotWrap: {
          alignSelf: 'center',
          marginTop: 20,
          paddingVertical: 8,
          paddingHorizontal: 4,
          borderRadius: 8,
        },
        forgotText: {
          fontFamily: Lexend.bold,
          fontSize: 16,
          lineHeight: 26,
          color: colors.primary,
          textAlign: 'center',
        },
        resendWrap: {
          alignSelf: 'center',
          marginTop: 20,
          paddingVertical: 8,
          paddingHorizontal: 4,
        },
        resendLabel: {
          fontFamily: Lexend.bold,
          fontSize: 15,
          lineHeight: 24,
          textAlign: 'center',
        },
        resendLabelEnabled: {
          color: colors.primary,
          opacity: 1,
        },
        loginBodyLastDigits: {
          fontFamily: Lexend.regular,
          fontSize: 15,
          lineHeight: 24,
          color: colors.textPrimary,
          textAlign: 'left',
        },
        resendLabelDisabled: {
          color: colors.textTertiary,
          opacity: 0.45,
        },
      }),
    [colors, layout],
  );
}
