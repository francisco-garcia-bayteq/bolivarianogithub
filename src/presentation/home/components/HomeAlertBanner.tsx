import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';

type Props = {
  title: string;
  subtitle: string;
  onPress?: () => void;
};

function CreditCardIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
      />
    </Svg>
  );
}

export function HomeAlertBanner({title, subtitle, onPress}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const content = (
    <>
      <View style={styles.iconWrap}>
        <CreditCardIcon color={colors.primary} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron} accessibilityLabel="Más">
        ›
      </Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          padding: 17,
          minHeight: 74,
          borderRadius: 12,
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(189, 201, 203, 0.2)',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        },
        iconWrap: {
          backgroundColor: colors.homeProductCardSurface,
          borderRadius: 8,
          padding: 8,
        },
        textCol: {
          flex: 1,
          minWidth: 0,
        },
        title: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textPrimary,
        },
        subtitle: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
          marginTop: 2,
        },
        chevron: {
          fontSize: 22,
          color: colors.textTertiary,
          fontWeight: '300',
        },
      }),
    [colors],
  );
}
