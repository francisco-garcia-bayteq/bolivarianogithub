import React, {useMemo} from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';

interface SecondaryIconButtonProps {
  title: string;
  iconSource?: ImageSourcePropType;
  iconSourceRight?: ImageSourcePropType;
  iconTintColor?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

function optionalIconTint(
  iconTintColor: string | undefined,
): {tintColor: string} | null {
  return iconTintColor === undefined ? null : {tintColor: iconTintColor};
}

function secondaryLeadingContent(
  loading: boolean,
  iconSource: ImageSourcePropType | undefined,
  iconTintColor: string | undefined,
  styles: ReturnType<typeof useSecondaryIconStyles>,
  colors: ThemeColors,
): React.ReactNode {
  if (loading) {
    return (
      <ActivityIndicator color={colors.iconPrimary} size="small" />
    );
  }
  if (iconSource == null) {
    return null;
  }
  const tintStyle = optionalIconTint(iconTintColor);
  return (
    <Image
      source={iconSource}
      style={[styles.icon, tintStyle]}
      resizeMode="contain"
    />
  );
}

function secondaryTrailingIcon(
  iconSourceRight: ImageSourcePropType | undefined,
  iconTintColor: string | undefined,
  styles: ReturnType<typeof useSecondaryIconStyles>,
): React.ReactNode {
  if (iconSourceRight == null) {
    return null;
  }
  const tintStyle = optionalIconTint(iconTintColor);
  return (
    <Image
      source={iconSourceRight}
      style={[styles.icon, tintStyle]}
      resizeMode="contain"
    />
  );
}

export function SecondaryIconButton({
  title,
  iconSource,
  iconSourceRight,
  iconTintColor,
  onPress,
  disabled = false,
  loading = false,
  style,
}: Readonly<SecondaryIconButtonProps>) {
  const {colors} = useTheme();
  const styles = useSecondaryIconStyles(colors);

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.root, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}>
      {secondaryLeadingContent(
        loading,
        iconSource,
        iconTintColor,
        styles,
        colors,
      )}
      <Text style={styles.label}>{title}</Text>
      {secondaryTrailingIcon(iconSourceRight, iconTintColor, styles)}
    </TouchableOpacity>
  );
}

function useSecondaryIconStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderRadius: 8,
          backgroundColor: colors.background,
          borderColor: colors.primary,
          borderWidth: 2,
          width: '100%',
        },
        disabled: {
          opacity: 0.6,
        },
        icon: {
          width: 24,
          height: 24,
        },
        label: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 26,
          color: colors.primary,
        },
      }),
    [colors],
  );
}
