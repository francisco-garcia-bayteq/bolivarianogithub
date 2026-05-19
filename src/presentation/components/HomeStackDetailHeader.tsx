import React, {useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';

const arrowBack = require('../../../assets/images/arrow-left.png');

interface HomeStackDetailHeaderProps {
  title: string;
  onPressBack: () => void;
}

export function HomeStackDetailHeader({
  title,
  onPressBack,
}: Readonly<HomeStackDetailHeaderProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={styles.headerBar}>
      <TouchableOpacity
        onPress={onPressBack}
        accessibilityRole="button"
        accessibilityLabel="Volver">
        <Image
          source={arrowBack}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        headerBar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingVertical: 12,
          backgroundColor: colors.white,
        },
        backIcon: {
          width: 20,
          height: 22,
        },
        headerTitle: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.textPrimary,
          textAlign: 'center',
          textTransform: 'uppercase',
        },
        headerSpacer: {
          width: 22,
          height: 12,
        },
      }),
    [colors],
  );
}
