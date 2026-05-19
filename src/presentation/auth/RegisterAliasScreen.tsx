import React, {useCallback, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useTheme, type ThemeColors, useAuth} from '../../providers';
import {useDI} from '../../di';
import {Button, ErrorMessage, LoginTextField} from '../components';
import {Lexend} from '../../theme/lexend';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {useRegisterAliasViewModel} from './useRegisterAliasViewModel';
import {DeviceRegistrationSuccessModal} from './DeviceRegistrationSuccessModal';
import {navigatePostLoginEnrollment} from './navigatePostLoginEnrollment';

const arrowBack = require('../../../assets/images/arrow-left.png');
const arrowRightIcon = require('../../../assets/images/arrow_rigth.png');

export function RegisterAliasScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'RegisterAlias'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {user, email} = route.params;
  const {login} = useAuth();
  const {biometricRSAAuthOrchestrator, secureStorageService} = useDI();
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const {
    alias,
    inlineError,
    submitError,
    isLoading,
    onChangeAlias,
    submit,
  } = useRegisterAliasViewModel();

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleEnrollmentContinue = useCallback(async () => {
    await navigatePostLoginEnrollment(
      navigation,
      user,
      email.trim(),
      {
        biometricRSAAuthOrchestrator,
        secureStorageService,
        login,
      },
    );
  }, [
    navigation,
    user,
    email,
    biometricRSAAuthOrchestrator,
    secureStorageService,
    login,
  ]);

  const handleSubmit = useCallback(async () => {
    const ok = await submit();
    if (ok) {
      setShowSuccessModal(true);
    }
  }, [submit]);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'bottom']}
      testID="register-alias-screen">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Volver">
            <Image
              source={arrowBack}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            ALIAS
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Configura tu alias</Text>

          <LoginTextField
            containerStyle={styles.fieldWrap}
            testID="register-alias-input"
            placeholder="Alias"
            value={alias}
            onChangeText={onChangeAlias}
            editable={!isLoading}
            hasError={!!inlineError}
            errorMessage={inlineError ?? undefined}
            errorTestID="register-alias-input-error"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => handleSubmit().catch(() => {})}
          />

          {submitError ? (
            <ErrorMessage message={submitError} style={styles.submitError} />
          ) : null}

          <Button
            testID="register-alias-continue"
            title="Continuar "
            onPress={() => handleSubmit().catch(() => {})}
            loading={isLoading}
            disabled={isLoading}
            variant="loginPrimary"
            iconSourceRight={arrowRightIcon}
          />

          <Text style={styles.footerNote}>
            Podrás configurar tu alias más tarde desde los ajustes de seguridad
          </Text>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>

      <DeviceRegistrationSuccessModal
        visible={showSuccessModal}
        onContinue={handleEnrollmentContinue}
      />
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
        flex: {
          flex: 1,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          minHeight: 56,
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
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 32,
          alignItems: 'center',
        },
        hero: {
          width: '100%',
          maxWidth: 280,
          height: 160,
          marginBottom: 20,
        },
        title: {
          alignSelf: 'stretch',
          fontFamily: Lexend.regular,
          fontSize: 24,
          lineHeight: 42,
          color: colors.textPrimary,
          textAlign: 'left',
          marginBottom: 20,
          paddingBottom: 24,
        },
        fieldWrap: {
          alignSelf: 'stretch',
          marginBottom: 24,
        },
        submitError: {
          alignSelf: 'stretch',
          marginTop: 8,
          marginBottom: 8,
        },
        footerNote: {
          marginTop: 24,
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 20,
          color: colors.textTertiary,
          textAlign: 'center',
        },
      }),
    [colors],
  );
}
