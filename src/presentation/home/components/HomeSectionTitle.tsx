import React, {useMemo} from 'react';
import {Text, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';

type Props = {
  children: string;
};

export function HomeSectionTitle({children}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  return <Text style={styles.title}>{children}</Text>;
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textPrimary,
        },
      }),
    [colors],
  );
}
