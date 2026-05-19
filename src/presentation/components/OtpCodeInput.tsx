import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';

export type OtpCodeInputVariant = 'dots' | 'boxed';

interface OtpCodeInputProps {
  value: string;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  variant?: OtpCodeInputVariant;
}

export function OtpCodeInput({
  value,
  length = 6,
  disabled = false,
  hasError = false,
  variant = 'dots',
}: Readonly<OtpCodeInputProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const cells = Array.from({length}, (_, index) => value[index] ?? '');

  if (variant === 'boxed') {
    return (
      <View style={styles.rowBoxed}>
        {cells.map((digit, index) => {
          const filled = !!digit;
          return (
            <View
              key={`cell-${index}-${digit}`}
              style={[
                styles.boxCell,
                hasError && styles.boxError,
                disabled && styles.boxDisabled,
              ]}>
              {filled ? (
                <Text style={styles.boxDigit}>{digit}</Text>
              ) : (
                <View style={styles.boxPlaceholder} />
              )}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {cells.map((digit, index) => {
        const filled = !!digit;
        return (
          <View key={`dot-${index}-${digit}`} style={styles.dotCell}>
            <View
              style={[
                styles.dot,
                filled ? styles.dotFilled : styles.dotEmpty,
                hasError && styles.dotError,
                disabled && styles.dotDisabled,
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          gap: 8,
        },
        dotCell: {
          flex: 1,
          minWidth: 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
        dot: {
          width: 14,
          height: 14,
          borderRadius: 7,
          borderWidth: 2,
        },
        dotFilled: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        dotEmpty: {
          backgroundColor: '#e2e2e2',
          borderColor: '#e2e2e2',
        },
        dotError: {
          borderColor: colors.error,
        },
        dotDisabled: {
          opacity: 0.7,
        },
        rowBoxed: {
          flexDirection: 'row',
          alignItems: 'stretch',
          width: '100%',
          gap: 8,
        },
        boxCell: {
          flex: 1,
          minWidth: 0,
          height: 60,
          borderRadius: 8,
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.borderLight,
          alignItems: 'center',
          justifyContent: 'center'
        },
        boxError: {
          borderColor: colors.error,
        },
        boxDisabled: {
          opacity: 0.7,
        },
        boxDigit: {
          fontFamily: Lexend.semiBold,
          fontSize: 22,
          lineHeight: 28,
          color: colors.textPrimary,
        },
        boxPlaceholder: {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.textTertiary,
        },
      }),
    [colors],
  );
}
