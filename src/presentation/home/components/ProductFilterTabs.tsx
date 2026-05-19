import React, {useMemo} from 'react';
import {Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';

type Props = {
  filters: readonly string[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
};

export function ProductFilterTabs({
  filters,
  selectedFilter,
  onFilterChange,
}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      {filters.map(label => {
        const isSelected = label === selectedFilter;
        return (
          <TouchableOpacity
            key={label}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onFilterChange(label)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{selected: isSelected}}>
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        scrollContent: {
          flexDirection: 'row',
          alignItems: 'center',          
          gap: 8,
          paddingBottom: 20,
          paddingLeft: 24,
          paddingTop: 8,
        },
        chip: {
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.white,
          backgroundColor: 'transparent',
        },
        chipSelected: {
          backgroundColor: colors.primary,
          borderColor: colors.homeChipSelectedBorder,
        },
        chipText: {
          fontFamily: Lexend.semiBold,
          fontSize: 13,
          lineHeight: 18,
          color: colors.white,
        },
        chipTextSelected: {
          fontFamily: Lexend.semiBold,
        },
      }),
    [colors],
  );
}
