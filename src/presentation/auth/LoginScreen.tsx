import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {View, StyleSheet, Alert, ActivityIndicator, AppState} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  useLoginViewModel,
  BIOMETRIC_ENROLLMENT_CHANGED_MESSAGE,
} from './useLoginViewModel';
import {CompactLoginContent} from './CompactLoginContent';
import {FirstLoginContent} from './FirstLoginContent';
import {SecureStorageKeys} from '../../data/datasources/storage/SecureStorageKeys';
import {useAuth} from '../../providers';
import {useDI} from '../../di';
import {useTheme, type ThemeColors} from '../../providers';
import {RootStackParamList} from '../../navigation/AppNavigator.tsx';

export function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {login, suppressCompactAutoBiometricGeneration} = useAuth();
  const [suppressAutoBiometricPromptOnce, setSuppressAutoBiometricPromptOnce] =
    useState(false);
  const lastHandledSuppressGenerationRef = useRef(0);

  useLayoutEffect(() => {
    const gen = suppressCompactAutoBiometricGeneration;
    if (gen > lastHandledSuppressGenerationRef.current) {
      lastHandledSuppressGenerationRef.current = gen;
      setSuppressAutoBiometricPromptOnce(true);
    }
  }, [suppressCompactAutoBiometricGeneration]);
  const {biometricRSAAuthOrchestrator, secureStorageService} = useDI();
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const [showBiometricLogin, setShowBiometricLogin] = useState(false);
  /** `null` = cargando almacén; string vacío = sin usuario vinculado; no vacío = modo compacto */
  const [deviceBoundLoginId, setDeviceBoundLoginId] = useState<string | null>(
    null,
  );
  const [deviceBoundGreetingName, setDeviceBoundGreetingName] =
    useState<string>('');
  const [deviceBoundGreetingFirstName, setDeviceBoundGreetingFirstName] =
    useState<string>('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadDeviceBoundProfile = useCallback(async () => {
    const [id, name, firstName] = await Promise.all([
      secureStorageService.get(SecureStorageKeys.DEVICE_BOUND_LOGIN_ID),
      secureStorageService.get(SecureStorageKeys.DEVICE_BOUND_GREETING_NAME),
      secureStorageService.get(
        SecureStorageKeys.DEVICE_BOUND_GREETING_FIRST_NAME,
      ),
    ]);
    if (!isMountedRef.current) {
      return;
    }
    setDeviceBoundLoginId(id?.trim() ?? '');
    setDeviceBoundGreetingName(name?.trim() ?? '');
    setDeviceBoundGreetingFirstName(firstName?.trim() ?? '');
  }, [secureStorageService]);

  const loadBiometricAvailability = useCallback(async () => {
    try {
      const hasRegistration =
        await biometricRSAAuthOrchestrator.hasBiometricRegistration();
      if (isMountedRef.current) {
        setShowBiometricLogin(hasRegistration);
      }
    } catch {
      if (isMountedRef.current) {
        setShowBiometricLogin(false);
      }
    }
  }, [biometricRSAAuthOrchestrator]);

  useEffect(() => {
    void loadDeviceBoundProfile();
    void loadBiometricAvailability();
  }, [loadBiometricAvailability, loadDeviceBoundProfile]);

  useFocusEffect(
    useCallback(() => {
      void loadDeviceBoundProfile();
      void loadBiometricAvailability();
    }, [loadBiometricAvailability, loadDeviceBoundProfile]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        void loadDeviceBoundProfile();
        void loadBiometricAvailability();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [loadBiometricAvailability, loadDeviceBoundProfile]);

  const isDeviceBoundCredentialsFlow =
    deviceBoundLoginId !== null && deviceBoundLoginId.length > 0;
    const deviceBoundParam =
    deviceBoundLoginId ? { deviceBoundLoginId } : undefined;
  const {
    email,
    password,
    emailError,
    passwordError,
    isLoadingLogin,
    isLoadingBiometric,
    isBusy,
    error,
    biometricEnrollmentRevoked,
    acknowledgeBiometricEnrollmentRevoked,
    isDeviceBoundCompact,
    resetForDifferentUser,
    isCredentialLoginEnabled,
    setEmail,
    setPassword,
    handleLogin,
    handleBiometricLogin,
  } = useLoginViewModel(
    
    user => {
      navigation.navigate('OtpValidation', {
        mode: 'login',
        user,
        email: user.email,
        ...(isDeviceBoundCredentialsFlow || user.alias !== undefined
          ? {skipRegisterAlias: true}
          : {}),
      });
    },
    user => {
      login(user).catch();
    },
    deviceBoundParam,
  );

  useEffect(() => {
    if (!biometricEnrollmentRevoked) {
      return;
    }
    setShowBiometricLogin(false);
    Alert.alert(
      'Acceso biométrico desactualizado',
      BIOMETRIC_ENROLLMENT_CHANGED_MESSAGE,
      [{text: 'Entendido', onPress: acknowledgeBiometricEnrollmentRevoked}],
    );
  }, [
    biometricEnrollmentRevoked,
    acknowledgeBiometricEnrollmentRevoked,
  ]);

  const handleChangeUser = async () => {
    await Promise.allSettled([
      secureStorageService.remove(SecureStorageKeys.DEVICE_BOUND_LOGIN_ID),
      secureStorageService.remove(SecureStorageKeys.DEVICE_BOUND_GREETING_NAME),
      secureStorageService.remove(
        SecureStorageKeys.DEVICE_BOUND_GREETING_FIRST_NAME,
      ),
      // Otro usuario en el mismo dispositivo debe poder ver de nuevo la oferta biométrica.
      secureStorageService.remove(SecureStorageKeys.BIOMETRIC_OFFER_DECLINED),
    ]);
    await biometricRSAAuthOrchestrator.clearBiometricRegistration();
    setDeviceBoundLoginId('');
    setDeviceBoundGreetingName('');
    setDeviceBoundGreetingFirstName('');
    setShowBiometricLogin(false);
    resetForDifferentUser();
  };

  const compactGreetingName =
    deviceBoundGreetingName.length > 0
      ? deviceBoundGreetingName
      : deviceBoundLoginId ?? '';

  const showCompactLayout =
    deviceBoundLoginId !== null &&
    deviceBoundLoginId.length > 0 &&
    isDeviceBoundCompact;
    let content;

    if (deviceBoundLoginId === null) {
      content = (
        <ActivityIndicator
          accessibilityLabel="Cargando"
          color={colors.primary}
          style={styles.inputsLoading}
        />
      );
    } else if (showCompactLayout) {
      content = (
        <CompactLoginContent
          greetingFirstName={deviceBoundGreetingFirstName}
          greetingName={compactGreetingName}
          password={password}
          passwordError={passwordError}
          onPasswordChange={setPassword}
          isBusy={isBusy}
          isLoadingLogin={isLoadingLogin}
          isLoadingBiometric={isLoadingBiometric}
          isCredentialLoginEnabled={isCredentialLoginEnabled}
          error={error}
          showBiometricLogin={showBiometricLogin}
          suppressAutoBiometricPromptOnce={suppressAutoBiometricPromptOnce}
          onLogin={handleLogin}
          onBiometricLogin={handleBiometricLogin}
          onChangeUser={handleChangeUser}
        />
      );
    } else {
      content = (
        <FirstLoginContent
          email={email}
          password={password}
          emailError={emailError}
          passwordError={passwordError}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          isBusy={isBusy}
          isLoadingLogin={isLoadingLogin}
          isCredentialLoginEnabled={isCredentialLoginEnabled}
          error={error}
          onLogin={handleLogin}
        />
      );
    }
  return (
    <View style={[styles.shell, {backgroundColor: colors.background}]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAwareScrollView
          style={styles.root}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.contentColumn}>
          {content}
        </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

function useStyles(_colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        shell: {
          flex: 1,
        },
        safe: {
          flex: 1,
        },
        root: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: 24,
        },
        contentColumn: {
          width: '100%',
          maxWidth: 400,
          alignSelf: 'center',
        },
        inputsLoading: {
          alignSelf: 'center',
          marginVertical: 24,
        },
      }),
    [],
  );
}
