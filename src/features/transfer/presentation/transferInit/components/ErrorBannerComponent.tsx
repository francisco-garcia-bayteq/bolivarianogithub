import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import {ThemeColors, useTheme} from '../../../../../providers';
import {buildTransferSharedStyles} from '../../components/transferSharedStyles';

interface ErrorBannerComponentProps {
  textRetry: string;
  errorText: string;
  onRetry: () => void;
}

export function ErrorBannerComponent({
  textRetry,
  errorText,
  onRetry,
}: Readonly<ErrorBannerComponentProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{errorText}</Text>
      <TouchableOpacity onPress={onRetry}>
        <Text style={styles.retryText}>{textRetry}</Text>
      </TouchableOpacity>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => {
    const shared = buildTransferSharedStyles(colors);
    return StyleSheet.create({
      errorBanner: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 8,
        backgroundColor: colors.errorBg,
      },
      errorText: shared.errorText,
      retryText: shared.retryText,
    });
  }, [colors]);
}
