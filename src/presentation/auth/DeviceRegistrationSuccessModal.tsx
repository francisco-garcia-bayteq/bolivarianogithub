import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, type ThemeColors } from '../../providers';
import { Button } from '../components';
import { Lexend } from '../../theme/lexend';

const shieldKeyholeIcon = require('../../../assets/images/shield-keyhole.png');

const AUTO_DISMISS_MS = 5000;

const BIOMETRIC_SUCCESS_MESSAGE =
  'Tu acceso biométrico ha sido registrado';

export type DeviceRegistrationSuccessModalVariant =
  | 'deviceRegistration'
  | 'biometricRegistration';

interface DeviceRegistrationSuccessModalProps {
  visible: boolean;
  onContinue: () => Promise<void>;
  /** Por defecto `deviceRegistration` (alias de dispositivo). */
  variant?: DeviceRegistrationSuccessModalVariant;
}

export function DeviceRegistrationSuccessModal({
  visible,
  onContinue,
  variant = 'deviceRegistration',
}: Readonly<DeviceRegistrationSuccessModalProps>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useStyles(colors);
  const isBiometric = variant === 'biometricRegistration';
  const onContinueRef = useRef(onContinue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);
  onContinueRef.current = onContinue;

  const runContinue = useCallback(() => {
    if (doneRef.current) {
      return;
    }
    doneRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onContinueRef.current().catch(() => { });
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }
    doneRef.current = false;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      runContinue();
    }, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, runContinue]);

  const continueTestId = isBiometric
    ? 'biometric-registration-success-continue'
    : 'device-registration-success-continue';

  return (
    <Modal
      testID={
        isBiometric ? 'biometric-registration-success-modal' : undefined
      }
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={runContinue}>
      <View
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          },
        ]}>
        <View style={styles.card} accessibilityViewIsModal>
          <View
            style={styles.modalHeader
            }>
            <>
              <View style={styles.headerSpacer} />
              <Text style={styles.modalTitle} accessibilityRole="header">
                ¡TODO LISTO!
              </Text>
            </>
            <Pressable
              onPress={runContinue}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Cerrar">
              <Text style={styles.closeIcon}>×</Text>
            </Pressable>
          </View>

          <View
            style={isBiometric ? [styles.body, styles.bodyBiometric] : styles.body}>
            <Text style={styles.bodyText}>
              {isBiometric
                ? BIOMETRIC_SUCCESS_MESSAGE
                : 'Tu nuevo dispositivo ha sido registrado, estás listo para ingresar a tu Banca móvil.'}
            </Text>
            <Button
              title={isBiometric ? 'Continuar' : 'Iniciar sesión'}
              onPress={runContinue}
              variant="loginPrimary"
              iconSourceRight={
                isBiometric ? undefined : shieldKeyholeIcon
              }
              iconRightTintColor={
                isBiometric ? undefined : colors.white
              }
              testID={continueTestId}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        },
        card: {
          width: '100%',
          maxWidth: 360,
          backgroundColor: colors.surface,
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        },
        modalHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          minHeight: 52,
          backgroundColor: colors.white,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        headerSpacer: {
          width: 40,
        },
        modalTitle: {
          flex: 1,
          fontFamily: Lexend.bold,
          fontSize: 16,
          lineHeight: 24,
          color: colors.textPrimary,
          textAlign: 'center',
        },
        closeBtn: {
          width: 40,
          alignItems: 'flex-end',
          justifyContent: 'center',
        },
        closeIcon: {
          fontSize: 28,
          lineHeight: 32,
          color: colors.textPrimary,
          fontWeight: '400',
        },
        body: {
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 24,
        },
        bodyBiometric: {
          paddingTop: 12,
        },
        bodyText: {
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 26,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 28,
        },
      }),
    [colors],
  );
}
