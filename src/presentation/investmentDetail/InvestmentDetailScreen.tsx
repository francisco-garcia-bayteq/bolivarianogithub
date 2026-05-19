import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { InvestmentDetail } from '../../domain/entities/InvestmentDetail';
import type { HomeStackParamList } from '../../navigation/HomeStackNavigator';
import { useTheme, type ThemeColors } from '../../providers/theme';
import {Lexend} from '../../theme/lexend';
import {formatIsoDateShortEsEc, formatPercentEsMx} from '../../utils/formatLocale';
import {formatCurrency} from '../transactions/TransactionItem';
import {
  DevelopmentNoticeModal,
  EyeIcon,
  EyeSlashIcon,
  HomeStackDetailHeader,
} from '../components';
import {useInvestmentDetailViewModel} from './useInvestmentDetailViewModel';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'InvestmentDetail'>;

const EMPTY_PROGRESS_METRICS = {
  paidPct: 0,
  secondaryPct: 0,
  thumbLeftPct: 0,
  termMonths: 0,
} as const;

function getInvestmentDetailProgressMetrics(detail: InvestmentDetail | null) {
  if (!detail) {
    return {...EMPTY_PROGRESS_METRICS};
  }

  const paidPct = Math.min(100, Math.max(0, detail.paidProgressRatio * 100));
  const secondaryPct = Math.min(
    paidPct,
    Math.max(0, detail.secondaryProgressRatio * 100),
  );
  const thumbLeftPct = detail.paidProgressRatio * 100;
  const termMonths = Math.max(1, Math.round(detail.termDays / 30));

  return { paidPct, secondaryPct, thumbLeftPct, termMonths };
}

function ListUlIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
      />
    </Svg>
  );
}

export function InvestmentDetailScreen() {
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<HomeStackParamList, 'InvestmentDetail'>>();
  const { investmentGuid, investmentBalance } = route.params;

  const { detail, isLoading, errorMessage } = useInvestmentDetailViewModel(
    investmentGuid,
    investmentBalance,
  );

  const [amountMasked, setAmountMasked] = useState(true);
  const [devModalVisible, setDevModalVisible] = useState(false);
  const openDetailsDev = useCallback(() => setDevModalVisible(true), []);
  const closeDevModal = useCallback(() => setDevModalVisible(false), []);

  const headerTitle = useMemo(() => 'INVERSIONES', []);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const showLoading = isLoading && !detail;
  const showError = !showLoading && (Boolean(errorMessage) || !detail);
  const resolvedDetail = !showLoading && !showError ? detail : null;

  const progressMetrics = useMemo(
    () => getInvestmentDetailProgressMetrics(resolvedDetail),
    [resolvedDetail],
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
      testID="investment-detail-screen"
    >
      <HomeStackDetailHeader title={headerTitle} onPressBack={goBack} />

      {showLoading ? (
        <InvestmentDetailLoading colors={colors} styles={styles} />
      ) : null}

      {showError ? (
        <InvestmentDetailError
          errorMessage={errorMessage}
          onBack={goBack}
          styles={styles}
        />
      ) : null}

      {resolvedDetail ? (
        <InvestmentDetailLoadedContent
          detail={resolvedDetail}
          amountMasked={amountMasked}
          onToggleAmountMasked={() => setAmountMasked(m => !m)}
          paidPct={progressMetrics.paidPct}
          secondaryPct={progressMetrics.secondaryPct}
          thumbLeftPct={progressMetrics.thumbLeftPct}
          termMonths={progressMetrics.termMonths}
          colors={colors}
          styles={styles}
          onOpenDetailsDev={openDetailsDev}
          devModalVisible={devModalVisible}
          onCloseDevModal={closeDevModal}
        />
      ) : null}
    </SafeAreaView>
  );
}

function InvestmentDetailLoading({
  colors,
  styles,
}: Readonly<{
  colors: ThemeColors;
  styles: Pick<ReturnType<typeof useStyles>, 'centered'>;
}>) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
}

function InvestmentDetailError({
  errorMessage,
  onBack,
  styles,
}: Readonly<{
  errorMessage: string;
  onBack: () => void;
  styles: Pick<
    ReturnType<typeof useStyles>,
    'centered' | 'errorInline' | 'retryLink'
  >;
}>) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorInline}>
        {errorMessage || 'No se encontró la información de esta inversión.'}
      </Text>
      <TouchableOpacity onPress={onBack} accessibilityRole="button">
        <Text style={styles.retryLink}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

