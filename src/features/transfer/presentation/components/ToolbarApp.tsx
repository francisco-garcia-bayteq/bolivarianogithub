import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import {ThemeColors, useTheme} from '../../../../providers';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lexend} from '../../../../theme/lexend';
import {buildTransferSharedStyles} from './transferSharedStyles';
import BackNavigationArrow from '../../../../../assets/images/svg/arrow-back-left.svg';

interface ToolbarAppProps {
  title?: string;
  onBackPress?: () => void;
  titleFont?: 'regular' | 'semibold';
  showBottomDivider?: boolean;
}

export const ToolbarApp = ({
  title = '',
  onBackPress,
  titleFont = 'semibold',
  showBottomDivider = false,
}: ToolbarAppProps) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useStyles(colors);
  return (
    <View
      style={[
        styles.header,
        {paddingTop: insets.top},
        showBottomDivider && styles.headerWithDivider,
      ]}>
      {onBackPress != null && (
        <TouchableOpacity
          onPress={() => {
            onBackPress();
          }}
          style={styles.backBtn}>
          <BackNavigationArrow color={colors.iconPrimary} />
        </TouchableOpacity>
      )}
      <Text
        style={[
          styles.headerTitle,
          titleFont === 'regular' && styles.headerTitleRegular,
        ]}>
        {title}
      </Text>
      <View style={styles.headerRightSpacer} />
    </View>
  );
};

function useStyles(colors: ThemeColors) {
  return useMemo(() => {
    const shared = buildTransferSharedStyles(colors);
    return StyleSheet.create({
      ...shared,
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 72,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
      },
      headerWithDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.borderLight,
      },
      headerTitleRegular: {
        fontFamily: Lexend.regular,
        fontWeight: '400',
      },
    });
  }, [colors]);
}
