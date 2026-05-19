import {Text, View, StyleSheet} from 'react-native';
import {ThemeColors, useTheme} from '../../../../providers';
import React, {useMemo} from 'react';
import {Lexend} from '../../../../theme/lexend';
import {buildTransferSharedStyles} from './transferSharedStyles';
import WalletTransfer from '../../../../../assets/images/svg/walletransfer.svg';
import UserTransferIcon from '../../../../../assets/images/svg/user_transfer.svg';
interface CardAccountItemProps {
  origin: string;
  accountType?: string;
  name: string;
  showBottomBorder?: boolean;
  icon?: 'wallet' | 'user';
}

export function CardAccountItem({
  origin,
  accountType = '',
  name,
  showBottomBorder = false,
  icon = 'wallet',
}: Readonly<CardAccountItemProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const IconComponent = icon === 'user' ? UserTransferIcon : WalletTransfer;

  return (
    <View
      style={[
        styles.cardItem,
        showBottomBorder && styles.cardItemWithBottomBorder,
      ]}>
      <View style={styles.iconChip}>
        <IconComponent color={colors.primary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.label}>{origin}</Text>
        <Text style={styles.accountName}>{accountType}</Text>
        <Text style={styles.maskOrName}>{name}</Text>
      </View>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        ...buildTransferSharedStyles(colors),
        cardItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          paddingHorizontal: 12,
          paddingVertical: 16,
        },
        cardItemWithBottomBorder: {
          borderBottomWidth: 1,
          borderBottomColor: colors.buttonSecondaryBg,
        },
        label: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
        },
        accountName: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textSecondary,
        },
        maskOrName: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textTertiary,
        },
      }),
    [colors],
  );
}
