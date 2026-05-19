import React, {useMemo} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import {BankBuildingIcon, ChevronRightIcon} from './HomeIcons';

type Props = {
  onPress?: () => void;
};

export function RequestProductRow({onPress}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Solicita un producto"
      disabled={!onPress}>
      <BankBuildingIcon color={colors.homeProductCardSurface} size={48} />
      <Text style={styles.label}>Solicitar productos</Text>
      <ChevronRightIcon color={colors.textTertiary} size={18} />
    </TouchableOpacity>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: colors.surface,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 8,
          height: 52,
         
        },
        label: {
          flex: 1,
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 20,
          marginRight: 42,
          marginLeft: 6,
          color: colors.textPrimary,
        },
      }),
    [colors],
  );
}
