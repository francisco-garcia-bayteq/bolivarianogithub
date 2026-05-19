import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../providers/theme';

interface PublicKeyErrorScreenProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function PublicKeyErrorScreen({
  message: _message,
  onRetry,
  isRetrying = false,
}: Readonly<PublicKeyErrorScreenProps>) {
  const {colors} = useTheme();

  return (
    <SafeAreaView
      style={[styles.root, {backgroundColor: colors.background}]}
      edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.content}>
        <Text style={[styles.title, {color: colors.textPrimary}]}>
          No pudimos continuar
        </Text>
        <Text style={[styles.body, {color: colors.textSecondary}]}>
          No pudimos cargar la aplicación correctamente. Por favor, intenta
          acceder de nuevo en unos momentos o pulsa Reintentar.
        </Text>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: colors.primary}]}
          onPress={onRetry}
          disabled={isRetrying}
          activeOpacity={0.85}>
          {isRetrying ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.buttonLabel, {color: colors.white}]}>
              Reintentar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