function InvestmentDetailLoadedContent({
  detail: d,
  amountMasked,
  onToggleAmountMasked,
  paidPct,
  secondaryPct,
  thumbLeftPct,
  termMonths,
  colors,
  styles,
  onOpenDetailsDev,
  devModalVisible,
  onCloseDevModal,
}: Readonly<{
  detail: InvestmentDetail;
  amountMasked: boolean;
  onToggleAmountMasked: () => void;
  paidPct: number;
  secondaryPct: number;
  thumbLeftPct: number;
  termMonths: number;
  colors: ThemeColors;
  styles: ReturnType<typeof useStyles>;
  onOpenDetailsDev: () => void;
  devModalVisible: boolean;
  onCloseDevModal: () => void;
}>) {
  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[
            colors.homeInvestmentCardGradientStart,
            colors.homeInvestmentCardGradientEnd,
          ]}
          start={{ x: 0.08, y: 1 }}
          end={{ x: 0.95, y: 0 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroInner}>
            <View style={styles.heroTitleBlock}>
              <Text style={styles.heroProductMuted} numberOfLines={2}>
                {d.productName}
              </Text>
              <Text style={styles.heroLoanLine} numberOfLines={2}>
                Nº {d.maskedAccountNumber}
              </Text>
            </View>

            <View style={styles.heroBalanceRow}>
              <View style={styles.heroBalanceSide} />
              <View style={styles.heroAmountCol}>
                <Text style={styles.heroAmount} numberOfLines={1}>
                  {amountMasked
                    ? '$**.**'
                    : formatCurrency(d.totalToReceive)}
                </Text>
                <Text style={styles.heroNextPay}>
                  Vence: {formatIsoDateShortEsEc(d.maturityDateIso)}
                </Text>
              </View>
              <View style={styles.heroBalanceSideEnd}>
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={onToggleAmountMasked}
                  accessibilityRole="button"
                  accessibilityLabel={
                    amountMasked ? 'Mostrar monto' : 'Ocultar monto'
                  }
                >
                  {amountMasked ? (
                    <EyeSlashIcon color={colors.primary} size={16} />
                  ) : (
                    <EyeIcon color={colors.primary} size={16} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.periodInterestBlock}>
              <Text style={styles.periodInterestCaption}>
                Interés del periodo{' '}
                {formatIsoDateShortEsEc(d.nextPaymentDateIso)}:
              </Text>
              <Text style={styles.periodInterestAmount}>
                {amountMasked
                  ? '$**.**'
                  : formatCurrency(d.interestAtMaturity)}
              </Text>
            </View>

            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    styles.progressFillWide,
                    {
                      width: `${paidPct}%`,
                      backgroundColor: colors.homeAvatarCircle,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.progressFill,
                    styles.progressFillTop,
                    {
                      width: `${secondaryPct}%`,
                      backgroundColor: colors.homePrimaryHover,
                    },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.progressThumb,
                  {
                    left: `${thumbLeftPct}%`,
                    borderColor: colors.homePrimaryHover,
                    backgroundColor: colors.homeAvatarCircle,
                    transform: [{ translateX: -8 }],
                  },
                ]}
              />
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownCol}>
                <Text style={styles.breakdownAmount}>
                  {formatCurrency(d.initialAmount)}
                </Text>
                <Text style={styles.breakdownLabel}>Capital inicial</Text>
              </View>
              <View style={styles.breakdownColCenter}>
                <Text style={styles.breakdownCuotasMain}>
                  {d.installmentsPaid}/{d.installmentsTotal}
                </Text>
                <Text style={styles.breakdownCuotasSub}>cuotas</Text>
              </View>
              <View style={[styles.breakdownCol, styles.breakdownColEnd]}>
                <Text style={styles.breakdownAmount}>
                  {formatCurrency(d.totalToReceive)}
                </Text>
                <Text style={styles.breakdownLabel}>Total a recibir</Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.debtRow}>
              <View>
                <Text style={styles.breakdownAmount}>
                  {termMonths} meses
                </Text>
                <Text style={styles.breakdownLabel}>Plazo</Text>
              </View>
              <View style={styles.interestPeriodCol}>
                <Text style={styles.breakdownAmount}>
                  {formatCurrency(d.interestAtMaturity)}
                </Text>
                <Text style={styles.breakdownLabel}>Interés ganado</Text>
                <Text style={styles.breakdownLabel}>al vencimiento</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.lowerSection}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {formatIsoDateShortEsEc(d.openingDateIso)}
              </Text>
              <Text style={styles.statLabel}>Fecha de apertura</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValueStrong}>
                {formatPercentEsMx(d.interestRatePercent, 1)}
              </Text>
              <Text style={styles.statLabel}>Tasa</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {formatIsoDateShortEsEc(d.maturityDateIso)}
              </Text>
              <Text style={styles.statLabel}>Fecha de vencimiento</Text>
            </View>
          </View>

          <View style={styles.debitCard}>
            <Text style={styles.debitPurpose}>{d.debitPurposeLabel}</Text>
            <Text style={styles.debitAccount}>{d.maskedDebitAccount}</Text>
            <Text style={styles.debitCaption}>Cuenta a acreditar</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onOpenDetailsDev}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Ver detalles"
          >
            <Text style={styles.primaryBtnText}>Ver detalles</Text>
            <ListUlIcon color={colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DevelopmentNoticeModal
        visible={devModalVisible}
        onClose={onCloseDevModal}
        title="En desarrollo"
        message="Esta sección estará disponible próximamente."
      />
    </>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        safe: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scroll: {
          flex: 1,
        },
        scrollContent: {
          paddingBottom: 32,
        },
        centered: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        },
        errorInline: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.textTertiary,
          textAlign: 'center',
          marginBottom: 12,
        },
        retryLink: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          color: colors.primary,
        },
        heroGradient: {
          width: '100%',
        },
        heroInner: {
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 28,
          gap: 18,
        },
        heroTitleBlock: {
          gap: 4,
          alignSelf: 'stretch',
        },
        heroProductMuted: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 20,
          color: colors.homeAvatarCircle,
          opacity: 0.85,
        },
        heroLoanLine: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 20,
          color: colors.white,
        },
        heroBalanceRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
        },
        heroBalanceSide: {
          flex: 1,
        },
        heroAmountCol: {
          alignItems: 'center',
          gap: 4,
        },
        heroBalanceSideEnd: {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        },
        heroAmount: {
          fontFamily: Lexend.bold,
          fontSize: 30,
          lineHeight: 40,
          color: colors.white,
          textAlign: 'center',
        },
        heroNextPay: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.homeAvatarCircle,
          opacity: 0.85,
          textAlign: 'center',
        },
        eyeBtn: {
          backgroundColor: colors.homeBalanceToggleBg,
          borderRadius: 4,
          padding: 4,
        },
        periodInterestBlock: {
          alignItems: 'center',
          alignSelf: 'stretch',
        },
        periodInterestCaption: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.buttonSecondaryBg,
          textAlign: 'center',
        },
        periodInterestAmount: {
          fontFamily: Lexend.bold,
          fontSize: 22,
          lineHeight: 32,
          color: colors.homeAvatarCircle,
          textAlign: 'center',
        },
        progressWrap: {
          marginTop: 4,
          position: 'relative',
          height: 12,
          justifyContent: 'center',
        },
        progressTrack: {
          height: 12,
          borderRadius: 6,
          backgroundColor: colors.homeBorderSoft,
          overflow: 'hidden',
          position: 'relative',
        },
        progressFill: {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          borderRadius: 6,
        },
        progressFillWide: {
          zIndex: 1,
        },
        progressFillTop: {
          zIndex: 2,
        },
        progressThumb: {
          position: 'absolute',
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 2,
          top: -2,
          zIndex: 3,
        },
        breakdownRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        },
        breakdownCol: {
          flex: 1,
        },
        breakdownColEnd: {
          alignItems: 'flex-end',
        },
        breakdownColCenter: {
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: 4,
        },
        breakdownAmount: {
          fontFamily: Lexend.semiBold,
          fontSize: 12,
          lineHeight: 20,
          color: colors.homeAvatarCircle,
        },
        breakdownLabel: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.buttonSecondaryBg,
        },
        breakdownCuotasMain: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 13,
          color: colors.homeAvatarCircle,
          opacity: 0.85,
          textAlign: 'center',
        },
        breakdownCuotasSub: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 13,
          color: colors.homeAvatarCircle,
          opacity: 0.85,
          textAlign: 'center',
        },
        heroDivider: {
          height: 1,
          backgroundColor: colors.balanceDivider,
          alignSelf: 'stretch',
        },
        debtRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        interestPeriodCol: {
          alignItems: 'flex-end',
        },
        lowerSection: {
          paddingHorizontal: 24,
          paddingTop: 16,
          gap: 16,
        },
        statRow: {
          flexDirection: 'row',
          gap: 12,
          alignItems: 'stretch',
        },
        statCard: {
          flex: 1,
          minHeight: 54,
          backgroundColor: colors.white,
          borderRadius: 8,
          paddingHorizontal: 7,
          paddingTop: 8,
          paddingBottom: 4,
          justifyContent: 'center',
          alignItems: 'center',
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowSoft,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.12,
              shadowRadius: 2,
            },
            android: {
              elevation: 2,
            },
          }),
        },
        statValue: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.primary,
          textAlign: 'center',
        },
        statValueStrong: {
          fontFamily: Lexend.semiBold,
          fontSize: 12,
          lineHeight: 20,
          color: colors.primary,
          textAlign: 'center',
        },
        statLabel: {
          fontFamily: Lexend.regular,
          fontSize: 8,
          lineHeight: 20,
          color: colors.textPrimary,
          textAlign: 'center',
        },
        debitCard: {
          backgroundColor: colors.white,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          alignItems: 'center',
          gap: 4,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowSoft,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            },
            android: {
              elevation: 2,
            },
          }),
        },
        debitPurpose: {
          fontFamily: Lexend.semiBold,
          fontSize: 12,
          lineHeight: 20,
          color: colors.primary,
        },
        debitAccount: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textTertiary,
        },
        debitCaption: {
          fontFamily: Lexend.regular,
          fontSize: 8,
          lineHeight: 20,
          color: colors.textPrimary,
        },
        primaryBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backgroundColor: colors.primary,
          borderRadius: 8,
          paddingVertical: 14,
          paddingHorizontal: 16,
          minHeight: 48,
        },
        primaryBtnText: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.white,
        },
      }),
    [colors],
  );
}
