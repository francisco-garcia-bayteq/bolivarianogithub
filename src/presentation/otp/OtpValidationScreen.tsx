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

import {useTheme, type ThemeColors} from '../../providers';
import {ErrorMessage, OtpCodeInput} from '../components';
import {Lexend} from '../../theme/lexend';
import {useOtpValidationViewModel} from './useOtpValidationViewModel';
import type {TransferStackParamList} from '../../features/transfer/navigation/TransferStackNavigator';

const otpBackArrow = require('../../../assets/images/arrow-left.png');
const otpLockOpen = require('../../../assets/images/lock-keyhole-open.png');

type OTPScreenRouteProp = RouteProp<
  TransferStackParamList,
  'OtpValidationTransfer'
>;

interface OTPScreenComponentProps {
  route: OTPScreenRouteProp;
}

export function OtpValidationScreen({
  route: _route,
}: Readonly<OTPScreenComponentProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const navigation =
    useNavigation<NativeStackNavigationProp<TransferStackParamList>>();

  const {
    code,
    error,
    isLoading,
    onChangeCode,
    handleValidate,
  } = useOtpValidationViewModel(
    async () => {
      navigation.dispatch(
        StackActions.popTo(
          'TransferReview',
          {resultFromOtp: {otpValidated: true}},
          {merge: true},
        ),
      );
    },
    {flow: 'transfer'},
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

  const headerTitle = 'AUTENTICACIÓN';

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

        {error ? (
          <ErrorMessage
            testID="otp-error"
            message={error}
            style={styles.error}
          />
        ) : null}
        <TouchableOpacity
          onPress={handleForgotPin}
          activeOpacity={0.8}
          style={styles.forgotWrap}
          accessibilityRole="button">
          <Text style={styles.forgotText}>¿Olvidaste tu PIN?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function useStyles(colors: ThemeColors) {
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
          textAlign: 'center',
        },
        headerSpacer: {
          width: 24,
        },
        scrollContent: {
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 16,
          alignItems: 'center',
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
      }),
    [colors],
  );
}
