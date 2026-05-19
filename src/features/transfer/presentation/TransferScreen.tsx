import React, {useMemo, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Keyboard,
    Platform,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useTheme, type ThemeColors} from '../../../providers';
import {Lexend} from '../../../theme/lexend';
import type {TransferStackParamList} from '../navigation/TransferStackNavigator';
import type {MainTabParamList} from '../../../navigation/MainTabNavigator';
import {TransferIconArrowRightWhite} from './components/transferIcons.tsx';
import {TRANSFER_CONCEPT_MAX_LENGTH} from '../../../domain/validation';
import {useTransferViewModel} from './useTransferViewModel';
import {formatMoneyUsdDisplay} from '../../../utils/formatMoneyUsdDisplay';
import {ToolbarApp} from './components/ToolbarApp.tsx';
import {ErrorBannerComponent} from './transferInit/components/ErrorBannerComponent.tsx';
import {TertiaryLinkButton} from '../../../presentation/components';
import {Button, SpacerView} from './ui';
import {AccountBeneficiarySelectorModal} from './AccountBeneficiarySelectorModal.tsx';
import {AccountSelectorButton} from './components/AccountSelectorButton.tsx';
import {buildTransferSharedStyles} from './components/transferSharedStyles';
import AngleArrow from '../../../../assets/images/svg/angles-down.svg';

const AMOUNT_PLACEHOLDER = formatMoneyUsdDisplay(0);

const ACCOUNT_BRIDGE_SPACER_HEIGHT = 24;
const BRIDGE_CIRCLE_SIZE = 40;

