import {Modal, Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import {ThemeColors, useTheme} from '../../../../providers';
import React, {useMemo} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CardAccountItem} from '../components/CardAccountItem.tsx';
import type {BeneficiaryOption} from '../transferTypes';
import {Lexend} from '../../../../theme/lexend';
import {TransactionHeaderInformation} from '../components/TransactionHeaderInformation.tsx';
import {CardViewContainer} from '../components/CardViewContainer.tsx';
import {buildTransferSharedStyles} from '../components/transferSharedStyles';
import {VoucherConceptRow} from '../components/VoucherConceptRow.tsx';

interface TransferModalSuccessProps {
    visible: boolean;
    onClose: () => void;
    navigateToHome: () => void;
    navigateToTransfer: () => void;
    openVoucher: () => void;
    transactionData: TransferDataResume;
}

export interface TransferDataResume {
    amountCents: string;
    displayAmount: string;
    beneficiary: BeneficiaryOption;
    fromHolderName: string;
    fromAccountLine: string;
    accountId: string;
    concept: string;
    transactionIdentifier: string;
    voucherDisplayDate?: string;
    toAccountSubtitle: string;
    toAccountTitle: string;
    fromAccountTitle:string;
    fromAccountSubtitle:string;
}

export const TransferModalSuccess = ({
                                         visible,
                                         onClose,
                                         navigateToTransfer,
                                         navigateToHome,
                                         transactionData,
                                         openVoucher,
                                     }: TransferModalSuccessProps) => {
    const {colors} = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useStyles(colors);
    const showConcept =
        transactionData.concept != null && transactionData.concept.trim() !== '';

    return (
        <Modal
            transparent
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}>
            <View style={styles.modalRoot}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar"
                />
                <View
                    style={[
                        styles.sheet,
                        {paddingBottom: Math.max(insets.bottom, 12)},
                    ]}
                    testID="transfer-success-modal">
                    <View style={styles.sheetInner}>
                        <CardViewContainer>
                            <TransactionHeaderInformation transferResume={transactionData}/>
                            <View style={styles.accountsBlock}>
                                <CardAccountItem
                                    origin="Desde"
                                    accountType={transactionData.fromHolderName}
                                    name={transactionData.fromAccountLine}
                                    showBottomBorder
                                    icon="wallet"
                                />
                                <CardAccountItem
                                    origin="Hacia"
                                    accountType={transactionData.beneficiary.name}
                                    name={transactionData.beneficiary.accountHint ?? ''}
                                    icon="user"
                                />
                            </View>
                            {showConcept ? (
                                <VoucherConceptRow concept={transactionData.concept.trim()}/>
                            ) : null}
                        </CardViewContainer>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={navigateToTransfer}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel="Nueva transferencia">
                                <Text style={styles.primaryButtonText}>Nueva transferencia</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.tertiaryButton}
                                onPress={openVoucher}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel="Voucher"
                                testID="transfer-voucher-button">
                                <Text style={styles.tertiaryButtonText}>Voucher</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.tertiaryButton}
                                onPress={navigateToHome}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel="Ir al inicio">
                                <Text style={styles.tertiaryButtonText}>Ir al inicio</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

function useStyles(colors: ThemeColors) {
    return useMemo(() => {
        const shared = buildTransferSharedStyles(colors);
        return StyleSheet.create({
                modalRoot: {
                    flex: 1,
                    justifyContent: 'flex-end',
                },
                backdrop: {
                    ...StyleSheet.absoluteFill,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                },
                sheet: {
                    backgroundColor: colors.background,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    paddingTop: 24,
                    maxWidth: '100%',
                    alignSelf: 'stretch',
                },
                sheetInner: {
                    gap: 24,
                    alignItems: 'center',
                    paddingHorizontal: 24,
                },
                accountsBlock: {
                    width: '100%',
                },
                buttonContainer: {
                    width: '100%',
                    maxWidth: 312,
                    gap: 12,
                    alignItems: 'center',
                },
                primaryButton: {
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    height: 54,
                    width: '100%',
                    maxWidth: 312,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 16,
                },
                primaryButtonText: shared.primaryCtaText,
                tertiaryButton: {
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    borderRadius: 8,
                    width: 261,
                    alignItems: 'center',
                },
                tertiaryButtonText: {
                    fontFamily: Lexend.semiBold,
                    fontSize: 14,
                    lineHeight: 22,
                    color: colors.linkPrimary,
                },
            });
    }, [colors]);
}
