import React, {useMemo} from 'react';
import {View, Text, StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';

interface ErrorMessageProps {
  message: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ErrorMessage({
  message,
  style,
  testID,
}: Readonly<ErrorMessageProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View testID={testID} style={[styles.container, style]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.errorBg,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: colors.errorBorder,
        },
        text: {
          color: colors.error,
          fontSize: 14,
          textAlign: 'center',
        },
      }),
    [colors],
  );
}