export function TransferScreen() {
    const {colors} = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useStyles(colors);
    const [fromAccountBlockHeight, setFromAccountBlockHeight] = useState(0);

    const navigation = useNavigation<NativeStackNavigationProp<TransferStackParamList, 'TransferMain'>>();

    const navigationTab = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Home'>>();

    const {
        amountDisplayText,
        onAmountFocus,
        onAmountBlur,
        amountInputText,
        onAmountChange,
        amountFieldError,
        canContinueToReview,
        accounts,
        openFromAccountPicker,
        selectedFromAccount,
        fromAccountIndex,
        selectFromAccount,
        fromAccountModalVisible,
        setFromAccountModalVisible,
        concept,
        onConceptChange,
        validationMessage,
        prepareTransferReview,
        setValidationMessage,
        error,
        isLoading,
        retry,
        toAccountModalVisible,
        setToAccountModalVisible,
        toAccountIndex,
        selectToAccount,
        openToAccountPicker,
        selectedToAccount,
    } = useTransferViewModel();

    const fromAccountTitle = useMemo(
        () => selectedFromAccount?.accountTypeLabel?.trim() ?? '',
        [selectedFromAccount],
    );

    const fromAccountSubtitle = useMemo(() => {
        if (!selectedFromAccount) {
            return '';
        }
        const a = selectedFromAccount;
        return `${a.accountTypeLabel} ${a.maskedAccountNumber}`.trim();
    }, [selectedFromAccount]);

    const fromBalanceLabel = useMemo(
        () => (selectedFromAccount ? formatMoneyUsdDisplay(selectedFromAccount.balance) : ''),
        [selectedFromAccount],
    );

    const toBalanceLabel = useMemo(
        () => (selectedToAccount ? formatMoneyUsdDisplay(selectedToAccount.balance) : ''),
        [selectedToAccount],
    );

    const toAccountTitle = useMemo(
        () => selectedToAccount?.accountTypeLabel?.trim() ?? '',
        [selectedToAccount],
    );

    const toAccountSubtitle = useMemo(() => {
        if (!selectedToAccount) {
            return '';
        }
        const a = selectedToAccount;
        return `${a.accountTypeLabel} ${a.maskedAccountNumber}`.trim();
    }, [selectedToAccount]);

    const toContactName = selectedToAccount?.accountTypeLabel?.trim() ?? '';

    const toName = useMemo(() => {
        if (!selectedToAccount) {
            return 'Selecciona una cuenta de destino';
        }
        if (toContactName !== '') {
            return toContactName;
        }
        return toAccountTitle === '' ? 'Cuenta' : toAccountTitle;
    }, [selectedToAccount, toAccountTitle, toContactName]);

    const toDescription = toAccountSubtitle;

    const onBack = () => {
        const tabNav =
            navigationTab.getParent<BottomTabNavigationProp<MainTabParamList>>();
        tabNav?.navigate('Home');
    };

    const bridgeOverlayTop = useMemo(() => {
        const h =
            fromAccountBlockHeight > 0
                ? fromAccountBlockHeight
                : 74; /* AccountSelectorButton minHeight */
        return (
            h +
            ACCOUNT_BRIDGE_SPACER_HEIGHT / 2 -
            BRIDGE_CIRCLE_SIZE / 2
        );
    }, [fromAccountBlockHeight]);

    return (
        <View style={styles.root} testID="transfer-main-screen">
            <ToolbarApp
                title="TRANSFERIR"
                onBackPress={() => {
                    onBack();
                }}
            />

            {error ? (
                <ErrorBannerComponent
                    textRetry="Reintentar"
                    errorText={error}
                    onRetry={() => {
                        retry().catch();
                    }}
                />
            ) : null}

            {isLoading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={colors.primary}/>
                </View>
            ) : (
                <KeyboardAwareScrollView
                    style={styles.scroll}
                    contentContainerStyle={[
                        styles.scrollContent,
                        {paddingBottom: Math.max(insets.bottom, 24) + 16},
                    ]}
                    bottomOffset={80}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <View style={styles.hero}>
                        <View style={styles.cardsBlock}>
                            <View style={styles.accountsBridgeWrap}>
                                <View
                                    onLayout={event => {
                                        setFromAccountBlockHeight(
                                            event.nativeEvent.layout.height,
                                        );
                                    }}>
                                    <AccountSelectorButton
                                        variant="from"
                                        onPress={openFromAccountPicker}
                                        accounts={accounts}
                                        selectedAccount={selectedFromAccount}
                                        origin="Desde"
                                        name={fromAccountTitle}
                                        description={fromAccountSubtitle}
                                        balanceLabel={fromBalanceLabel}
                                    />
                                </View>
                                <SpacerView height={ACCOUNT_BRIDGE_SPACER_HEIGHT}/>
                                <AccountSelectorButton
                                    variant="to"
                                    onPress={openToAccountPicker}
                                    accounts={accounts}
                                    selectedAccount={selectedToAccount}
                                    origin="Hacia"
                                    name={toName}
                                    description={toDescription}
                                    balanceLabel={toBalanceLabel}
                                />
                                <View
                                    style={[
                                        styles.bridgeOverlay,
                                        {top: bridgeOverlayTop},
                                    ]}
                                    pointerEvents="box-none">
                                    <View style={styles.bridgeCircle}>
                                        <AngleArrow color={colors.primary}/>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <SpacerView height={19}/>
                        <Text style={styles.heroHint}>Ingresa el monto a transferir</Text>
                        <View style={styles.amountWrap}>
                            <View style={styles.amountInputRow}>
                                {amountInputText === '' ? (
                                    <View
                                        style={styles.amountPlaceholderLayer}
                                        pointerEvents="none">
                                        <Text
                                            style={[
                                                styles.amountInput,
                                                styles.amountInputPlaceholder,
                                            ]}>
                                            {AMOUNT_PLACEHOLDER}
                                        </Text>
                                    </View>
                                ) : null}
                                <TextInput
                                    style={[
                                        styles.amountInput,
                                        styles.amountInputEditable,
                                        amountInputText === ''
                                            ? styles.amountInputTextEmpty
                                            : null,
                                    ]}
                                    value={amountDisplayText ? `$${amountDisplayText}` : ''}
                                    onFocus={onAmountFocus}
                                    onBlur={onAmountBlur}
                                    onChangeText={onAmountChange}
                                    keyboardType="decimal-pad"
                                    returnKeyType="done"
                                    onSubmitEditing={() => Keyboard.dismiss()}
                                    selectionColor={colors.primary}
                                    underlineColorAndroid="transparent"
                                    accessibilityLabel="Monto a transferir"
                                    testID="transfer-amount-input"
                                />
                            </View>
                            <View style={styles.amountUnderline} />
                            {amountFieldError ? (
                                <Text style={styles.amountFieldError}>{amountFieldError}</Text>
                            ) : null}

                        </View>

                    </View>

                    <View style={styles.bottomSection}>
                        <View style={styles.conceptBlock}>
                            <Text style={styles.conceptLabel}>
                                <Text style={styles.conceptLabelStrong}>Concepto </Text>
                                <Text style={styles.conceptLabelMuted}>(Opcional)</Text>
                            </Text>
                            <TextInput
                                style={styles.conceptInput}
                                value={concept}
                                onChangeText={onConceptChange}
                                placeholder="Ej. Pago zapatos"
                                placeholderTextColor={colors.placeholder}
                                maxLength={TRANSFER_CONCEPT_MAX_LENGTH}
                                autoCorrect={false}
                                testID="transfer-concept-input"
                            />
                            {validationMessage ? (
                                <Text style={styles.validationText}>{validationMessage}</Text>
                            ) : null}
                        </View>

                        <Button
                            disabled={!canContinueToReview}
                            disabledBackgroundColor={colors.textTertiary}
                            testID="transfer-continue-button"
                            iconSourceRight={<TransferIconArrowRightWhite color={colors.white} size={20}/>}
                            title="Continuar"
                            onPress={() => {
                                const result = prepareTransferReview();

                                if (!result.ok) {
                                    setValidationMessage(result.message);
                                    return;
                                }
                                setValidationMessage(null);
                                navigation.navigate('TransferReview', result.params);
                            }}/>
                        <TertiaryLinkButton title="Cancelar" onPress={() => {
                            onBack()
                        }}/>
                    </View>
                </KeyboardAwareScrollView>
            )}

            <AccountBeneficiarySelectorModal
                accounts={accounts}
                accountIndexSelected={fromAccountIndex}
                selectAccount={selectedId => selectFromAccount(selectedId)}
                visible={fromAccountModalVisible}
                onClose={() => setFromAccountModalVisible(false)}
                pickerRole="source"
            />

            <AccountBeneficiarySelectorModal
                accounts={accounts}
                accountIndexSelected={toAccountIndex}
                selectAccount={selectedId => selectToAccount(selectedId)}
                visible={toAccountModalVisible}
                onClose={() => setToAccountModalVisible(false)}
                pickerRole="destination"
            />
        </View>
    );
}

