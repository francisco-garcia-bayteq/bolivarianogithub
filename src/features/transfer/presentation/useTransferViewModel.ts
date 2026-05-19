import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Platform} from 'react-native';
import type {AccountBalance} from '../../../domain/entities/ContractBalance';
import {
    balanceDollarsToCents,
    getLiveTransferAmountError,
    parseTransferAmountInputToCents,
    sanitizeTransferAmountInput,
    sanitizeTransferConceptInput,
    validateTransferAmountForSubmit,
    validateTransferConcept,
} from '../../../domain/validation';
import {useAuth} from '../../../providers';
import {formatAccountKindLine} from '../utils/accountDisplay';
import {formatMoneyUsdDisplay} from '../../../utils/formatMoneyUsdDisplay';
import type {TransferReviewRouteParams} from './TransferReview/transferReviewTypes';
import {useHomeViewModel} from "../../../presentation/home/useHomeViewModel.ts";

function defaultAccountIndex(accounts: AccountBalance[]): number {
    if (accounts.length === 0) {
        return 0;
    }
    const savingsIdx = accounts.findIndex(
        a => a.accountKind.toLowerCase() === 'savings',
    );
    return Math.max(0, savingsIdx)
}

/** On iOS, numeric keyboards often emit `,` as decimal separator; map to `.` before sanitize. */
function normalizeIosAmountDecimalComma(text: string): string {
    if (Platform.OS !== 'ios') {
        return text;
    }
    if (text.includes('.')) {
        return text;
    }
    return text.replaceAll(',', '.');
}

