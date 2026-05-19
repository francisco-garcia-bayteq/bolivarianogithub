import React, {useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';

interface LabeledInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  hasError?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function LabeledInput({
  label,
  hasError = false,
  style,
  ...textInputProps
}: Readonly<LabeledInputProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        placeholderTextColor={colors.placeholder}
        {...textInputProps}
      />
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: 6,
        },
        label: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textLabel,
          marginLeft: 4,
        },
        input: {
          backgroundColor: colors.inputBg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: colors.textPrimary,
        },
        inputError: {
          borderColor: colors.error,
        },
      }),
    [colors],
  );
}