function useStyles(colors: ThemeColors) {
    return useMemo(() => {
        const shared = buildTransferSharedStyles(colors);
        return StyleSheet.create({
                ...shared,
                scrollContent: {
                    flexGrow: 1,
                },
                hero: {
                    paddingHorizontal: 24,
                    paddingTop: 34,
                    paddingBottom: 24,
                    minHeight: 320,
                },
                cardsBlock: {
                    width: '100%',
                },
                accountsBridgeWrap: {
                    position: 'relative',
                    width: '100%',
                },
                bridgeOverlay: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: BRIDGE_CIRCLE_SIZE,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                },
                bridgeCircle: {
                    width: BRIDGE_CIRCLE_SIZE,
                    height: BRIDGE_CIRCLE_SIZE,
                    borderRadius: BRIDGE_CIRCLE_SIZE / 2,
                    alignItems: 'center',
                    backgroundColor:colors.primaryIconContainerBg,
                    justifyContent: 'center',
                },
                heroHint: {
                    fontFamily: Lexend.regular,
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: 'center',
                    marginBottom: 8,
                    color: colors.textSecondary,
                },
                amountWrap: {
                    position: 'relative',
                    alignSelf: 'center',
                    borderBottomColor: colors.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    minWidth: 200,
                    width: '100%',
                },
                amountInputRow: {
                    position: 'relative',
                    minHeight: 70,
                    width: '100%',
                    justifyContent: 'center',
                },
                amountPlaceholderLayer: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                },
                amountInputPlaceholder: {
                    width: '100%',
                    textAlign: 'center',
                },
                amountInputTextEmpty: {
                    color: 'transparent',
                },
                amountInputEditable: {
                    zIndex: 1,
                },
                amountFieldError: {
                    marginTop: 8,
                    fontFamily: Lexend.regular,
                    fontSize: 13,
                    lineHeight: 18,
                    color: colors.error,
                    textAlign: 'center',
                    alignSelf: 'center',
                    maxWidth: 280,
                },
                amountInput: {
                    fontFamily: Lexend.regular,
                    fontSize: 50,
                    lineHeight: 60,
                    textAlign: 'center',
                    paddingVertical: 0,
                    minHeight: 70,
                    color: colors.textPrimary,
                    ...(Platform.OS === 'android' ? {textAlignVertical: 'center'} : null),
                },
                amountUnderline: {
                    height: 1,
                    backgroundColor: colors.primary,
                },
                conceptInput: {
                    fontFamily: Lexend.regular,
                    fontSize: 14,
                    color: colors.textPrimary,
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 17,
                    overflow: 'visible'
                },
                primaryCta: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    backgroundColor: colors.textTertiary,
                    borderRadius: 8,
                    paddingVertical: 16,
                },
            });
    }, [colors]);
}
