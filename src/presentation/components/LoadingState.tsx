import React, {useMemo} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({message}: Readonly<LoadingStateProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          alignItems: 'center',
          paddingVertical: 48,
        },
        text: {
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 12,
        },
      }),
    [colors],
  );
}
