import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Transaction, TransactionCategory} from '../../domain/entities/Transaction';
import {useTheme, type ThemeColors} from '../../providers/theme';

const CATEGORY_CONFIG: Record<TransactionCategory, {icon: string; label: string}> = {
  salary: {icon: '💰', label: 'Salario'},
  food: {icon: '🍔', label: 'Comida'},
  transport: {icon: '🚗', label: 'Transporte'},
  entertainment: {icon: '🎬', label: 'Entretenimiento'},
  shopping: {icon: '🛒', label: 'Compras'},
  transfer: {icon: '🔄', label: 'Transferencia'},
  services: {icon: '⚡', label: 'Servicios'},
  health: {icon: '🏥', label: 'Salud'},
};

const STATUS_CONFIG: Record<string, {label: string; color: string; bg: string}> = {
  completed: {label: 'Completada', color: '#059669', bg: '#ECFDF5'},
  pending: {label: 'Pendiente', color: '#D97706', bg: '#FFFBEB'},
  cancelled: {label: 'Cancelada', color: '#DC2626', bg: '#FEF2F2'},
};

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-MX', {day: 'numeric', month: 'short'});
}

interface TransactionItemProps {
  item: Transaction;
}

export function TransactionItem({item}: Readonly<TransactionItemProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const category = CATEGORY_CONFIG[item.category];
  const status = STATUS_CONFIG[item.status];
  const isIncome = item.type === 'income';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={1}>
          {item.description}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <View style={[styles.badge, {backgroundColor: status.bg}]}>
            <Text style={[styles.badgeText, {color: status.color}]}>
              {status.label}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={[
          styles.amount,
          {color: isIncome ? colors.success : colors.error},
        ]}>
        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
      </Text>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
        },
        iconContainer: {
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: colors.borderSubtle,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        },
        icon: {
          fontSize: 20,
        },
        content: {
          flex: 1,
          marginRight: 8,
        },
        description: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: 4,
        },
        meta: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        date: {
          fontSize: 13,
          color: colors.textTertiary,
        },
        badge: {
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 6,
        },
        badgeText: {
          fontSize: 11,
          fontWeight: '600',
        },
        amount: {
          fontSize: 15,
          fontWeight: '700',
        },
      }),
    [colors],
  );
}
