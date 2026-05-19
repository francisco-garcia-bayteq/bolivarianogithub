import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';

interface OrSeparatorProps {
  /** Figma uses lowercase "o" as separator */
  label?: string;
}

export function OrSeparator({label = 'o'}: Readonly<OrSeparatorProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={styles.root}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          minHeight: 24,
        },
        text: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textPrimary,
          textAlign: 'center',
        },
      }),
    [colors],
  );
}
