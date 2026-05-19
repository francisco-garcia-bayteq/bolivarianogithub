import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../../../providers/theme';
import {
  TransferArrowsIcon,
  LightbulbServiceIcon,
  QrCodeIcon,
  CalendarIcon,
} from './HomeIcons';
import {QuickActionButton} from './QuickActionButton';

interface QuickActionsRowProps {
  onPress: () => void;
}

export function QuickActionsRow({onPress}: Readonly<QuickActionsRowProps>) {
  const {colors} = useTheme();
  const iconColor = colors.homeHeaderIconButtonBg;

  return (
    <View style={styles.row}>
      <QuickActionButton
        icon={<TransferArrowsIcon color={iconColor} size={20} />}
        label="Transferir"
        onPress={onPress}
      />
      <QuickActionButton
        icon={<LightbulbServiceIcon color={iconColor} size={20} />}
        label="Pagar servicios"
        onPress={onPress}
      />
      <QuickActionButton
        icon={<QrCodeIcon color={iconColor} size={20} />}
        label="Cobrar QR"
        onPress={onPress}
      />
      <QuickActionButton
        icon={<CalendarIcon color={iconColor} size={24} />}
        label="Programadas"
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
