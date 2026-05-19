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
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';
import {formatIsoDateShortEsEc, formatPercentEsMx} from '../../utils/formatLocale';
import {formatCurrency} from '../transactions/TransactionItem';
import {
  DevelopmentNoticeModal,
  EyeIcon,
  EyeSlashIcon,
  HomeStackDetailHeader,
} from '../components';
import {useLoanDetailViewModel} from './useLoanDetailViewModel';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'LoanDetail'>;

type DevModalKind = 'payments' | 'amortization' | null;

function HistoryClockIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"
      />
    </Svg>
  );
}

export function LoanDetailScreen() {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<HomeStackParamList, 'LoanDetail'>>();
  const {loanGuid, loanBalance} = route.params;

  const {detail, isLoading, errorMessage} = useLoanDetailViewModel(
    loanGuid,
    loanBalance,
  );

  const [amountMasked, setAmountMasked] = useState(true);
  const [devModal, setDevModal] = useState<DevModalKind>(null);

  const openPaymentsDev = useCallback(() => setDevModal('payments'), []);
  const openAmortizationDev = useCallback(() => setDevModal('amortization'), []);
  const closeDev = useCallback(() => setDevModal(null), []);

  const headerTitle = useMemo(() => 'PRÉSTAMOS', []);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const showLoading = isLoading && !detail;
  const showError = !showLoading && (Boolean(errorMessage) || !detail);
  const resolvedDetail = !showLoading && !showError ? detail : null;

  const paidPct = resolvedDetail
    ? Math.min(100, Math.max(0, resolvedDetail.primaryProgressRatio * 100))
    : 0;
  const secondaryPct = resolvedDetail
    ? Math.min(
        paidPct,
        Math.max(0, resolvedDetail.secondaryProgressRatio * 100),
      )
    : 0;

  const d = resolvedDetail;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top']}
      testID="loan-detail-screen">
      <HomeStackDetailHeader title={headerTitle} onPressBack={goBack} />

      {showLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : null}

      {showError ? (
        <View style={styles.centered}>
          <Text style={styles.errorInline}>
            {errorMessage || 'No se encontró la información de este préstamo.'}
          </Text>
          <TouchableOpacity
            onPress={goBack}
            accessibilityRole="button">
            <Text style={styles.retryLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {d ? (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={[colors.homeHeaderIconButtonBg, colors.homeHeaderBackground]}
              start={{x: 0.08, y: 1}}
              end={{x: 0.95, y: 0}}
              style={styles.heroGradient}>
              <View style={styles.heroInner}>
                <View style={styles.heroTitleBlock}>
                  <Text style={styles.heroProductMuted} numberOfLines={2}>
                    {d.productLabel}
                  </Text>
                  <Text style={styles.heroLoanLine} numberOfLines={2}>
                    Préstamo Nº {d.maskedAccountNumber}
                  </Text>
                </View>

                <View style={styles.heroBalanceRow}>
                  <View style={styles.heroBalanceSide} />
                  <View style={styles.heroAmountCol}>
                    <Text style={styles.heroAmount} numberOfLines={1}>
                      {amountMasked
                        ? '$**.**'
                        : formatCurrency(d.outstandingBalance)}
                    </Text>
                    <Text style={styles.heroNextPay}>
                      Próximo pago:{' '}
                      {formatIsoDateShortEsEc(d.nextInstallmentDate)}
                    </Text>
                  </View>
                  <View style={styles.heroBalanceSideEnd}>
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setAmountMasked(m => !m)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        amountMasked ? 'Mostrar monto' : 'Ocultar monto'
                      }>
                      {amountMasked ? (
                        <EyeSlashIcon color={colors.primary} size={16} />
                      ) : (
                        <EyeIcon color={colors.primary} size={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

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

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownCol}>
                    <Text style={styles.breakdownAmount}>
                      {formatCurrency(d.capitalPaid)}
                    </Text>
                    <Text style={styles.breakdownLabel}>Pagado</Text>
                  </View>
                  <View style={styles.breakdownColCenter}>
                    <Text style={styles.breakdownCuotasMain}>
                      {d.installmentIndex}/{d.installmentTotal}
                    </Text>
                    <Text style={styles.breakdownCuotasSub}>cuotas</Text>
                  </View>
                  <View style={[styles.breakdownCol, styles.breakdownColEnd]}>
                    <Text style={styles.breakdownAmount}>
                      {formatCurrency(d.outstandingBalance)}
                    </Text>
                    <Text style={styles.breakdownLabel}>Por pagar</Text>
                  </View>
                </View>

                <View style={styles.heroDivider} />

                <View style={styles.debtRow}>
                  <View>
                    <Text style={styles.breakdownAmount}>
                      {formatCurrency(d.amountGranted)}
                    </Text>
                    <Text style={styles.breakdownLabel}>Deuda inicial</Text>
                  </View>
                  <View style={styles.breakdownColEnd}>
                    <Text style={styles.breakdownAmount}>
                      {formatCurrency(d.totalToReceiveAmount)}
                    </Text>
                    <Text style={styles.breakdownLabel}>Deuda total</Text>
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
                  <Text style={styles.statLabel}>Fecha solicitada</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValueStrong}>
                    {formatPercentEsMx(d.interestRatePercent, 2)}
                  </Text>
                  <Text style={styles.statLabel}>Tasa vigente</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {formatIsoDateShortEsEc(d.maturityDateIso)}
                  </Text>
                  <Text style={styles.statLabel}>Fecha vencimiento</Text>
                </View>
              </View>

              <View style={styles.debitCard}>
                <Text style={styles.debitPurpose}>{d.creditPurposeLabel}</Text>
                <Text style={styles.debitAccount}>{d.maskedCreditAccount}</Text>
                <Text style={styles.debitCaption}>Cuenta a debitar</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={openPaymentsDev}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Historial de pagos">
                <Text style={styles.primaryBtnText}>Historial de pagos</Text>
                <HistoryClockIcon color={colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={openAmortizationDev}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Tabla de amortización">
                <Text style={styles.secondaryBtnText}>
                  Tabla de amortización
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <DevelopmentNoticeModal
            visible={devModal === 'payments'}
            onClose={closeDev}
            title="En desarrollo"
            message="El historial de pagos estará disponible próximamente."
          />
          <DevelopmentNoticeModal
            visible={devModal === 'amortization'}
            onClose={closeDev}
            title="En desarrollo"
            message="La tabla de amortización estará disponible próximamente."
          />
        </>
      ) : null}
    </SafeAreaView>
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
              shadowOffset: {width: 0, height: 1},
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
              shadowOffset: {width: 0, height: 1},
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
        secondaryBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.primary,
          borderRadius: 8,
          paddingVertical: 14,
          paddingHorizontal: 16,
          minHeight: 48,
          backgroundColor: colors.white,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowSoft,
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.15,
              shadowRadius: 4,
            },
            android: {
              elevation: 3,
            },
          }),
        },
        secondaryBtnText: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.primary,
        },
      }),
    [colors],
  );
}
