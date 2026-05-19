import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
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
import {formatCurrency} from '../transactions/TransactionItem';
import {DevelopmentNoticeModal} from '../components';
import {useCardDetailViewModel} from './useCardDetailViewModel';
import type {CardSpendingCategoryMock} from './cardDetailMocks';

const CARD_BANNER_BG = require('../../../assets/images/card_banner_background.png');

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CardDetail'>;

/** Misma familia de iconos que `TransactionsScreen` (movimientos). */
function BackIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
      />
    </Svg>
  );
}

function ChevronDownIcon({
  color,
  width,
  height,
}: Readonly<{
  color: string;
  width: number;
  height: number;
}>) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M17.2428 7.40683L10.6075 13.7644C10.3853 13.9519 10.177 14.0283 9.99988 14.0283C9.8228 14.0283 9.58426 13.9512 9.42384 13.796L2.75726 7.40683C2.42407 7.09086 2.41324 6.53184 2.73226 6.22976C3.0491 5.89556 3.57878 5.88469 3.90968 6.20481L9.99988 12.0422L16.0901 6.20893C16.4199 5.88883 16.9505 5.89969 17.2675 6.23388C17.5866 6.53184 17.5762 7.09086 17.2428 7.40683Z"
      />
    </Svg>
  );
}

function ChevronRightIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={28} height={26} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M11.7487 5.74915L7.4628 10.0351C7.29672 10.2038 7.07706 10.2869 6.85741 10.2869C6.63776 10.2869 6.41864 10.2031 6.25149 10.0357C5.91665 9.70089 5.91665 9.15845 6.25149 8.82361L9.07537 6.00094H0.857139C0.383814 6.00094 0 5.61789 0 5.14376C0 4.66963 0.383814 4.28658 0.857139 4.28658H9.07537L6.25203 1.46324C5.91719 1.1284 5.91719 0.585964 6.25203 0.251127C6.58686 -0.0837092 7.1293 -0.0837092 7.46414 0.251127L11.75 4.53704C12.0835 4.87321 12.0835 5.41431 11.7487 5.74915Z"
      />
    </Svg>
  );
}

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

function resolveCategoryColor(
  colors: ThemeColors,
  token: CardSpendingCategoryMock['colorToken'],
): string {
  if (token === 'primary') {
    return colors.primary;
  }
  if (token === 'chartAccent') {
    return colors.chartAccent;
  }
  return colors.primaryLight;
}

function CreditCardPayIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M4 9a2 2 0 012-2h12a2 2 0 012 2v1H4V9zm0 3h16v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7zm3 3.25h4v1.5H7v-1.5z"
      />
    </Svg>
  );
}

function CalendarDeferIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M7 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v2H4V6a2 2 0 012-2h1V3a1 1 0 011-1zm12 8H5v9a1 1 0 001 1h12a1 1 0 001-1v-9zm-6 2h2v2h-2v-2z"
      />
    </Svg>
  );
}

function StatementIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8.828a2 2 0 00-.586-1.414l-4.828-4.828A2 2 0 0013.172 2H6zm8 1.5L18.5 8H14a1 1 0 01-1-1V3.5zM8 12h8v1.5H8V12zm0 3h8V17H8v-2z"
      />
    </Svg>
  );
}

function CashAdvanceIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M4 4h16v4H4V4zm0 6h16v10H4V10zm3 2v6h10v-6H7zm2 2h6v2H9v-2z"
      />
    </Svg>
  );
}

function EyeIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
      />
    </Svg>
  );
}

function EyeSlashIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-2.76-2.24-5-5-5l-.17.01z"
      />
    </Svg>
  );
}

