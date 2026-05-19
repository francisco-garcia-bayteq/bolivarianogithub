import React, {useMemo} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function FilterChip({label, selected, onPress, style}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors, selected);

  return (
    <TouchableOpacity
      style={[styles.chip, style]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{selected}}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

function useStyles(colors: ThemeColors, selected: boolean) {
  return useMemo(
    () =>
      StyleSheet.create({
        chip: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: selected
            ? colors.homeProductCardSurface
            : colors.buttonSecondaryBg,
          borderWidth: selected ? 1 : 0,
          borderColor: selected ? colors.primary : 'transparent',
        },
        label: {
          fontFamily: selected ? Lexend.semiBold : Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: selected ? colors.textSecondary : colors.textTertiary,
        },
      }),
    [colors, selected],
  );
}