export function useTransferViewModel() {
    const {user} = useAuth();
    const {data, isLoading, error, retry} = useHomeViewModel();

    const [amountCents, setAmountCents] = useState<number | null>(null);
    const [amountInputText, setAmountInputText] = useState('');
    const [isAmountFocused, setIsAmountFocused] = useState(false);

    const onAmountFocus = useCallback(() => setIsAmountFocused(true), []);

    const onAmountBlur  = useCallback(() => setIsAmountFocused(false), []);

    const [accountBeneficiaryModalVisible, setAccountBeneficiaryModalVisible] = useState(false);

    const accounts = useMemo(() => data?.accounts ?? [], [data?.accounts]);
    const defaultIdx = useMemo(() => defaultAccountIndex(accounts), [accounts]);

    const [concept, setConcept] = useState('');

    const [validationMessage, setValidationMessage] = useState<string | null>(null);


    const [fromAccountModalVisible, setFromAccountModalVisible] = useState(false);
    const [fromAccountIndex, setFromAccountIndex] = useState(0);


    const [toAccountIndex, setToAccountIndex] = useState(0);
    const [toAccountModalVisible, setToAccountModalVisible] = useState(false);


    const accountsInitializedRef = useRef(false);

    useEffect(() => {
        if (accounts.length === 0) {
            return;
        }
        if (!accountsInitializedRef.current) {
            setFromAccountIndex(defaultIdx);
            if (accounts.length > 1) {
                const otherIdx = defaultIdx === 0 ? 1 : 0;
                setToAccountIndex(otherIdx);
            }
            accountsInitializedRef.current = true;
            return;
        }
        if (fromAccountIndex >= accounts.length) {
            setFromAccountIndex(defaultIdx);
        }
    }, [accounts, defaultIdx, fromAccountIndex]);

    useEffect(() => {
        if (accounts.length === 0) {
            return;
        }
        if (toAccountIndex >= accounts.length) {
            setToAccountIndex(Math.max(0, accounts.length - 1));
        }
    }, [accounts, toAccountIndex]);

    const selectedFromAccount = accounts[fromAccountIndex] ?? null;
    const selectedToAccount = accounts[toAccountIndex] ?? null;

    const fromAccountDescription = useMemo(
        () => (selectedFromAccount ? formatAccountKindLine(selectedFromAccount) : ''),
        [selectedFromAccount],
    );

    const toAccountDescription = useMemo(
        () => (selectedToAccount ? formatAccountKindLine(selectedToAccount) : ''),
        [selectedToAccount],
    );

    const availableBalanceCents = useMemo(
        () => balanceDollarsToCents(selectedFromAccount?.balance ?? 0),
        [selectedFromAccount?.balance],
    );

    const amountFieldError = useMemo(
        () =>
            getLiveTransferAmountError(
                amountCents ?? 0,
                availableBalanceCents,
            ),
        [amountCents, availableBalanceCents],
    );
    const amountDisplayText = useMemo(() => {

        if (amountInputText === '') return '';

        if (isAmountFocused) return amountInputText;

        const dotIdx = amountInputText.indexOf('.');

        if (dotIdx === -1) return `${amountInputText}.00`;

        const frac = amountInputText.slice(dotIdx + 1);

        if (frac.length === 0) return `${amountInputText}00`;

        if (frac.length === 1) return `${amountInputText}0`;

        return amountInputText;

    }, [amountInputText, isAmountFocused]);

    const canContinueToReview = useMemo(() => {
        if (!selectedFromAccount || !selectedToAccount) {
            return false;
        }
        if (fromAccountIndex === toAccountIndex) {
            return false;
        }
        return (
            validateTransferAmountForSubmit(
                amountCents ?? 0,
                availableBalanceCents,
            ) === null
        );
    }, [
        selectedFromAccount,
        selectedToAccount,
        fromAccountIndex,
        toAccountIndex,
        amountCents,
        availableBalanceCents,
    ]);

    const onAmountChange = useCallback((text: string) => {
        setValidationMessage(null);
        const raw = normalizeIosAmountDecimalComma(text);
        const sanitized = sanitizeTransferAmountInput(raw);
        setAmountInputText(sanitized);
        if (sanitized === '') {
            setAmountCents(null);
            return;
        }
        const cents = parseTransferAmountInputToCents(sanitized);
        setAmountCents(cents);
    }, []);

    const onConceptChange = useCallback((text: string) => {
        const sanitized = sanitizeTransferConceptInput(text);
        setConcept(sanitized);
    }, []);

    const openFromAccountPicker = useCallback(() => {
        if (accounts.length > 1) {
            setFromAccountModalVisible(true);
        }
    }, [accounts.length]);

    const openToAccountPicker = useCallback(() => {
        if (accounts.length > 1) {
            setToAccountModalVisible(true);
        }
    }, [accounts.length]);

    const openAccountBeneficiaryPicker = useCallback(() => {
        if (accounts.length > 1) {
            setAccountBeneficiaryModalVisible(true);
        }
    }, [accounts.length]);

    const selectFromAccount = useCallback(
        (index: number) => {
            if (accounts.length >= 2 && index === toAccountIndex) {
                setFromAccountIndex(index);
                setToAccountIndex(fromAccountIndex);
            } else {
                setFromAccountIndex(index);
            }
            setFromAccountModalVisible(false);
            setAccountBeneficiaryModalVisible(false);
        },
        [accounts.length, fromAccountIndex, toAccountIndex],
    );

    const selectToAccount = useCallback(
        (index: number) => {
            if (accounts.length >= 2 && index === fromAccountIndex) {
                setToAccountIndex(index);
                setFromAccountIndex(toAccountIndex);
            } else {
                setToAccountIndex(index);
            }
            setToAccountModalVisible(false);
        },
        [accounts.length, fromAccountIndex, toAccountIndex],
    );





    const prepareTransferReview = useCallback(():
        | { ok: true; params: TransferReviewRouteParams }
        | { ok: false; message: string } => {
        const amountForSubmit = amountCents ?? 0;
        const amountError = validateTransferAmountForSubmit(
            amountForSubmit,
            availableBalanceCents,
        );
        if (amountError) {
            return {ok: false, message: amountError};
        }
        if (!selectedFromAccount) {
            return {ok: false, message: 'No hay una cuenta de origen disponible.'};
        }
        if (!selectedToAccount) {
            return {ok: false, message: 'Selecciona una cuenta de destino.'};
        }
        if (
            fromAccountIndex === toAccountIndex ||
            selectedFromAccount.accountGuid === selectedToAccount.accountGuid
        ) {
            return {
                ok: false,
                message: 'El origen y el destino deben ser cuentas distintas.',
            };
        }

        const conceptError = validateTransferConcept(concept);
        if (conceptError) {
            return {ok: false, message: conceptError};
        }

        const holderName = user?.name?.trim() || 'Titular';

        const fromAccountSubtitle = `${selectedFromAccount.accountTypeLabel} ${selectedFromAccount.maskedAccountNumber}`.trim();

        return {
            ok: true,
            params: {
                amountCents: amountForSubmit,
                displayAmount: formatMoneyUsdDisplay(amountForSubmit / 100),
                beneficiary:{
                    id:selectedToAccount.beneficiary.beneficiaryGuid,
                    bankName:selectedToAccount.beneficiary.bankName,
                    name:selectedToAccount.beneficiary.contactName,
                    kind:"own_account",
                    accountHint:selectedToAccount.beneficiary.lastFourDigits
                },
                fromHolderName: holderName,
                fromAccountLine: formatAccountKindLine(selectedFromAccount),
                toAccountSubtitle: formatAccountKindLine(selectedToAccount),
                toAccountTitle:selectedToAccount.accountTypeLabel?.trim()??"",
                fromAccountTitle: selectedFromAccount.accountTypeLabel?.trim() ?? '',
                fromAccountSubtitle,
                fromBalanceDisplay: formatMoneyUsdDisplay(selectedFromAccount.balance),
                toBalanceDisplay: formatMoneyUsdDisplay(selectedToAccount.balance),
                accountId: selectedFromAccount.accountGuid,
                concept: concept,
                fromAccountSubtitleMasked: formatAccountKindLine(selectedFromAccount),
                toAccountSubtitleMasked: formatAccountKindLine(selectedToAccount),

            },
        };
    }, [
        amountCents,
        availableBalanceCents,
        concept,
        fromAccountIndex,
        toAccountIndex,
        selectedFromAccount,
        selectedToAccount,
        user?.name,
    ]);

    return {
        amountDisplayText,
        onAmountFocus,
        onAmountBlur,
        user,
        isLoading,
        error,
        retry,
        accounts,
        selectedFromAccount,
        fromAccountDescription,
        fromAccountModalVisible,
        setFromAccountModalVisible,
        amountCents,
        amountInputText,
        onAmountChange,
        concept,
        onConceptChange,
        amountFieldError,
        canContinueToReview,
        validationMessage,
        setValidationMessage,
        openFromAccountPicker,
        openToAccountPicker,
        selectFromAccount,
        fromAccountIndex,
        prepareTransferReview,
        openAccountBeneficiaryPicker,
        accountBeneficiaryModalVisible,
        toAccountModalVisible,
        setToAccountModalVisible,
        toAccountIndex,
        selectToAccount,
        toAccountDescription,
        selectedToAccount
    };
}
