import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path} from 'react-native-svg';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import {EyeIcon, EyeSlashIcon} from '../../components';
import {formatCurrency} from '../../transactions/TransactionItem';

function formatShortDueDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return `hasta ${d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  })}`;
}

/** Máscara tipo Figma (`137*****`) determinista por guid. */
function formatLoanMaskedLine(loanGuid: string): string {
  let h = 0;
  for (let i = 0; i < loanGuid.length; i += 1) {
    const cp = loanGuid.codePointAt(i) ?? 0;
    h = (h * 31 + cp) % 2147483647;
  }
  const n = 100 + (Math.abs(h) % 900);
  return `${String(n).padStart(3, '0').slice(0, 3)}*****`;
}

function ShareIcon({color, size = 16}: Readonly<{color: string; size?: number}>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
      />
    </Svg>
  );
}

function StarIconRelleno({color, size = 16}: Readonly<{color: string; size?: number}>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill={color}
        d="M30.3432 16.7951L40.139 18.2403C40.9502 18.3562 41.6319 18.9288 41.8909 19.7127C42.15 20.5035 41.9386 21.3624 41.3524 21.9486L34.2493 28.9154L35.9262 38.9089C36.0625 39.7269 35.7285 40.5586 35.0468 41.0426C34.372 41.5265 33.479 41.5879 32.7496 41.1993L23.9968 36.5298L15.2508 41.1993C14.5146 41.5879 13.6216 41.5265 12.9467 41.0426C12.2718 40.5586 11.931 39.7269 12.0741 38.9089L13.7511 28.9154L6.64658 21.9486C6.05965 21.3624 5.85106 20.5035 6.10873 19.7127C6.36573 18.9288 7.04536 18.3562 7.8627 18.2403L17.6503 16.7951L22.0403 7.7744C22.4016 7.02346 23.1651 6.54675 23.9968 6.54675C24.8352 6.54675 25.5987 7.02346 25.96 7.7744L30.3432 16.7951Z"
      />
    </Svg>
  );
}

function StarIconVacio({color, size = 16}: Readonly<{color: string; size?: number}>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill={color}
        d="M23.9975 36.2721L14.5998 41.2641C14.1088 41.5574 13.4404 41.5097 12.9289 41.1482C12.4243 40.7868 12.1719 40.1593 12.2129 39.5456L14.061 28.9408L6.48491 21.4254C6.04435 20.9957 5.88818 20.3478 6.08186 19.7545C6.27486 19.168 6.7843 18.7384 7.3974 18.6497L17.846 17.1016L22.5244 7.46659C22.804 6.90253 23.3701 6.54456 23.9975 6.54456C24.6249 6.54456 25.1978 6.9026 25.4705 7.46659L30.1489 17.1016L40.6037 18.6497C41.2175 18.7384 41.7221 19.168 41.9199 19.7545C42.1109 20.3478 41.954 20.9957 41.5175 21.4254L33.9339 28.9408L35.7275 39.5456C35.8298 40.1593 35.5775 40.7868 35.066 41.1482C34.5613 41.5097 33.8316 41.5574 33.3406 41.2641L23.9975 36.2721ZM18.8281 17.579C18.6712 17.9063 18.3643 18.1314 18.0097 18.186L7.55699 19.7272C7.35239 19.7545 7.18258 19.8977 7.11847 20.0955C7.05368 20.2933 7.1062 20.5115 7.25282 20.6547L14.8317 28.1019C15.084 28.4156 15.1999 28.7703 15.1386 29.1181L13.3518 39.7297C13.3108 39.9343 13.3995 40.1389 13.5086 40.2616C13.7405 40.3844 13.9587 40.398 14.1429 40.2412L23.486 35.3105C23.8065 35.14 24.1952 35.14 24.5158 35.3105L33.8521 40.2412C34.0362 40.398 34.2613 40.3844 34.4318 40.2616C34.6023 40.1389 34.6841 39.9343 34.65 39.7297L32.8632 29.1181C32.7405 28.7703 32.9178 28.4156 33.1701 28.1019L40.7469 20.6547C40.8901 20.5047 40.9447 20.2933 40.8833 20.0955C40.8151 19.8977 40.6446 19.7545 40.44 19.7272L29.9921 18.186C29.6374 18.1314 29.3237 17.9063 29.1669 17.579L24.4885 7.9433C24.3998 7.75507 24.1475 7.57435 23.9975 7.57435C23.7929 7.57435 23.6019 7.75507 23.5064 7.9433L18.8281 17.579Z"
      />
    </Svg>
  );
}

