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
import {useTheme, type ThemeColors} from '../../../../providers';
import {Lexend} from '../../../../theme/lexend';

type SecondaryVariant = 'muted' | 'outline';

function secondaryIconTintStyle(
  iconTintColor: string | undefined,
): {tintColor: string} | null {
  return iconTintColor === undefined ? null : {tintColor: iconTintColor};
}

type SecondaryIconButtonContentProps = Readonly<{
  loading: boolean;
  variant: SecondaryVariant;
  colors: ThemeColors;
  title: string;
  iconSource: ImageSourcePropType | undefined;
  iconSourceRight: ImageSourcePropType | undefined;
  iconTintColor: string | undefined;
  styles: ReturnType<typeof useStyles>;
}>;

function SecondaryIconButtonContent({
  loading,
  variant,
  colors,
  title,
  iconSource,
  iconSourceRight,
  iconTintColor,
  styles,
}: SecondaryIconButtonContentProps) {
  const tint = secondaryIconTintStyle(iconTintColor);
  if (loading) {
    return (
      <ActivityIndicator
        color={variant === 'outline' ? colors.primary : colors.iconPrimary}
        size="small"
      />
    );
  }
  return (
    <>
      {iconSource == null ? null : (
        <Image
          source={iconSource}
          style={[styles.icon, tint]}
          resizeMode="contain"
        />
      )}
      <Text
        style={[styles.label, variant === 'outline' && styles.labelOutline]}>
        {title}
      </Text>
      {iconSourceRight == null ? null : (
        <Image
          source={iconSourceRight}
          style={[styles.icon, tint]}
          resizeMode="contain"
        />
      )}
    </>
  );
}

interface SecondaryIconButtonProps {
  title: string;
  iconSource?: ImageSourcePropType;
  iconSourceRight?: ImageSourcePropType;
  iconTintColor?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: SecondaryVariant;
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
  variant = 'muted',
}: Readonly<SecondaryIconButtonProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.root,
        variant === 'outline' && styles.rootOutline,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}>
      <SecondaryIconButtonContent
        loading={loading}
        variant={variant}
        colors={colors}
        title={title}
        iconSource={iconSource}
        iconSourceRight={iconSourceRight}
        iconTintColor={iconTintColor}
        styles={styles}
      />
    </TouchableOpacity>
  );
}

function useStyles(colors: ThemeColors) {
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
          backgroundColor: colors.buttonSecondaryBg,
          width: '100%',
        },
        rootOutline: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.primary
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
          color: colors.textPrimary,
        },
        labelOutline: {
          fontSize: 14,
          lineHeight: 22,
          color: colors.primary,
        },
      }),
    [colors],
  );
}
