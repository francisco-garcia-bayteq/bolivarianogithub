import React, {useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import type {RecentActivityItem} from '../homeDashboardMocks';
import {CalendarIcon} from './HomeIcons';

type Props = {
  items?: RecentActivityItem[];
  onPressListIcon?: () => void;
  onPressCalendarIcon?: () => void;
};

export function RecentActivitySection({
  items = [],
  onPressListIcon,
  onPressCalendarIcon,
}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        <View style={styles.headerIcons}>
        
          <TouchableOpacity
            onPress={onPressCalendarIcon}
            accessibilityRole="button"
            accessibilityLabel="Calendario"
            hitSlop={8}>
            <CalendarIcon color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        {items.map((item, index) => (
          <View
            key={item.id ?? `${item.day}-${item.description}-${index}`}>
            <View style={styles.row}>
              <View style={styles.dateCol}>
                <Text style={styles.day}>{item.day}</Text>
                <Text style={styles.month}>{item.monthLabel}</Text>
              </View>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.amount}>{item.amountLabel}</Text>
            </View>
            {index < items.length - 1 ? (
              <View style={styles.separator} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        section: {
          gap: 12,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        sectionTitle: {
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 16,
          color: colors.textPrimary,
        },
        headerIcons: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: 12,
          
          paddingVertical: 8,
          marginVertical: 8,
         
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          gap: 12,
          paddingVertical: 10,
        },
        dateCol: {
          width: 40,
          alignItems: 'center',
        },
        day: {
          fontFamily: Lexend.bold,
          fontSize: 18,
          lineHeight: 22,
          color: colors.primary,
        },
        month: {
          fontFamily: Lexend.regular,
          fontSize: 11,
          lineHeight: 14,
          color: colors.textTertiary,
          textTransform: 'uppercase',
        },
        description: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 13,
          lineHeight: 18,
          color: colors.textPrimary,
        },
        amount: {
          fontFamily: Lexend.semiBold,
          fontSize: 13,
          lineHeight: 18,
          color: colors.textPrimary,
        },
        separator: {
          height: 1.4,
          backgroundColor: colors.lineSeparator,
          alignSelf: 'stretch',
        },
      }),
    [colors],
  );
}
