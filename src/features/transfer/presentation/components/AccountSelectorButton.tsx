import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import type {AccountBalance} from '../../../../domain/entities/ContractBalance';
import {ThemeColors, useTheme} from '../../../../providers';
import {Lexend} from '../../../../theme/lexend';
import {buildTransferSharedStyles} from './transferSharedStyles';
import ArrowBack from '../../../../../assets/images/svg/arrow-transfer.svg';
import WalletTransfer from '../../../../../assets/images/svg/walletransfer.svg';
import UserTransferIcon from '../../../../../assets/images/svg/user_transfer.svg';
export type AccountSelectorVariant = 'from' | 'to';

interface AccountSelectorButtonProps {
  variant: AccountSelectorVariant;
  onPress: () => void;
  accounts: AccountBalance[];
  selectedAccount: AccountBalance | null;
  origin: string;
  name: string;
  description: string;
  balanceLabel?: string;
}

export function AccountSelectorButton({
  variant,
  origin,
  name,
  description,
  balanceLabel,
  onPress,
  accounts,
  selectedAccount,
}: Readonly<AccountSelectorButtonProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const showDescription =
    variant === 'from' ? Boolean(selectedAccount && description) : Boolean(description);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        onPress();
      }}
      activeOpacity={accounts.length > 1 ? 0.9 : 1}
      disabled={accounts.length <= 1}>
      <View style={styles.iconChip}>
        {variant === 'from' ? (
          <WalletTransfer color={colors.primary}  />
        ) : (
          <UserTransferIcon color={colors.primary}  />
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardLabel}>{origin}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {name}
        </Text>
        {showDescription ? (
          <Text style={styles.cardSub} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
      {variant === 'from' ? (
        <View style={styles.trailingFrom}>
          <Text style={styles.balanceText}>{balanceLabel ?? ''}</Text>
          {accounts.length > 1 ? (
            <View >
              <ArrowBack color={colors.iconPrimary}  />
            </View>
          ) : (
            <View style={styles.cardChevronSpacer} />
          )}
        </View>
      ) : (
        <View style={styles.trailingTo}>
          <Text style={styles.balanceText}>{balanceLabel ?? ''}</Text>
          {accounts.length > 1 ? (
            <ArrowBack color={colors.iconPrimary}  />
          ) : (
            <View style={styles.cardChevronSpacer} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        ...buildTransferSharedStyles(colors),
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          backgroundColor: colors.white,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 16,
          minHeight: 74,
        },
        cardLabel: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textTertiary,
        },
        cardTitle: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textSecondary,
        },
        trailingFrom: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        },
        balanceText: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
        },
        trailingTo: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        },
        cardChevronSpacer: {
          width: 16,
          height: 16,
        },
      }),
    [colors],
  );
}
