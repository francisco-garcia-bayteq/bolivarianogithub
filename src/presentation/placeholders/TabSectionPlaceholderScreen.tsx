import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';

export type TabSectionPlaceholderScreenProps = {
  sectionTitle: string;
};

export function TabSectionPlaceholderScreen({
  sectionTitle,
}: Readonly<TabSectionPlaceholderScreenProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View
      style={styles.root}
      accessibilityLabel={`${sectionTitle}, próximamente`}>
      <Text style={styles.title}>{sectionTitle}</Text>
      <Text style={styles.hint}>Próximamente</Text>
    </View>
  );
}

export function WithdrawTabScreen() {
  return <TabSectionPlaceholderScreen sectionTitle="Retirar" />;
}

export function PaymentsTabScreen() {
  return <TabSectionPlaceholderScreen sectionTitle="Pagos" />;
}

export function OthersTabScreen() {
  return <TabSectionPlaceholderScreen sectionTitle="Otros" />;
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: colors.background,
        },
        title: {
          fontFamily: Lexend.semiBold,
          fontSize: 20,
          color: colors.textPrimary,
          marginBottom: 8,
        },
        hint: {
          fontFamily: Lexend.regular,
          fontSize: 16,
          color: colors.textSecondary,
        },
      }),
    [colors],
  );
}
