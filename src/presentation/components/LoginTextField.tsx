import React, {useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';
import {LOGIN_INPUT_OUTER_HEIGHT} from './loginFieldLayout';

interface LoginTextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hasError?: boolean;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
  errorTestID?: string;
}

export function LoginTextField({
  label = '',
  hasError = false,
  errorMessage,
  containerStyle,
  testID,
  errorTestID,
  ...textInputProps
}: Readonly<LoginTextFieldProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const showLabel = label.trim().length > 0;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {showLabel ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        testID={testID}
        style={[
          styles.input,
          (hasError || !!errorMessage) && styles.inputError,
        ]}
        placeholderTextColor={colors.placeholder}
        {...textInputProps}
      />
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
        label: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textPrimary,
          marginLeft: 4,
          marginBottom: 8,
        },
        input: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          ...(Platform.OS === 'android' ? {lineHeight: 22} : {}),
          color: colors.textPrimary,
          backgroundColor: colors.inputBg,
          borderRadius: 8,
          paddingHorizontal: 16,
          height: LOGIN_INPUT_OUTER_HEIGHT,
          ...(Platform.OS === 'ios'
            ? {paddingTop: 12, paddingBottom: 18}
            : {
                paddingVertical: 14,
                textAlignVertical: 'center' as const,
              }),
          borderWidth: 0,
        },
        inputError: {
          borderWidth: 1,
          borderColor: colors.error,
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
