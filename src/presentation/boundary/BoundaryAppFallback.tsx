import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {FallbackProps} from 'react-error-boundary';

export function BoundaryAppFallback({
  error,
  resetErrorBoundary,
}: Readonly<FallbackProps>) {
  const errorMessage =
    error instanceof Error ? error.message : String(error);

  return (
    <View style={styles.root}>


      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>!</Text>
        </View>

        <Text style={styles.title}>Algo salió mal</Text>

        <Text style={styles.subtitle}>
          Ocurrió un error inesperado.{'\n'}Puedes intentar de nuevo.
        </Text>

        <View style={styles.errorBox}>
          <Text style={styles.errorLabel}>Detalle</Text>
          <Text style={styles.errorMessage} numberOfLines={5}>
            {errorMessage}
          </Text>
        </View>

        <Pressable
          style={({pressed}) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={resetErrorBoundary}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const PRIMARY = '#008292';
const ERROR = '#DC2626';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  headerStrip: {
    height: 180,
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent:'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    borderWidth: 3,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ERROR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  iconText: {
    fontSize: 38,
    fontWeight: '800',
    color: ERROR,
    marginTop: -2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: ERROR,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  errorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ERROR,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorMessage: {
    fontSize: 13,
    color: '#474747',
    lineHeight: 19,
  },
  button: {
    width: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
