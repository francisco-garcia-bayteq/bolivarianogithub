import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';

type Props = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
};

export function QuickActionButton({icon, label, onPress}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        button: {
          flex: 1,
          backgroundColor: colors.homeProductCardSurface,
          borderRadius: 8,
          paddingTop: 8,
          paddingBottom: 4,
          paddingHorizontal: 8,
          alignItems: 'flex-start',
          justifyContent: 'center',
        },
        iconWrap: {
          marginBottom: 2,
        },
        label: {
          fontFamily: Lexend.regular,
          fontSize: 8,
          lineHeight: 20,
          color: colors.homeHeaderIconButtonBg,
          textAlign: 'center',
        },
      }),
    [colors],
  );
}
