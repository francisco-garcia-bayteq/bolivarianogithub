import React, {useMemo, type ReactNode} from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  ImageSourcePropType,
  Image,
  View,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../../../providers';
import {Lexend} from '../../../../theme/lexend';

type ButtonVariant = 'primary' | 'outline' | 'loginPrimary';

function featureButtonTouchableStyles(
  variant: ButtonVariant,
  isPressDisabled: boolean,
  disabledBackgroundColor: string | undefined,
  sheet: ReturnType<typeof useStyles>,
  style: StyleProp<ViewStyle> | undefined,
): StyleProp<ViewStyle>[] {
  return [
    sheet.base,
    variant === 'primary' && sheet.primary,
    variant === 'outline' && sheet.outline,
    variant === 'loginPrimary' && sheet.loginPrimary,
    isPressDisabled &&
      (disabledBackgroundColor
        ? {backgroundColor: disabledBackgroundColor}
        : sheet.disabled),
    style,
  ];
}

function featureButtonLoaderColor(
  variant: ButtonVariant,
  colors: ThemeColors,
): string {
  return variant === 'outline' ? colors.primary : colors.white;
}

interface FeatureButtonTrailingEndProps{
    iconSourceRight: ImageSourcePropType | ReactNode | undefined;
    iconRightTintColor?: string;
    styles: ReturnType<typeof useStyles>;
}
function FeatureButtonTrailingEnd({
  iconSourceRight,
  iconRightTintColor,
  styles,
}: Readonly<FeatureButtonTrailingEndProps>): React.ReactNode {
  if (!iconSourceRight) {
    return null;
  }
  if (React.isValidElement(iconSourceRight)) {
    return (
      <View style={styles.iconTrailingContainer}>{iconSourceRight}</View>
    );
  }
  return (
    <Image
      source={iconSourceRight as ImageSourcePropType}
      style={[
        styles.iconTrailing,
        iconRightTintColor ? {tintColor: iconRightTintColor} : null,
      ]}
      resizeMode="contain"
    />
  );
}

interface FeatureButtonInnerPrps{
    loading: boolean;
    variant: ButtonVariant;
    colors: ThemeColors;
    title: string;
    iconSource: ImageSourcePropType | undefined;
    iconSourceRight: ImageSourcePropType | ReactNode | undefined;
    iconRightTintColor?: string;
    labelStyle: StyleProp<TextStyle> | undefined;
    styles: ReturnType<typeof useStyles>;
}

function FeatureButtonInner({
  loading,
  variant,
  colors,
  title,
  iconSource,
  iconSourceRight,
  iconRightTintColor,
  labelStyle,
  styles,
}: Readonly<FeatureButtonInnerPrps>): React.ReactNode {
  if (loading) {
    return (
      <ActivityIndicator
        color={featureButtonLoaderColor(variant, colors)}
        size="small"
      />
    );
  }
  return (
    <View style={styles.contentRow}>
      {iconSource ? (
        <Image
          source={iconSource}
          style={styles.iconLeading}
          resizeMode="contain"
        />
      ) : null}
      <Text
        style={[
          styles.text,
          variant === 'outline' && styles.outlineText,
          variant === 'loginPrimary' && styles.loginPrimaryText,
          labelStyle,
        ]}>
        {title}
      </Text>
      <FeatureButtonTrailingEnd
        iconSourceRight={iconSourceRight}
        iconRightTintColor={iconRightTintColor}
        styles={styles}
      />
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  iconSource?: ImageSourcePropType;
  iconSourceRight?: ImageSourcePropType | ReactNode;
  iconRightTintColor?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Si se define, el fondo en estado deshabilitado o cargando usa este color (sin opacidad). */
  disabledBackgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  /** Estilo del texto del título (p. ej. tamaño en pantallas de comprobante). */
  labelStyle?: StyleProp<TextStyle>;
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
  labelStyle,
  testID,
}: Readonly<ButtonProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const isPressDisabled = disabled || loading;

  return (
    <TouchableOpacity
      testID={testID}
      style={featureButtonTouchableStyles(
        variant,
        isPressDisabled,
        disabledBackgroundColor,
        styles,
        style,
      )}
      onPress={onPress}
      disabled={isPressDisabled}
      activeOpacity={0.8}>
      <FeatureButtonInner
        loading={loading}
        variant={variant}
        colors={colors}
        title={title}
        iconSource={iconSource}
        iconSourceRight={iconSourceRight}
        iconRightTintColor={iconRightTintColor}
        labelStyle={labelStyle}
        styles={styles}
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
        loginPrimaryDisabled: {
          backgroundColor: colors.textTertiary,
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
        iconLeadingWrap: {
          marginRight: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        iconTrailing: {
          width: 24,
          height: 24,
          marginLeft: 8,
        },
        iconTrailingContainer: {
          marginLeft: 8,
          alignItems: 'center',
          justifyContent: 'center',
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
