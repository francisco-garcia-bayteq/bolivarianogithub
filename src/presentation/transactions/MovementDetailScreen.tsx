import React, {useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path} from 'react-native-svg';
import type {MovementsStackParamList} from '../../navigation/MovementsStackNavigator';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';
import {formatCurrency} from './TransactionItem';
import {accountMovementToTransferDataResume} from './accountMovementToTransferDataResume';
import {
  TransferVoucherShareableCard
} from "../../features/transfer/presentation/components/TransferVoucherShareableCard.tsx";
import {useTransferVoucherCaptureShare} from "../../features/transfer/presentation/useTransferVoucherCaptureShare.ts";

type Nav = NativeStackNavigationProp<
  MovementsStackParamList,
  'MovementDetail'
>;

function formatDetailDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  const capitalized = d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
}

function WalletIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
      />
    </Svg>
  );
}

function PersonIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </Svg>
  );
}

function BackIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
      />
    </Svg>
  );
}

function ShareIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
      />
    </Svg>
  );
}

export function MovementDetailScreen() {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<MovementsStackParamList, 'MovementDetail'>>();
  const {movement: m} = route.params;

  const styles = useStyles(colors);

  const incoming = m.amount > 0;
  const amountColor = incoming ? colors.success : colors.textPrimary;
  const amountPrefix = incoming ? '' : '-';

  const desdeSubtitle = useMemo(() => {
    const parts = [m.accountTypeLabel, m.accountNumber].filter(Boolean);
    return parts.join(' ');
  }, [m.accountNumber, m.accountTypeLabel]);

  const paraSubtitle = useMemo(() => {
    const parts = [m.beneficiaryAccountTypeLabel, m.beneficiaryAccountNumber].filter(
      Boolean,
    );
    const joined = parts.join(' ').trim();
    return joined || '—';
  }, [m.beneficiaryAccountNumber, m.beneficiaryAccountTypeLabel]);

  const canShareTransferVoucher =
    m.transactionType === 'SentTransfers' && m.allowedShared;

  const voucherDisplayDate = useMemo(
    () => formatDetailDate(m.transferDate),
    [m.transferDate],
  );

  const transferResume = useMemo(
    () => accountMovementToTransferDataResume(m, voucherDisplayDate),
    [m, voucherDisplayDate],
  );

  const {viewShotRef, shareVoucher} = useTransferVoucherCaptureShare();

  const onShareVoucher = useCallback(() => {
    shareVoucher().catch(() => {});
  }, [shareVoucher]);

  const conceptDisplay = useMemo(() => {
    const c = m.concept?.trim();
    return c || '—';
  }, [m.concept]);

  const onReport = useCallback(() => {
    Alert.alert(
      'Reportar movimiento',
      'Esta opción estará disponible próximamente.',
    );
  }, []);

  return (
    <View
      testID="movement-detail-screen"
      style={[styles.root, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Volver">
          <BackIcon color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DETALLE DEL MOVIMIENTO</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={[styles.amount, {color: amountColor}]}>
            {amountPrefix}
            {formatCurrency(Math.abs(m.amount))}
          </Text>

          <View style={styles.partyRow}>
            <View style={styles.iconWrap}>
              <WalletIcon color={colors.primary} />
            </View>
            <View style={styles.partyText}>
              <Text style={styles.partyLabel}>Desde</Text>
              <Text style={styles.partyName}>{m.ownerAccountLabel}</Text>
              <Text style={styles.partySub}>{desdeSubtitle}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.partyRow}>
            <View style={styles.iconWrap}>
              <PersonIcon color={colors.primary} />
            </View>
            <View style={styles.partyText}>
              <Text style={styles.partyLabel}>Para</Text>
              <Text style={styles.partyName}>{m.beneficiaryName}</Text>
              <Text style={styles.partySub}>{paraSubtitle}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Comisión</Text>
            <Text style={styles.detailValue}>Sin cargo</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha</Text>
            <Text style={styles.detailValue}>
              {formatDetailDate(m.transferDate)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Saldo después del movimiento
            </Text>
            <Text style={styles.detailValue}>
              {formatCurrency(m.balanceAfterTransaction)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipo de operación</Text>
            <Text style={styles.detailValue}>{m.transactionTypeLabel}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Concepto</Text>
            <Text style={styles.detailValue}>{conceptDisplay}</Text>
          </View>
        </View>

        {canShareTransferVoucher ? (
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={onShareVoucher}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Compartir comprobante">
            <Text style={styles.shareBtnText}>Compartir</Text>
            <ShareIcon color={colors.white} />
          </TouchableOpacity>
        ) : null}

        <Text style={styles.reportWrap}>
          <Text style={styles.reportMuted}>
            ¿No reconoces este movimiento?{' '}
          </Text>
          <Text
            style={styles.reportLink}
            onPress={onReport}
            accessibilityRole="link">
            Reportar
          </Text>
        </Text>
      </ScrollView>

      {canShareTransferVoucher ? (
        <View
          pointerEvents="none"
          style={styles.offscreenCapture}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <ViewShot ref={viewShotRef} options={{format: 'png', quality: 1}}>
            <TransferVoucherShareableCard transferResume={transferResume} />
          </ViewShot>
        </View>
      ) : null}
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
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.white,
        },
        headerTitle: {
          flex: 1,
          textAlign: 'center',
          fontFamily: Lexend.semiBold,
          fontSize: 13,
          letterSpacing: 0.5,
          color: colors.textPrimary,
        },
        headerSpacer: {
          width: 24,
        },
        scroll: {
          paddingHorizontal: 20,
          paddingBottom: 32,
        },
        card: {
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 20,
          marginTop: 8,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 3,
            },
          }),
        },
        amount: {
          fontFamily: Lexend.bold,
          fontSize: 32,
          marginBottom: 24,
          textAlign: 'center',
        },
        partyRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 14,
        },
        iconWrap: {
          width: 48,
          height: 48,
          borderRadius: 10,
          backgroundColor: colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
        },
        partyText: {
          flex: 1,
          minWidth: 0,
        },
        partyLabel: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          color: colors.textTertiary,
          marginBottom: 4,
        },
        partyName: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          color: colors.textPrimary,
        },
        partySub: {
          fontFamily: Lexend.regular,
          fontSize: 13,
          color: colors.textTertiary,
          marginTop: 4,
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.borderLight,
          marginVertical: 16,
        },
        detailRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          paddingVertical: 4,
        },
        detailLabel: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.textPrimary,
        },
        detailValue: {
          flexShrink: 0,
          maxWidth: '55%',
          textAlign: 'right',
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          color: colors.primary,
        },
        shareBtn: {
          marginTop: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 12,
        },
        shareBtnText: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          color: colors.white,
        },
        reportWrap: {
          marginTop: 20,
          textAlign: 'center',
        },
        reportMuted: {
          fontFamily: Lexend.regular,
          fontSize: 13,
          color: colors.textTertiary,
        },
        reportLink: {
          fontFamily: Lexend.semiBold,
          fontSize: 13,
          color: colors.linkPrimary,
          textDecorationLine: 'underline',
        },
        offscreenCapture: {
          position: 'absolute',
          left: -3000,
          top: 0,
          width: 400,
          opacity: 1,
        },
      }),
    [colors],
  );
}
