import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {TransferStackParamList} from '../../navigation/TransferStackNavigator';
import type {MainTabParamList} from '../../../../navigation/MainTabNavigator';
import {useTheme, type ThemeColors} from '../../../../providers';
import {Lexend} from '../../../../theme/lexend';
import {ErrorMessage} from '../../../../presentation/components';
import {
    TransferIconArrowsRetweet,
} from '../components/transferIcons.tsx';
import {useTransferReviewViewModel} from './useTransferReviewViewModel';
import {ToolbarApp} from '../components/ToolbarApp.tsx';
import {buildTransferSharedStyles} from '../components/transferSharedStyles';
import {
    TransferModalSuccess,
    type TransferDataResume,
} from '../transferResult/TransferModalSuccess.tsx';

import WalletTransfer from '../../../../../assets/images/svg/walletransfer.svg';
import UserTransferIcon from '../../../../../assets/images/svg/user_transfer.svg';

export function TransferReviewScreen() {
    const {colors} = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useStyles(colors);

    const navigation = useNavigation<
        NativeStackNavigationProp<TransferStackParamList, 'TransferReview'>
    >();

    const router = useRoute<RouteProp<TransferStackParamList, 'TransferReview'>>();

    const [showTransferSuccessModal, setShowTransferSuccessModal] =
        useState(false);
    const [successTransactionData, setSuccessTransactionData] =
        useState<TransferDataResume | null>(null);

    const resetTransferSuccessUi = useCallback(() => {
        setShowTransferSuccessModal(false);
        setSuccessTransactionData(null);
    }, []);

    const goToHomeTab = useCallback(() => {
        navigation.popToTop();
        const tabNav =
            navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
        tabNav?.navigate({
            name: 'Home',
            params: {
                screen: 'HomeMain',
                params: {refreshHome: Date.now()},
            },
        });
    }, [navigation]);

    const onTransferSuccess = useCallback((data: TransferDataResume) => {
        setSuccessTransactionData(data);
        resetTransferSuccessUi();
        navigation.navigate('TransferVoucher', {
            routeSuccessTransactionData: data,
        });
    }, [navigation, resetTransferSuccessUi]);

    const {
        displayAmount,
        fromAccountTitle,
        fromAccountSubtitle,
        fromBalanceDisplay,
        toBalanceDisplay,
        commissionLoading,
        commissionDisplay,
        confirmLoading,
        confirmError,
        setConfirmError,
        conceptDisplay,
        onConfirm,
        doTransacction,
        toAccountSubtitle,
        toAccountTitle
    } = useTransferReviewViewModel(
        () => {
            navigation.navigate('OtpValidationTransfer', {
                mode: 'transfer',
                email: '',
            });
        },
        {onTransferSuccess},
    );

    useEffect(() => {
        if (router.params?.resultFromOtp?.otpValidated) {
            navigation.setParams({resultFromOtp: undefined});
            doTransacction().catch();
        }
    }, [doTransacction, navigation, router.params?.resultFromOtp]);

    return (
        <View style={styles.root} testID="transfer-review-screen">
            <ToolbarApp
                title="REVISAR TRANSFERENCIA"
                onBackPress={() => {
                    navigation.goBack();
                }}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    {paddingBottom: Math.max(insets.bottom, 24) + 16},
                ]}
                showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <Text style={styles.amountLabel}>Monto a enviar</Text>
                    <Text style={styles.amountValue} numberOfLines={1}>
                        {displayAmount}
                    </Text>

                    <View style={styles.immediateBanner}>
                        <Text style={styles.immediateBannerText}>
                            La transferencia se realizará de inmediato
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.desdeRow}
                        onPress={() => {
                            navigation.goBack();
                        }}
                        activeOpacity={0.88}
                        accessibilityRole="button"
                        accessibilityLabel="Volver para cambiar cuenta de origen">
                        <View style={styles.iconChip}>
                            <WalletTransfer color={colors.primary}  />
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.desdeLabel}>Desde</Text>
                            <Text style={styles.rowAccountName} numberOfLines={1}>
                                {fromAccountTitle}
                            </Text>
                            <Text style={styles.cardSub} numberOfLines={1}>
                                {fromAccountSubtitle}
                            </Text>
                        </View>
                        <Text style={styles.balanceInline}>{fromBalanceDisplay}</Text>
                    </TouchableOpacity>

                    <View style={styles.paraRow}>
                        <View style={styles.iconChip}>
                            <UserTransferIcon color={colors.primary} />
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.haciaLabel}>Hacia</Text>
                            <Text style={styles.rowAccountName} numberOfLines={2}>
                                {toAccountTitle}
                            </Text>
                            {toAccountSubtitle ? (
                                <Text style={styles.cardSub} numberOfLines={2}>
                                    {toAccountSubtitle}
                                </Text>
                            ) : null}
                        </View>
                        <Text style={styles.balanceInline}>{toBalanceDisplay}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Concepto</Text>
                        <Text style={[styles.detailValue, styles.conceptValue]}>
                            {conceptDisplay}
                        </Text>
                    </View>
                    <View style={[styles.detailRow, styles.detailRowLast]}>
                        <Text style={styles.detailLabel}>Comisión</Text>
                        {commissionLoading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Text style={styles.detailValue}>{commissionDisplay}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.actions}>
                    {confirmError ? (
                        <ErrorMessage
                            message={confirmError}
                            style={styles.confirmError}
                        />
                    ) : null}
                    <TouchableOpacity
                        style={[
                            styles.primaryCta,
                            confirmLoading && styles.primaryCtaDisabled,
                        ]}
                        onPress={() => {
                            setConfirmError(null);
                            onConfirm().catch(() => {});
                        }}
                        disabled={confirmLoading}
                        activeOpacity={0.9}
                        accessibilityRole="button"
                        accessibilityLabel="Transferir"
                        testID="transfer-confirm-button">
                        {confirmLoading ? (
                            <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                            <>
                                <Text style={styles.primaryCtaText}>Transferir</Text>
                                <TransferIconArrowsRetweet
                                    color={colors.white}
                                    size={20}
                                />
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryCta}
                        onPress={() => {
                            navigation.goBack();
                        }}
                        activeOpacity={0.88}
                        accessibilityRole="button"
                        accessibilityLabel="Cancelar transferencia"
                        testID="transfer-modify-button">
                        <Text style={styles.secondaryCtaText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {successTransactionData ? (
                <TransferModalSuccess
                    openVoucher={() => {
                        resetTransferSuccessUi();
                        navigation.navigate('TransferVoucher', {
                            routeSuccessTransactionData: successTransactionData,
                        });
                    }}
                    transactionData={successTransactionData}
                    visible={showTransferSuccessModal}
                    onClose={() => {
                        resetTransferSuccessUi();
                        navigation.reset({
                            index: 0,
                            routes: [{name: 'TransferMain'}],
                        });
                    }}
                    navigateToTransfer={() => {
                        resetTransferSuccessUi();
                        navigation.reset({
                            index: 0,
                            routes: [{name: 'TransferMain'}],
                        });
                    }}
                    navigateToHome={() => {
                        resetTransferSuccessUi();
                        goToHomeTab();
                    }}
                />
            ) : null}
        </View>
    );
}