type SavingsCardProps = {
  style?: StyleProp<ViewStyle>;
  title?: string;
  maskedAccountNumber: string;
  balance: number;
  isFirst?: boolean;
};

export function SavingsAccountCard({
  style,
  title,
  maskedAccountNumber,
  balance,
  isFirst = false,
}: Readonly<SavingsCardProps>) {
  const {colors} = useTheme();
  const styles = useSavingsStyles(colors);
  const [masked, setMasked] = useState(true);
  const iconTint = colors.primary;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.titleCol}>
          <Text style={styles.title}>{title}</Text>
          
          <Text style={styles.subtitle}>{maskedAccountNumber}</Text>
        </View>
        <View style={styles.topRowActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              isFirst ? 'Cuenta favorita' : 'Marcar como favorita'
            }>
            {isFirst ? (
              <StarIconRelleno color={colors.homeStarIcon} size={22} />
            ) : (
              <StarIconVacio color={colors.homeStarIcon} size={22} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Compartir">
            <ShareIcon color={colors.textSecondary} size={18} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.balanceCol}>
          <Text style={styles.balanceValue} numberOfLines={1}>
            {masked ? '$**.**' : formatCurrency(balance)}
          </Text>
          <Text style={styles.balanceLabel}>Saldo</Text>
        </View>
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setMasked(m => !m)}
          accessibilityRole="button"
          accessibilityLabel={masked ? 'Mostrar saldo' : 'Ocultar saldo'}>
          {masked ? (
            <EyeSlashIcon color={iconTint} size={18} />
          ) : (
            <EyeIcon color={iconTint} size={18} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function useSavingsStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          padding: 12,
          borderRadius: 8,
          backgroundColor: colors.homeProductCardSurface,
          borderWidth: 1,
          borderColor: colors.homeProductCardBorder,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowSoft,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 12,

            },
          }),

        },
        topRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        titleCol: {
          flex: 1,
          minWidth: 0,
          paddingRight: 8,
        },
        topRowActions: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        title: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 22,
          color: colors.primary,
        },
        subtitle: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
          marginTop: 2,
        },
        bottomRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: 8,
        },
        balanceCol: {
          flex: 1,
          minWidth: 0,
        },
        balanceLabel: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 16,
          color: colors.primary,
          marginTop: 2,
        },
        balanceValue: {
          fontFamily: Lexend.semiBold,
          fontSize: 22,
          lineHeight: 28,
          color: colors.textPrimary,
        },
        eyeBtn: {
          backgroundColor: colors.homeBalanceToggleBg,
          borderRadius: 4,
          padding: 6,
        },
      }),
    [colors],
  );
}

type CheckingCardProps = {
  style?: StyleProp<ViewStyle>;
  title?: string;
  maskedAccountNumber: string;
  balance: number;
  isFirst?: boolean;
};

export function CheckingAccountCard({
  style,
  title = 'Cta. corriente',
  maskedAccountNumber,
  balance,
  isFirst = false,
}: Readonly<CheckingCardProps>) {
  return (
    <SavingsAccountCard
      style={style}
      title={title}
      maskedAccountNumber={maskedAccountNumber}
      balance={balance}
      isFirst={isFirst}
    />
  );
}

type CreditCardPreviewProps = {
  style?: StyleProp<ViewStyle>;
  maskedCardNumber: string;
  totalDue: number;
  maxPaymentDate: string;
};

