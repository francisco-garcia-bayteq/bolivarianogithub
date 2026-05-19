import React, {useMemo} from 'react';
import {Modal, View, Text, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';
import {Button} from './Button';

interface SessionTimeoutWarningModalProps {
  visible: boolean;
  secondsRemaining: number;
  onContinue: () => void;
}

export function SessionTimeoutWarningModal({
  visible,
  secondsRemaining,
  onContinue,
}: Readonly<SessionTimeoutWarningModalProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>⚠</Text>
          </View>

          <Text style={styles.title}>Sesión por expirar</Text>

          <Text style={styles.body}>
            Tu sesión cerrará en{' '}
            <Text style={styles.countdown}>{secondsRemaining}</Text> segundos
            por inactividad.
          </Text>

          <Button
            title="Continuar sesión"
            onPress={onContinue}
            variant="primary"
          />
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
          padding: 24,
          gap: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        },
        iconContainer: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.warningBg,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        },
        iconText: {
          fontSize: 24,
          color: colors.warning,
        },
        title: {
          fontFamily: Lexend.bold,
          fontSize: 18,
          lineHeight: 26,
          color: colors.textPrimary,
          textAlign: 'center',
        },
        body: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textSecondary,
          textAlign: 'center',
        },
        countdown: {
          fontFamily: Lexend.bold,
          color: colors.warning,
        },
      }),
    [colors],
  );
}
