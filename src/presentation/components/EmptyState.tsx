import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({message}: Readonly<EmptyStateProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
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
          color: colors.textTertiary,
        },
      }),
    [colors],
  );
}