export function CreditCardPreview({
  style,
  maskedCardNumber,
  totalDue,
  maxPaymentDate,
}: Readonly<CreditCardPreviewProps>) {
  const {colors} = useTheme();
  const styles = useCreditStyles(colors);
  const [masked, setMasked] = useState(true);

  return (
    <View style={[styles.cardOuter, style]} accessibilityLabel="Tarjeta de crédito">
      <LinearGradient
        colors={[
          colors.homeCreditCardGradientTop,
          colors.homeCreditCardGradientBottom,
        ]}
        style={styles.cardGradientFill}
      />
      <View style={styles.cardInner} pointerEvents="box-none">
        <View style={styles.cardTop}>
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>Tarjeta</Text>
            <View style={styles.mastercardBadge}>
              <View style={[styles.mcDot, styles.mcDotBack]} />
              <View style={[styles.mcDot, styles.mcDotFront]} />
            </View>
          </View>
          <Text style={styles.cardNumber}>{maskedCardNumber}</Text>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.balanceTextCol}>
            <View style={styles.amountAndDateRow}>
              <Text style={styles.amountMain} numberOfLines={1}>
                {masked ? '$**.**' : formatCurrency(totalDue)}
              </Text>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>
                  {formatShortDueDate(maxPaymentDate)}
                </Text>
              </View>
            </View>
            <Text style={styles.totalLabel}>Total a pagar</Text>
          </View>
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setMasked(m => !m)}
            accessibilityRole="button"
            accessibilityLabel={masked ? 'Mostrar total' : 'Ocultar total'}>
            {masked ? (
              <EyeSlashIcon color={colors.white} size={16} />
            ) : (
              <EyeIcon color={colors.white} size={16} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function useCreditStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        cardOuter: {
          flex: 1,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.homeCreditCardBorder,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowSoft,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 12,
            },
          }),
        },
        cardGradientFill: {
          ...StyleSheet.absoluteFill,
        },
        cardInner: {
          flex: 1,
          padding: 12,
          justifyContent: 'space-between',
        },
        cardTop: {
          gap: 0,
        },
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        cardTitle: {
          fontFamily: Lexend.semiBold,
          fontSize: 12,
          lineHeight: 20,
          color: colors.white,
        },
        mastercardBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          height: 18,
          paddingLeft: 2,
          paddingRight: 8,
          paddingVertical: 2,
          borderRadius: 3,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.05)',
          backgroundColor: 'rgba(255,255,255,0.1)',
        },
        mcDot: {
          width: 10,
          height: 10,
          borderRadius: 5,
        },
        mcDotBack: {
          backgroundColor: 'rgba(255,255,255,0.2)',
        },
        mcDotFront: {
          marginLeft: -5,
          backgroundColor: 'rgba(255,255,255,0.1)',
        },
        cardNumber: {
          marginTop: 4,
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.white,
        },
        cardBottom: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
        },
        balanceTextCol: {
          flex: 1,
          minWidth: 0,
        },
        amountAndDateRow: {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
        },
        amountMain: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 24,
          color: colors.white,
        },
        datePill: {
          borderWidth: 1,
          borderColor: colors.textTertiary,
          borderRadius: 3,
          paddingHorizontal: 3,
          paddingVertical: 1,
        },
        datePillText: {
          fontFamily: Lexend.regular,
          fontSize: 9,
          lineHeight: 16,
          color: colors.white,
        },
        totalLabel: {
          marginTop: 0,
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.white,
        },
        eyeBtn: {
          backgroundColor: colors.textTertiary,
          borderRadius: 4,
          padding: 4,
        },
      }),
    [colors],
  );
}

type LoanCardProps = {
  style?: StyleProp<ViewStyle>;
  loanGuid: string;
  nextInstallmentAmount: number;
  nextInstallmentDate: string;
};