export function CardDetailScreen() {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useStyles(colors);
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<HomeStackParamList, 'CardDetail'>>();
  const {maskedCardNumber} = route.params;

  const {
    resolved,
    isLoading,
    errorMessage,
    consumptions,
    
  } = useCardDetailViewModel(maskedCardNumber);

  const [balanceMasked, setBalanceMasked] = useState(true);
  const [devModalVisible, setDevModalVisible] = useState(false);

  const openDev = useCallback(() => setDevModalVisible(true), []);


  const topBar = useMemo(
    () => (
      <View
        style={[styles.topBar, {paddingTop: insets.top, height: insets.top + 64}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Volver">
          <BackIcon color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>TARJETA</Text>
        <View style={styles.topBarSpacer} />
      </View>
    ),
    [colors.textBlack, insets.top, navigation, styles.topBar, styles.topBarSpacer, styles.topBarTitle],
  );

  if (isLoading && !resolved) {
    return (
      <View style={styles.root} testID="card-detail-screen">
        {topBar}
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (errorMessage || !resolved) {
    return (
      <View style={styles.root} testID="card-detail-screen">
        {topBar}
        <View style={styles.centered}>
          <Text style={styles.errorInline}>
            {errorMessage || 'No se encontró la información de esta tarjeta.'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
            <Text style={styles.retryLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const {card, approvedLimit, utilized, available, utilizationRatio} = resolved;
  const totalConsumptions = consumptions.length;

  return (
    <View style={styles.root} testID="card-detail-screen">
      {topBar}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={CARD_BANNER_BG}
          style={styles.bannerSection}
          resizeMode="cover">
          <View style={styles.heroContentPad}>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroTitleBlock}>
                  <Text style={styles.heroLabel}>Tarjeta</Text>
                  <Text style={styles.heroMasked}>{card.maskedCardNumber}</Text>
                </View>
                <View style={styles.heroBrandRow}>
                  <View style={styles.mcMark} accessibilityLabel="Marca de tarjeta">
                    <View style={[styles.mcCircle, styles.mcCircleRed]} />
                    <View style={[styles.mcCircle, styles.mcCircleOrange]} />
                  </View>
                  <TouchableOpacity
                    onPress={openDev}
                    accessibilityRole="button"
                    accessibilityLabel="Seleccionar tarjeta">
                    <ChevronDownIcon color={colors.white} width={24} height={24} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.heroBalanceRow}>
                <View style={styles.heroAmountBlock}>
                  <View style={styles.amountAndPill}>
                    <Text style={styles.heroAmount} numberOfLines={1}>
                      {balanceMasked ? '$**.**' : formatCurrency(card.totalDue)}
                    </Text>
                    <View style={styles.duePill}>
                      <Text style={styles.duePillText}>
                        {formatShortDueDate(card.maxPaymentDate)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.totalDueCaption}>Total a pagar</Text>
                </View>
                <TouchableOpacity
                  style={styles.eyeWrap}
                  onPress={() => setBalanceMasked(m => !m)}
                  accessibilityRole="button"
                  accessibilityLabel={balanceMasked ? 'Mostrar saldo' : 'Ocultar saldo'}>
                  {balanceMasked ? (
                    <EyeSlashIcon color={colors.white} />
                  ) : (
                    <EyeIcon color={colors.white} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.creditCardWrap}>
          <Text style={styles.creditApproved}>
            Cupo aprobado: {formatCurrency(approvedLimit)}
          </Text>
          <View style={styles.creditRow}>
            <Text style={styles.creditMuted}>
              Utilizado:{' '}
              <Text style={styles.creditStrong}>{formatCurrency(utilized)}</Text>
            </Text>
            <Text style={styles.creditMuted}>
              Disponible:{' '}
              <Text style={styles.creditStrong}>{formatCurrency(available)}</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, {width: `${utilizationRatio * 100}%`}]}
            />
          </View>
        </View>

        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={openDev}
            accessibilityRole="button"
            accessibilityLabel="Pagar tarjeta">
            <CreditCardPayIcon color={colors.primary} />
            <Text style={styles.quickLabel}>Pagar tarjeta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={openDev}
            accessibilityRole="button"
            accessibilityLabel="Diferir consumos">
            <CalendarDeferIcon color={colors.primary} />
            <Text style={styles.quickLabel}>Diferir consumos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={openDev}
            accessibilityRole="button"
            accessibilityLabel="Estado de cuenta">
            <StatementIcon color={colors.primary} />
            <Text style={styles.quickLabel}>Estado de cuenta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={openDev}
            accessibilityRole="button"
            accessibilityLabel="Avances">
            <CashAdvanceIcon color={colors.primary} />
            <Text style={styles.quickLabel}>Avances</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>Detalle de consumos</Text>

        {consumptions.map((row, index) => {
          const isFirst = index === 0;
          const isLast = index === totalConsumptions - 1;
          const isAbono = row.amount < 0;
          const amountColor = isAbono ? colors.success : colors.textSecondary;
          const displayAbs = formatCurrency(Math.abs(row.amount));
          const amountText = isAbono ? `+${displayAbs}` : formatCurrency(row.amount);

          return (
            <Pressable
              key={`${row.merchant}-${row.day}-${index}`}
              style={({pressed}) => [
                styles.movRow,
                isFirst && styles.movRowFirst,
                isLast && styles.movRowLast,
                !isLast && styles.movRowDivider,
                pressed && styles.movRowPressed,
              ]}
              onPress={openDev}
              accessibilityRole="button"
              accessibilityLabel={`Consumo ${row.merchant}`}>
              <View style={styles.movDateCol}>
                <Text style={styles.movDay}>{row.day}</Text>
                <Text style={styles.movMonth}>{row.monthLabel}</Text>
              </View>
              <View style={styles.movCenter}>
                <Text style={styles.movName} numberOfLines={1}>
                  {row.merchant}
                </Text>
                <Text style={styles.movSub} numberOfLines={1}>
                  Tarjeta de crédito
                </Text>
              </View>
              <View style={styles.movRight}>
                <Text style={[styles.movAmount, {color: amountColor}]}>{amountText}</Text>
              </View>
              <ChevronRightIcon color={colors.textBlack} />
            </Pressable>
          );
        })}      
      </ScrollView>

      <DevelopmentNoticeModal
        visible={devModalVisible}
        onClose={() => setDevModalVisible(false)}
      />
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scroll: {
          flex: 1,
        },
        scrollContent: {
          paddingBottom: 32,
        },
        topBar: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          backgroundColor: colors.white,
          paddingHorizontal: 24,
          paddingBottom: 16,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        topBarTitle: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          letterSpacing: 1,
          color: colors.textPrimary,
        },
        topBarSpacer: {
          width: 22,
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
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 12,
        },
        retryLink: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          color: colors.linkPrimary,
        },
        bannerSection: {
          width: '100%',
          alignSelf: 'stretch',
          minHeight: 180,
        },
        heroContentPad: {
          width: '100%',
          paddingHorizontal: 24,
          paddingTop: 4,
          paddingBottom: 2,
        },
        heroCard: {
          borderRadius: 12,
          paddingTop: 24,
          backgroundColor: 'transparent',
        },
        heroTopRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        heroTitleBlock: {
          flex: 1,
          minWidth: 0,
        },
        heroLabel: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.white,
          opacity: 0.7,
        },
        heroMasked: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.white,
          marginTop: 2,
        },
        heroBrandRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        mcMark: {
          flexDirection: 'row',
          alignItems: 'center',
          width: 36,
          height: 22,
          justifyContent: 'center',
        },
        mcCircle: {
          width: 18,
          height: 18,
          borderRadius: 9,
        },
        mcCircleRed: {
          backgroundColor: colors.error,
          marginRight: -8,
          zIndex: 1,
        },
        mcCircleOrange: {
          backgroundColor: colors.warning,
          opacity: 0.95,
        },
        heroBalanceRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: 20,
        },
        heroAmountBlock: {
          flex: 1,
          minWidth: 0,
        },
        amountAndPill: {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        },
        heroAmount: {
          fontFamily: Lexend.bold,
          fontSize: 30,
          lineHeight: 40,
          color: colors.white,
        },
        duePill: {
          borderWidth: 0.8,
          borderColor: colors.textTertiary,
          borderRadius: 4,
          paddingHorizontal: 6,
          paddingVertical: 2,
        },
        duePillText: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.white,
        },
        totalDueCaption: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.white,
          opacity: 0.7,
          marginTop: 4,
        },
        eyeWrap: {
          backgroundColor: colors.textTertiary,
          borderRadius: 4,
          padding: 6,
        },
        creditCardWrap: {
          backgroundColor: colors.white,
          marginHorizontal: 24,
          marginTop: 16,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
        },
        creditApproved: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textTertiary,
        },
        creditRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 4,
        },
        creditMuted: {
          fontFamily: Lexend.regular,
          fontSize: 10,
          lineHeight: 20,
          color: colors.textTertiary,
        },
        creditStrong: {
          fontFamily: Lexend.semiBold,
          fontSize: 10,
          color: colors.textPrimary,
        },
        progressTrack: {
          height: 6,
          borderRadius: 4,
          backgroundColor: colors.borderSubtle,
          marginTop: 8,
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          borderRadius: 4,
          backgroundColor: colors.primary,
        },
        quickRow: {
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
          backgroundColor: colors.background,
        },
        quickCard: {
          flex: 1,
          backgroundColor: colors.white,
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 4,
          alignItems: 'center',
          gap: 4,
        },
        quickLabel: {
          fontFamily: Lexend.regular,
          fontSize: 9,
          color: colors.textPrimary,
          textAlign: 'center',
        },
        sectionHeading: {
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 24,
          color: colors.textPrimary,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 8,
        },
        movRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.white,
          marginHorizontal: 24,
          paddingHorizontal: 8,
          paddingVertical: 12,
          gap: 8,
        },
        movRowFirst: {
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        },
        movRowLast: {
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          marginBottom: 8,
        },
        movRowDivider: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        movRowPressed: {
          opacity: 0.88,
        },
        movDateCol: {
          width: 34,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 4,
        },
        movDay: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 24,
          color: colors.primary,
          textAlign: 'right',
        },
        movMonth: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textTertiary,
          textAlign: 'center',
        },
        movCenter: {
          flex: 1,
          minWidth: 0,
          gap: 2,
        },
        movName: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textTertiary,
        },
        movSub: {
          fontFamily: Lexend.regular,
          fontSize: 13,
          lineHeight: 18,
          color: colors.textTertiary,
        },
        movRight: {
          alignItems: 'flex-end',
          gap: 2,
        },
        movAmount: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          textAlign: 'right',
        },
        chartCard: {
          backgroundColor: colors.white,
          marginHorizontal: 24,
          marginTop: 16,
          marginBottom: 8,
          borderRadius: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
        },
        chartTitle: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textPrimary,
          marginBottom: 12,
        },
        chartLegend: {
          gap: 10,
          marginTop: 16,
        },
        legendRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        legendDot: {
          width: 9,
          height: 9,
          borderRadius: 5,
          flexShrink: 0,
        },
        legendLabel: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
        },
        legendAmount: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
          textAlign: 'right',
        },
      }),
    [colors],
  );
}
