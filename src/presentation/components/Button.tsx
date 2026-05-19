import React, {useMemo} from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  ImageSourcePropType,
  Image,
  View,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers';
import {Lexend} from '../../theme/lexend';

type ButtonVariant = 'primary' | 'outline' | 'loginPrimary';

function buttonTouchableStyles(
  variant: ButtonVariant,
  isDisabled: boolean,
  useDisabledBackground: boolean,
  disabledBackgroundColor: string | undefined,
  sheet: ReturnType<typeof useStyles>,
  style: StyleProp<ViewStyle> | undefined,
): StyleProp<ViewStyle>[] {
  return [
    sheet.base,
    variant === 'primary' && sheet.primary,
    variant === 'outline' && sheet.outline,
    variant === 'loginPrimary' && sheet.loginPrimary,
    useDisabledBackground && {backgroundColor: disabledBackgroundColor},
    isDisabled && !useDisabledBackground && sheet.disabled,
    style,
  ];
}

function buttonActivityIndicatorColor(
  variant: ButtonVariant,
  colors: ThemeColors,
): string {
  return variant === 'outline' ? colors.primary : colors.white;
}

interface ButtonInnerProps {
  loading: boolean;
  variant: ButtonVariant;
  colors: ThemeColors;
  title: string;
  iconSource?: ImageSourcePropType;
  iconSourceRight?: ImageSourcePropType;
  iconRightTintColor?: string;
  sheet: ReturnType<typeof useStyles>;
}

function ButtonInner({
  loading,
  variant,
  colors,
  title,
  iconSource,
  iconSourceRight,
  iconRightTintColor,
  sheet,
}: Readonly<ButtonInnerProps>) {
  if (loading) {
    return (
      <ActivityIndicator
        color={buttonActivityIndicatorColor(variant, colors)}
        size="small"
      />
    );
  }
  return (
    <View style={sheet.contentRow}>
      {iconSource ? (
        <Image
          source={iconSource}
          style={sheet.iconLeading}
          resizeMode="contain"
        />
      ) : null}
      <Text
        style={[
          sheet.text,
          variant === 'outline' && sheet.outlineText,
          variant === 'loginPrimary' && sheet.loginPrimaryText,
        ]}>
        {title}
      </Text>
      {iconSourceRight ? (
        <Image
          source={iconSourceRight}
          style={[
            sheet.iconTrailing,
            iconRightTintColor ? {tintColor: iconRightTintColor} : null,
          ]}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  iconSource?: ImageSourcePropType;
  iconSourceRight?: ImageSourcePropType;
  iconRightTintColor?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Si se define, color de fondo cuando `disabled` es true (sin aplicar durante `loading`). */
  disabledBackgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  title,
  onPress,
  loading = false,
  iconSource,
  iconSourceRight,
  iconRightTintColor,
  variant = 'primary',
  disabled = false,
  disabledBackgroundColor,
  style,
  testID,
}: Readonly<ButtonProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const isDisabled = disabled || loading;
  const useDisabledBackground =
    !!disabledBackgroundColor && disabled && !loading;

  return (
    <TouchableOpacity
      testID={testID}
      style={buttonTouchableStyles(
        variant,
        isDisabled,
        useDisabledBackground,
        disabledBackgroundColor,
        styles,
        style,
      )}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}>
      <ButtonInner
        loading={loading}
        variant={variant}
        colors={colors}
        title={title}
        iconSource={iconSource}
        iconSourceRight={iconSourceRight}
        iconRightTintColor={iconRightTintColor}
        sheet={styles}
      />
    </TouchableOpacity>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        base: {
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
        },
        primary: {
          backgroundColor: colors.primary,
        },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        loginPrimary: {
          borderRadius: 8,
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: colors.primary,
          width: '100%',
        },
        disabled: {
          opacity: 0.7,
        },
        text: {
          color: colors.white,
          fontSize: 16,
          fontWeight: '600',
        },
        outlineText: {
          color: colors.primary,
        },
        loginPrimaryText: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 26,
          color: colors.white,
        },
        iconLeading: {
          width: 24,
          height: 24,
          marginRight: 8,
        },
        iconTrailing: {
          width: 24,
          height: 24,
          marginLeft: 8,
        },
        contentRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [colors],
  );
}