export function LoanCard({
  style,
  loanGuid,
  nextInstallmentAmount,
  nextInstallmentDate,
}: Readonly<LoanCardProps>) {
  const {colors} = useTheme();
  const styles = useLoanStyles(colors);
  const [masked, setMasked] = useState(true);

  const maskedLine = useMemo(
    () => formatLoanMaskedLine(loanGuid),
    [loanGuid],
  );

  return (
    <View style={[styles.cardOuter, style]} accessibilityLabel="Préstamo">
      <LinearGradient
        colors={[
          colors.homeLoanCardGradientStart,
          colors.homeLoanCardGradientEnd,
      
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardGradientFill}
      />
      <View style={styles.cardInner} pointerEvents="box-none">
        <View>
          <Text style={styles.productTitle}>Préstamo</Text>
          <Text style={styles.maskedAccount}>{maskedLine}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.balanceCol}>
            <View style={styles.amountRow}>
              <Text style={styles.amountValue} numberOfLines={1}>
                {masked ? '$**.**' : formatCurrency(nextInstallmentAmount)}
              </Text>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>
                  {formatShortDueDate(nextInstallmentDate)}
                </Text>
              </View>
            </View>
            <Text style={styles.cuotaLabel}>Cuota</Text>
          </View>
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setMasked(m => !m)}
            accessibilityRole="button"
            accessibilityLabel={masked ? 'Mostrar cuota' : 'Ocultar cuota'}>
            {masked ? (
              <EyeSlashIcon color={colors.primary} size={16} />
            ) : (
              <EyeIcon color={colors.primary} size={16} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function useLoanStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        cardOuter: {
          flex: 1,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.homeLoanCarouselBorder,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowSoft,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 12,
            },
          }),
        },
        cardGradientFill: {
          ...StyleSheet.absoluteFill,
        },
        cardInner: {
          flex: 1,
          padding: 12,
          justifyContent: 'space-between',
        },
        productTitle: {
          fontFamily: Lexend.semiBold,
          fontSize: 12,
          lineHeight: 20,
          color: colors.homeAvatarCircle,
        },
        maskedAccount: {
          marginTop: 4,
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.white,
        },
        bottomRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
        },
        balanceCol: {
          flex: 1,
          minWidth: 0,
        },
        amountRow: {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
        },
        amountValue: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 24,
          color: colors.white,
        },
        datePill: {
          borderWidth: 1,
          borderColor: colors.homeAvatarCircle,
          borderRadius: 3,
          paddingHorizontal: 3,
          paddingVertical: 1,
        },
        datePillText: {
          fontFamily: Lexend.regular,
          fontSize: 9,
          lineHeight: 16,
          color: colors.white,
        },
        cuotaLabel: {
          marginTop: 0,
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.homeAvatarCircle,
        },
        eyeBtn: {
          backgroundColor: colors.homeAvatarCircle,
          borderRadius: 4,
          padding: 4,
        },
      }),
    [colors],
  );
}

type InvestmentCardProps = {
  style?: StyleProp<ViewStyle>;
  investmentGuid: string;
  productName: string;
  currentValue: number;
  currency: string;
};

export function InvestmentCard({
  style,
  investmentGuid,
  productName,
  currentValue,
  currency,
}: Readonly<InvestmentCardProps>) {
  const {colors} = useTheme();
  const styles = useInvestmentStyles(colors);
  const [masked, setMasked] = useState(true);

 

  return (
    <View style={[styles.cardOuter, style]} accessibilityLabel="Inversión">
      <LinearGradient
        colors={[
          colors.homeInvestmentCardGradientStart,
          colors.homeInvestmentCardGradientEnd,
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardGradientFill}
      />
      <View style={styles.cardInner} pointerEvents="box-none">
        <View style={styles.topBlock}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {productName}
          </Text>
          <Text style={styles.maskedAccount}>{investmentGuid}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.balanceCol}>
            <Text style={styles.amountValue} numberOfLines={1}>
              {masked
                ? '$**.**'
                : `${formatCurrency(currentValue)} ${currency}`}
            </Text>
            <Text style={styles.saldoLabel}>Saldo</Text>
          </View>
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setMasked(m => !m)}
            accessibilityRole="button"
            accessibilityLabel={masked ? 'Mostrar valor' : 'Ocultar valor'}>
            {masked ? (
              <EyeSlashIcon color={colors.primary} size={16} />
            ) : (
              <EyeIcon color={colors.primary} size={16} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function useInvestmentStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        cardOuter: {
          flex: 1,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.homeInvestmentCardBorder,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowSoft,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 12,
            },
          }),
        },
        cardGradientFill: {
          ...StyleSheet.absoluteFill,
        },
        cardInner: {
          flex: 1,
          padding: 12,
          justifyContent: 'space-between',
        },
        topBlock: {
          gap: 0,
        },
        productTitle: {
          fontFamily: Lexend.semiBold,
          fontSize: 12,
          lineHeight: 20,
          color: colors.homeAvatarCircle,
        },
        maskedAccount: {
          marginTop: 4,
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.white,
        },
        bottomRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
        },
        balanceCol: {
          flex: 1,
          minWidth: 0,
        },
        amountValue: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 24,
          color: colors.white,
        },
        saldoLabel: {
          marginTop: 0,
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.homeAvatarCircle,
        },
        eyeBtn: {
          backgroundColor: colors.nextPayCircleBg,
          borderRadius: 4,
          padding: 4,
        },
      }),
    [colors],
  );
}
