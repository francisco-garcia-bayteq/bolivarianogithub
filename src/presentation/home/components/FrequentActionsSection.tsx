import React, {useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import type {FrequentPayment} from '../../../domain/entities/ContractBalance';
import {renderHomeDashboardIcon} from './homeDashboardIconMap';

type Props = {
  items: FrequentPayment[];
  onItemPress?: (item: FrequentPayment, index: number) => void;
};

export function FrequentActionsSection({items, onItemPress}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Acciones frecuentes</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled>
        {items.map((item, index) => (
          <TouchableOpacity
            key={`${item.beneficiaryName}-${item.beneficiaryType}-${index}`}
            style={styles.item}
            activeOpacity={0.75}
            onPress={() => onItemPress?.(item, index)}
            accessibilityRole="button"
            accessibilityLabel={item.beneficiaryName}>
            <View style={styles.circle}>
              {renderHomeDashboardIcon(item.beneficiaryType, colors.primary, 24)}
            </View>
            <Text style={styles.caption} numberOfLines={2}>
              {item.beneficiaryName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
        sectionTitle: {
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 16,
          color: colors.textPrimary,
        },
        scrollContent: {
          gap: 16,
          paddingVertical: 4,
          paddingRight: 6,
        },
        item: {
          width: 80,
          alignItems: 'center',
          gap: 8,
        },
        circle: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowSoft,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 6,
            },
            android: {
              elevation: 2,
            },
          }),
        },
        caption: {
          fontFamily: Lexend.regular,
          fontSize: 11,
          lineHeight: 14,
          color: colors.textSecondary,
          textAlign: 'center',
        },
      }),
    [colors],
  );
}
