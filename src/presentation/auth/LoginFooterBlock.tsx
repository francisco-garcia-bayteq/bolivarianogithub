import React, {useMemo} from 'react';
import {View, Text, Image, StyleSheet, Pressable} from 'react-native';

import {useTheme, type ThemeColors} from '../../providers';
import {TertiaryLinkButton} from '../components';
import {Lexend} from '../../theme/lexend';

const institutionIcon = require('../../../assets/images/institution.png');
const arrowRightIcon = require('../../../assets/images/arrow_rigth_black.png');

export type LoginFooterContactVariant = 'first' | 'compact';

export interface LoginFooterBlockProps {
  versionLabel: string;
  onShowDevelopmentNotice: () => void;
  contactVariant: LoginFooterContactVariant;
}

export function LoginFooterBlock({
  versionLabel,
  onShowDevelopmentNotice,
  contactVariant,
}: Readonly<LoginFooterBlockProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors, contactVariant);

  return (
    <>
      <Pressable
        testID="login-request-product"
        onPress={onShowDevelopmentNotice}
        style={({pressed}) => [
          styles.productCard,
          pressed && styles.productCardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Solicitar productos">
        <View style={styles.productIconCircle}>
          <Image
            source={institutionIcon}
            style={styles.productIconImage}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
        <Text style={styles.productCardTitle}>Solicitar productos</Text>
        <View style={styles.arrowRightIconWrap}>
          <Image
            source={arrowRightIcon}
            style={styles.arrowRightIcon}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
      </Pressable>

      <TertiaryLinkButton
        testID="login-contact-us"
        title="¿Necesitas ayuda?"
        onPress={onShowDevelopmentNotice}
        style={styles.contactLink}
        labelStyle={styles.contactLinkLabel}
      />

      <Text style={styles.versionText} numberOfLines={1}>
        {versionLabel}
      </Text>
    </>
  );
}

function useStyles(colors: ThemeColors, contactVariant: LoginFooterContactVariant) {
  return useMemo(
    () =>
      StyleSheet.create({
        productCard: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          width: '100%',
          maxWidth: 280,
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 12,
          backgroundColor: colors.surface,
          marginTop: 40,
          marginBottom: 8,
          height: 48,
        },
        productCardPressed: {
          opacity: 0.92,
        },
        productIconCircle: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        productIconImage: {
          width: 40,
          height: 40,
        },
        productCardTitle: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 24,
          color: colors.textPrimary,
        },
        arrowRightIconWrap: {
          width: 15,
          height: 15,
        },
        arrowRightIcon: {
          width: 15,
          height: 15,
        },
        contactLink: {
          alignSelf: 'center',
          marginTop: contactVariant === 'first' ? 24 : 12,
          marginBottom: 8,
        },
        contactLinkLabel: {
          fontSize: contactVariant === 'first' ? 12 : 14,
          lineHeight: contactVariant === 'first' ? 18 : 22,
          textDecorationLine: 'underline',
        },
        versionText: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 18,
          color: colors.textTertiary,
          textAlign: 'center',
          marginBottom: 8,
        },
      }),
    [colors, contactVariant],
  );
}
