import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import {ChevronRightIcon} from './HomeIcons';

type Props = {
  icon: React.ReactNode;
  label: string;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
};

export function FrequentPaymentRow({
  icon,
  label,
  isFirst = false,
  isLast = false,
  onPress,
}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors, isFirst, isLast);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <ChevronRightIcon color={colors.textTertiary} size={16} />
    </TouchableOpacity>
  );
}

function useStyles(
  colors: ThemeColors,
  isFirst: boolean,
  isLast: boolean,
) {
  return useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: colors.surface,
          paddingHorizontal: 8,
          paddingVertical: 8,
          minHeight: 55,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: colors.borderSubtle,
          borderTopLeftRadius: isFirst ? 8 : 0,
          borderTopRightRadius: isFirst ? 8 : 0,
          borderBottomLeftRadius: isLast ? 8 : 0,
          borderBottomRightRadius: isLast ? 8 : 0,
        },
        iconWrap: {
          width: 16,
          height: 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
        label: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
        },
      }),
    [colors, isFirst, isLast],
  );
}
