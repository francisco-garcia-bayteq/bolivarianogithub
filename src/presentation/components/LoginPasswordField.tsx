import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';
import {LOGIN_INPUT_OUTER_HEIGHT} from './loginFieldLayout';
import EyeOnSvg from '../../../assets/images/svg/eye.svg';
import EyeOffSvg from '../../../assets/images/svg/eye-slash.svg';

const EYE_ICON_SIZE = 20;

type LoginPasswordFieldVariant = 'flat' | 'elevated';

interface LoginPasswordFieldProps
  extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  label?: string;
  hasError?: boolean;
  errorMessage?: string;
  eyeIconUri?: string;
  containerStyle?: StyleProp<ViewStyle>;
  variant?: LoginPasswordFieldVariant;
  testID?: string;
  errorTestID?: string;
}

export function LoginPasswordField({
  label = '',
  hasError = false,
  errorMessage,
  containerStyle,
  variant = 'flat',
  testID,
  errorTestID,
  ...textInputProps
}: Readonly<LoginPasswordFieldProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const [visible, setVisible] = useState(false);
  const showLabel = label.trim().length > 0;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {showLabel ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
        </View>
      ) : null}
      <View
        style={[
          styles.inputRow,
          variant === 'elevated' && styles.inputRowElevated,
          (hasError || !!errorMessage) && styles.inputRowError,
        ]}>
        <TextInput
          testID={testID}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          {...textInputProps}
          secureTextEntry={!visible}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
          }
          onPress={() => setVisible(v => !v)}
          style={styles.eyeButton}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          {visible ? (
            <EyeOnSvg
              width={EYE_ICON_SIZE}
              height={EYE_ICON_SIZE}
              color={colors.iconPrimary}
            />
          ) : (
            <EyeOffSvg
              width={EYE_ICON_SIZE}
              height={EYE_ICON_SIZE}
              color={colors.iconPrimary}
            />
          )}
        </TouchableOpacity>
      </View>
      {errorMessage ? (
        <Text testID={errorTestID} style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          width: '100%',
        },
        labelRow: {
          paddingHorizontal: 4,
          marginBottom: 8,
        },
        label: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textPrimary,
        },
        inputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.inputBg,
          borderRadius: 8,
          paddingLeft: 16,
          paddingRight: 12,
          height: LOGIN_INPUT_OUTER_HEIGHT,
          borderWidth: 0,
        },
        /** Sin sombra; mantiene la prop `variant` por compatibilidad. */
        inputRowElevated: {},
        inputRowError: {
          borderWidth: 1,
          borderColor: colors.error,
        },
        input: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 14,
          ...(Platform.OS === 'android' ? {lineHeight: 22} : {}),
          color: colors.textPrimary,
          ...(Platform.OS === 'ios'
            ? {paddingTop: 0, paddingBottom: 3}
            : {paddingVertical: 0, textAlignVertical: 'center'}),
        },
        eyeButton: {
          padding: 4,
        },
        errorText: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 18,
          color: colors.error,
          marginTop: 4,
          marginLeft: 4,
        },
      }),
    [colors],
  );
}
