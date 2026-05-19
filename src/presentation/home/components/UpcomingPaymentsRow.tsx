import React, {useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import type {UpcomingPaymentsSummary} from '../homeDashboardMocks';
import {CreditCardOutlineIcon} from './HomeIcons';

type Props = {
  summary: UpcomingPaymentsSummary;
  onPress?: () => void;
};

export function UpcomingPaymentsRow({summary, onPress}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${summary.summaryLine}. ${summary.amountLabel}`}>
      <View style={styles.iconCircle}>
        <CreditCardOutlineIcon color={colors.homeLink} size={24} />
      </View>
      <View style={styles.centerBlock}>
        <Text style={styles.summary}>{summary.summaryLine}</Text>
        <Text style={styles.link}>{summary.linkLabel}</Text>
      </View>
      <View style={styles.rightBlock}>
        <Text style={styles.amount}>{summary.amountLabel}</Text>    
      </View>
    </TouchableOpacity>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: colors.surface,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 14,         
          borderWidth: 2,
          borderColor: colors.border,
        },
        iconCircle: {
          width: 44,
          height: 44,
          borderRadius: 28,
          backgroundColor: colors.nextPayCircleBg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        centerBlock: {
          flex: 1,
          gap: 2,
        },
        summary: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textBlack,
        },
        link: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 16,
          color: colors.homeLink,    
        },
        rightBlock: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        amount: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textPrimary,
        },
      }),
    [colors],
  );
}
