import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import {
  TransferIconClose,
  TransferIconCheck,
} from '../../../features/transfer/presentation/components/transferIcons.tsx';
import {MOVEMENT_TRANSACTION_TYPE_OPTIONS} from '../transactionTypeFilterOptions';
import type {MovementTransactionEnumType} from '../transactionTypeFilterOptions';

export type MovementsTypeFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  initialEnumType: MovementTransactionEnumType | null;
  onApply: (value: MovementTransactionEnumType) => void;
};

export function MovementsTypeFilterModal({
  visible,
  onClose,
  initialEnumType,
  onApply,
}: Readonly<MovementsTypeFilterModalProps>) {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useStyles(colors);
  const [draft, setDraft] = useState<MovementTransactionEnumType | null>(null);

  const initialKey = useMemo(
    () => (initialEnumType ?? 'none'),
    [initialEnumType],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDraft(initialEnumType);
  }, [visible, initialKey, initialEnumType]);

  const toggleOption = useCallback((value: MovementTransactionEnumType) => {
    setDraft(prev => (prev === value ? null : value));
  }, []);

  const canApply = draft !== null;

  const handleApply = useCallback(() => {
    if (draft === null) {
      return;
    }
    onApply(draft);
    onClose();
  }, [draft, onApply, onClose]);

  return (
    <Modal
      testID="movements-type-filter-modal"
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}>
      <View
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
              <Text style={styles.title}>Filtro por tipo</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                accessibilityRole="button"
                accessibilityLabel="Cerrar">
                <TransferIconClose color={colors.iconPrimary} size={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Selecciona por tipo de transacción
            </Text>
          </View>

          <View style={styles.bodyArea}>
            <ScrollView
              style={styles.listScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {MOVEMENT_TRANSACTION_TYPE_OPTIONS.map((opt, index) => {
                const selected = draft === opt.enumValue;
                const isLast = index === MOVEMENT_TRANSACTION_TYPE_OPTIONS.length - 1;
                return (
                  <TouchableOpacity
                    key={opt.enumValue}
                    style={[styles.row, !isLast && styles.rowBorder]}
                    onPress={() => toggleOption(opt.enumValue)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{selected}}
                    accessibilityLabel={opt.label}>
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}>
                      {selected ? (
                        <TransferIconCheck color={colors.white} size={14} />
                      ) : null}
                    </View>
                    <Text style={styles.rowLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity
            testID="movements-type-filter-apply"
            style={[styles.primaryBtn, !canApply && styles.primaryBtnDisabled]}
            onPress={handleApply}
            disabled={!canApply}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Ver movimientos">
            <Text style={styles.primaryBtnText}>Ver movimientos</Text>
            <TransferIconCheck color={colors.white} size={22} />
          </TouchableOpacity>
        </View>
      </View>
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
          maxHeight: Dimensions.get('window').height * 0.88,
        },
        headerBlock: {
          marginBottom: 8,
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
          paddingVertical: 4,
          marginBottom: 16,
          maxHeight: Dimensions.get('window').height * 0.42,
        },
        listScroll: {
          maxHeight: Dimensions.get('window').height * 0.42,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 12,
        },
        rowBorder: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        checkbox: {
          width: 22,
          height: 22,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: colors.border,
          marginRight: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
        },
        checkboxSelected: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        rowLabel: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 15,
          color: colors.textPrimary,
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
