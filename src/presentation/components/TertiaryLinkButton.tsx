import React, {useMemo} from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';

interface TertiaryLinkButtonProps {
  title: string;
  /** Si se omite, solo se muestra el texto (p. ej. "? Ayuda" completo en una sola cadena). */
  iconUri?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export function TertiaryLinkButton({
  title,
  iconUri,
  onPress,
  style,
  labelStyle,
  testID,
}: Readonly<TertiaryLinkButtonProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.root, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}>
      {iconUri ? (
        <Image
          source={{uri: iconUri}}
          style={styles.icon}
          resizeMode="contain"
        />
      ) : null}
      <Text style={[styles.label, labelStyle]}>{title}</Text>
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
          gap: 6,
          paddingVertical: 8,
          paddingHorizontal: 4,
          borderRadius: 8,
        },
        icon: {
          width: 20,
          height: 20,
          tintColor: colors.linkPrimary,
        },
        label: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 26,
          color: colors.linkPrimary,
        },
      }),
    [colors],
  );
}
