import {Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity,Text, View,Platform} from "react-native";
import {TransferIconClose} from "./components/transferIcons.tsx";
import React, {useMemo} from 'react';
import type {AccountBalance} from '../../../domain/entities/ContractBalance';
import {ThemeColors, useTheme} from '../../../providers';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lexend} from '../../../theme/lexend';
import {formatMoneyUsdDisplay} from '../../../utils/formatMoneyUsdDisplay';
import {buildTransferSharedStyles} from './components/transferSharedStyles';

export type AccountPickerRole = 'source' | 'destination';

interface AccountBeneficiarySelectorModalProps {
    accounts: AccountBalance[];
    visible: boolean;
    onClose: () => void;
    accountIndexSelected: number;
    selectAccount: (selectedId: number) => void;
    /** Origen: no permite cuenta sin saldo. Destino: permite saldo 0. */
    pickerRole?: AccountPickerRole;
}

export const AccountBeneficiarySelectorModal = ({
    accounts,
    accountIndexSelected,
    selectAccount,
    visible,
    onClose,
    pickerRole = 'source',
}: AccountBeneficiarySelectorModalProps) => {
    const {colors} = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useStyles(colors);

    return(
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => onClose()}>
            <View style={styles.modalRoot}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => onClose()}
                    accessibilityLabel="Cerrar"
                />
                <View
                    style={[
                        styles.modalSheet,
                        {paddingBottom: Math.max(insets.bottom, 12)},
                    ]}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderSide}/>
                        <Text style={styles.modalHeaderTitle}>CUENTAS</Text>
                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => onClose()}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar selección de cuentas">
                            <TransferIconClose color={colors.iconPrimary} size={20}/>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        scrollEnabled={accounts.length > 4}
                        contentContainerStyle={styles.modalListContent}>
                        {accounts.map((item, index) => {
                            const isSelected = index === accountIndexSelected;
                            const isDisabled =
                                pickerRole === 'source' && item.balance <= 0;
                            return (
                                <TouchableOpacity
                                    key={item.accountGuid}
                                    style={[
                                        styles.accountPickCard,
                                        isSelected &&
                                        !isDisabled &&
                                        styles.accountPickCardSelected,
                                        isDisabled && styles.accountPickCardDisabled,
                                    ]}
                                    onPress={() => selectAccount(index)}
                                    activeOpacity={isDisabled ? 1 : 0.88}
                                    disabled={isDisabled}
                                    accessibilityState={{
                                        selected: isSelected && !isDisabled,
                                        disabled: isDisabled,
                                    }}>
                                    <View
                                        style={[
                                            styles.accountPickRow,
                                            isDisabled && styles.accountPickRowDisabled,
                                        ]}>
                                        <View style={styles.accountPickLeft}>
                                            <Text style={styles.accountPickType}>
                                                {item.accountTypeLabel}
                                            </Text>
                                            <Text style={styles.accountPickNumber}>
                                                {`${item.accountTypeLabel} ${item.maskedAccountNumber}`}
                                            </Text>
                                        </View>
                                        <View style={styles.accountPickRight}>
                                            <Text style={styles.accountPickBalance}>
                                                {formatMoneyUsdDisplay(item.balance)}
                                            </Text>
                                            <Text style={styles.accountPickSaldoLabel}>
                                                Saldo disponible
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}
function useStyles(colors: ThemeColors) {
    return useMemo(() => {
        const shared = buildTransferSharedStyles(colors);
        return StyleSheet.create({
                ...shared,
                header: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 64,
                    paddingHorizontal: 16,
                    backgroundColor: colors.white,
                },
                scrollContent: {
                    flexGrow: 1,
                },
                heroHint: {
                    fontFamily: Lexend.regular,
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: 'center',
                    marginBottom: 8,
                },
                amountWrap: {
                    alignSelf: 'center',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.white,
                    marginBottom: 24,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    minWidth: 200,
                },
                amountFieldError: {
                    marginTop: 8,
                    fontFamily: Lexend.regular,
                    fontSize: 13,
                    lineHeight: 18,
                    color: '#FFB8B8',
                    textAlign: 'center',
                    alignSelf: 'center',
                    maxWidth: 280,
                },
                amountInput: {
                    fontFamily: Lexend.bold,
                    fontSize: 50,
                    lineHeight: 60,
                    textAlign: 'center',
                    paddingVertical: 0,
                    minHeight: 70,
                    ...(Platform.OS === 'android' ? {textAlignVertical: 'center'} : null),
                },
                card: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 16,
                    marginBottom: 16,
                },
                cardLabel: {
                    fontFamily: Lexend.regular,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textTertiary,
                },
                cardTitle: {
                    fontFamily: Lexend.semiBold,
                    fontSize: 14,
                    lineHeight: 22,
                    color: colors.textPrimary,
                },
                cardChevronSpacer: {
                    width: 16,
                    height: 16,
                },
                conceptInputError: {
                    borderColor: colors.error,
                },
                primaryCta: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    paddingVertical: 16,
                },
                modalRoot: {
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: 'rgba(0,0,0,0.45)',
                },
                modalSheet: {
                    backgroundColor: colors.background,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    maxHeight: '78%',
                    width: '100%',
                    zIndex: 1,
                    ...Platform.select({
                        android: {elevation: 24},
                        default: {},
                    }),
                },
                modalHeader: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    minHeight: 64,
                    backgroundColor: colors.surface,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    paddingHorizontal: 8,
                },
                modalHeaderSide: {
                    width: 44,
                    height: 44,
                },
                modalHeaderTitle: {
                    flex: 1,
                    fontFamily: Lexend.regular,
                    fontSize: 14,
                    lineHeight: 22,
                    color: colors.iconPrimary,
                    textAlign: 'center',
                },
                modalCloseBtn: {
                    width: 44,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                modalListContent: {
                    paddingHorizontal: 24,
                    paddingTop: 24,
                    paddingBottom: 12,
                    gap: 12,
                },
                accountPickCard: {
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                },
                accountPickCardSelected: {
                    backgroundColor: colors.primaryIconContainerBg,
                    borderWidth: 1,
                    borderColor: colors.primary,
                },
                accountPickCardDisabled: {
                    backgroundColor: colors.buttonSecondaryBg,
                },
                accountPickRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                },
                accountPickRowDisabled: {
                    opacity: 0.4,
                },
                accountPickLeft: {
                    flex: 1,
                    minWidth: 0,
                    marginRight: 12,
                },
                accountPickType: {
                    fontFamily: Lexend.semiBold,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textPrimary,
                },
                accountPickNumber: {
                    fontFamily: Lexend.regular,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textTertiary,
                },
                accountPickRight: {
                    alignItems: 'flex-end',
                },
                accountPickBalance: {
                    fontFamily: Lexend.regular,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textPrimary,
                    textAlign: 'right',
                },
                accountPickSaldoLabel: {
                    fontFamily: Lexend.regular,
                    fontSize: 12,
                    lineHeight: 20,
                    color: colors.textTertiary,
                    textAlign: 'right',
                },
            });
    }, [colors]);
}
