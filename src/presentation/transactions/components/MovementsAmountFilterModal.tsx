import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import {
  TransferIconClose,
  TransferIconBanknote,
} from '../../../features/transfer/presentation/components/transferIcons.tsx';
import type {AppliedAmountRange} from '../useAccountMovementsViewModel';
import {isValidMovementsAmountRange} from '../useAccountMovementsViewModel';

export type MovementsAmountFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  initialRange: AppliedAmountRange | null;
  onApply: (min: number, max: number) => void;
};

function parseAmountInput(raw: string): number | null {
  const t = raw.trim().replaceAll(/\s/g, '').replaceAll('$', '');
  if (t === '') {
    return null;
  }
  const normalized = t.replaceAll(',', '.');
  const n = Number(normalized);
  if (!Number.isFinite(n)) {
    return null;
  }
  return n;
}

export function MovementsAmountFilterModal({
  visible,
  onClose,
  initialRange,
  onApply,
}: Readonly<MovementsAmountFilterModalProps>) {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useStyles(colors);
  const [minStr, setMinStr] = useState('');
  const [maxStr, setMaxStr] = useState('');

  const initialKey = useMemo(
    () =>
      initialRange ? `${initialRange.min}|${initialRange.max}` : 'none',
    [initialRange],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (initialRange) {
      setMinStr(String(initialRange.min));
      setMaxStr(String(initialRange.max));
    } else {
      setMinStr('');
      setMaxStr('');
    }
  }, [visible, initialKey, initialRange]);

  const parsedMin = useMemo(() => parseAmountInput(minStr), [minStr]);
  const parsedMax = useMemo(() => parseAmountInput(maxStr), [maxStr]);

  const canApply = useMemo(() => {
    if (parsedMin === null || parsedMax === null) {
      return false;
    }
    return isValidMovementsAmountRange(parsedMin, parsedMax);
  }, [parsedMin, parsedMax]);

  const handleApply = useCallback(() => {
    if (parsedMin === null || parsedMax === null) {
      return;
    }
    if (!isValidMovementsAmountRange(parsedMin, parsedMax)) {
      return;
    }
    onApply(parsedMin, parsedMax);
    onClose();
  }, [parsedMin, parsedMax, onApply, onClose]);

  return (
    <Modal
      testID="movements-amount-filter-modal"
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}>
      <KeyboardAvoidingView
        behavior="padding"
        automaticOffset
        enabled={visible}
        style={[
          styles.root,
          {paddingTop: insets.top, paddingBottom: insets.bottom},
        ]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Cerrar filtro"
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.headerBlock}>
            <View style={styles.headerRow}>
              <View style={styles.headerSpacer} />
              <Text style={styles.title}>Filtro por monto</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                accessibilityRole="button"
                accessibilityLabel="Cerrar">
                <TransferIconClose color={colors.iconPrimary} size={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Selecciona un rango de min a max
            </Text>
          </View>

          <View style={styles.bodyArea}>
            <View style={styles.inputsRow}>
              <View style={styles.amountField}>
                <Text style={styles.fieldLabel}>Min</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    testID="movements-amount-filter-min-input"
                    style={styles.input}
                    value={minStr}
                    onChangeText={setMinStr}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                    accessibilityLabel="Monto mínimo"
                  />
                </View>
              </View>
              <View style={styles.amountField}>
                <Text style={styles.fieldLabel}>Max</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    testID="movements-amount-filter-max-input"
                    style={styles.input}
                    value={maxStr}
                    onChangeText={setMaxStr}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                    accessibilityLabel="Monto máximo"
                  />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            testID="movements-amount-filter-apply"
            style={[styles.primaryBtn, !canApply && styles.primaryBtnDisabled]}
            onPress={handleApply}
            disabled={!canApply}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Ver movimientos">
            <Text style={styles.primaryBtnText}>Ver movimientos</Text>
            <TransferIconBanknote color={colors.white} size={22} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.45)',
        },
        sheet: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
          maxHeight: Dimensions.get('window').height * 0.92,
        },
        headerBlock: {
          backgroundColor: colors.surface,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        headerSpacer: {width: 24},
        title: {
          fontFamily: Lexend.bold,
          fontSize: 17,
          color: colors.textPrimary,
          textAlign: 'center',
          flex: 1,
        },
        subtitle: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.textTertiary,
          textAlign: 'left',
          marginBottom: 8,
        },
        bodyArea: {
          backgroundColor: colors.background,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        },
        inputsRow: {
          flexDirection: 'row',
          gap: 12,
        },
        amountField: {
          flex: 1,
        },
        fieldLabel: {
          fontFamily: Lexend.semiBold,
          fontSize: 13,
          color: colors.textSecondary,
          marginBottom: 6,
        },
        inputWrap: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: 10,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.borderLight,
          paddingHorizontal: 10,
          minHeight: 48,
        },
        currencyPrefix: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          color: colors.textTertiary,
          marginRight: 4,
        },
        input: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 16,
          color: colors.textPrimary,
          paddingVertical: 10,
        },
        primaryBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 16,
          paddingHorizontal: 20,
        },
        primaryBtnDisabled: {
          opacity: 0.45,
        },
        primaryBtnText: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          color: colors.white,
        },
      }),
    [colors],
  );
}