function useStyles(colors: ThemeColors) {
    return useMemo(() => {
        const shared = buildTransferSharedStyles(colors);
        return StyleSheet.create({
                ...shared,
                scrollContent: {
                    paddingHorizontal: 24,
                    paddingTop: 32,
                    alignItems: 'center',
                    gap: 24,
                },
                card: {
                    width: '100%',
                    maxWidth: 672,
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    padding: 12,
                    gap: 12,
                },
                amountLabel: {
                    fontFamily: Lexend.semiBold,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    alignSelf: 'stretch',
                },
                amountValue: {
                    fontFamily: Lexend.regular,
                    fontSize: 50,
                    lineHeight: 60,
                    color: colors.textPrimary,
                    textAlign: 'center',
                    alignSelf: 'stretch',
                },
                immediateBanner: {
                    alignSelf: 'stretch',
                    backgroundColor: colors.primaryIconContainerBg,
                    borderRadius: 12,
                    paddingHorizontal: 4,
                    paddingVertical: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                immediateBannerText: {
                    fontFamily: Lexend.regular,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textSecondary,
                    textAlign: 'center',
                },
                paraRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 16,
                    borderRadius: 12,
                },
                haciaLabel: {
                    fontFamily: Lexend.regular,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textSecondary,
                },
                desdeLabel: {
                    fontFamily: Lexend.regular,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textTertiary,
                },
                rowAccountName: {
                    fontFamily: Lexend.regular,
                    fontSize: 14,
                    lineHeight: 22,
                    color: colors.textSecondary,
                },
                balanceInline: {
                    fontFamily: Lexend.regular,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textSecondary,
                    flexShrink: 0,
                },
                desdeRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 16,
                    borderRadius: 12,
                },
                detailRow: {
                    ...shared.detailRowLayout,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.borderLight,
                },
                actions: {
                    width: '100%',
                    maxWidth: 672,
                    gap: 12,
                    alignItems: 'center',
                },
                confirmError: {
                    alignSelf: 'stretch',
                },
                primaryCta: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    minHeight: 48,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    width: '100%',
                    ...Platform.select({
                        ios: {
                            shadowColor: colors.shadowSoft,
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 1,
                            shadowRadius: 4,
                        },
                        android: {elevation: 2},
                        default: {},
                    }),
                },
                primaryCtaDisabled: {
                    opacity: 0.7,
                },
                secondaryCta: {
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    minWidth: 164,
                    alignItems: 'center',
                },
                secondaryCtaText: {
                    fontFamily: Lexend.semiBold,
                    fontSize: 14,
                    lineHeight: 22,
                    color: colors.primary,
                },
            });
    }, [colors]);
}
