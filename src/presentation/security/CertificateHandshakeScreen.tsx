import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useDI} from '../../di';
import {SecureStorageKeys} from '../../data/datasources/storage/SecureStorageKeys';
import type {RootStackParamList} from '../../navigation/AppNavigator';
import {Button, ErrorMessage, LoadingState} from '../components';
import {useTheme, type ThemeColors} from '../../providers/theme';

type CertificateHandshakeNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'CertificateHandshake'
>;

interface Props {
  navigation: CertificateHandshakeNavigation;
}

type Phase = 'checking' | 'loading' | 'error';

export function CertificateHandshakeScreen({navigation}: Readonly<Props>) {
  const {runCertificateHandshakeUseCase, secureStorageService} = useDI();
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState<string | null>(null);

  const completeHandshake = useCallback(async () => {
    setPhase('loading');
    setError(null);
    await runCertificateHandshakeUseCase.execute();
    navigation.replace('Login');
  }, [
    navigation,
    runCertificateHandshakeUseCase,
    secureStorageService,
  ]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const existing = await secureStorageService.get(
        SecureStorageKeys.CERTIFICATE_HASH,
      );
      if (cancelled) {
        return;
      }
      if (existing) {
        navigation.replace('Login');
        return;
      }

      try {
        await completeHandshake();
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudo validar el certificado';
        setError(message);
        setPhase('error');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [completeHandshake, navigation, secureStorageService]);

  const handleRetry = useCallback(() => {
    const run = async () => {
      setPhase('loading');
      setError(null);
      try {
        await completeHandshake();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudo validar el certificado';
        setError(message);
        setPhase('error');
      }
    };
    run();
  }, [completeHandshake]);

  if (phase === 'checking' || phase === 'loading') {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Seguridad</Text>
          <Text style={styles.subtitle}>
            Validando certificado con el servidor…
          </Text>
        </View>
        <LoadingState message="Comprobando certificado" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Seguridad</Text>
        <Text style={styles.subtitle}>
          No se pudo completar la validación del certificado.
        </Text>
      </View>
      {error ? <ErrorMessage message={error} /> : null}
      <Button title="Reintentar" onPress={handleRetry} />
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return React.useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 48,
          backgroundColor: colors.background,
        },
        header: {
          marginBottom: 24,
        },
        title: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.textPrimary,
        },
        subtitle: {
          marginTop: 8,
          fontSize: 15,
          color: colors.textSecondary,
        },
      }),
    [colors],
  );
}
