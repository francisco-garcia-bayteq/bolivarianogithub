import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import {UserAvatarIcon, BellIcon, LogoutIcon} from './HomeIcons';

type Props = {
  userName?: string | null;
  onLogout?: () => void;
  onNotifications?: () => void;
};

export function HomeHeader({
  userName,
  onLogout,
  onNotifications,
}: Readonly<Props>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const displayName = userName?.trim() || 'Usuario';

  return (
    <View style={styles.row}>
      <View style={styles.leftGroup}>
        <View style={styles.avatarCircle}>
          <UserAvatarIcon color={colors.white} size={16} />
        </View>
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingLine} accessibilityRole="header">
            <Text style={styles.greetingHola}>Hola, </Text>
            <Text style={styles.greetingName}>{displayName}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={onNotifications}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          activeOpacity={0.7}>
          <BellIcon color={colors.white} size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="logout-button"
          onPress={onLogout}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          style={styles.logoutBtn}
          activeOpacity={0.7}>
          <LogoutIcon color={colors.white} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 16,
        },
        leftGroup: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          flex: 1,
          minWidth: 0,
        },
        avatarCircle: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.homeAvatarCircle,
          alignItems: 'center',
          justifyContent: 'center',
        },
        greetingBlock: {
          flex: 1,
          minWidth: 0,
        },
        greetingLine: {
          flexWrap: 'wrap',
        },
        greetingHola: {
          fontFamily: Lexend.regular,
          fontSize: 18,
          lineHeight: 28,
          color: colors.white,
        },
        greetingName: {
          fontFamily: Lexend.semiBold,
          fontSize: 18,
          lineHeight: 28,
          color: colors.white,
        },
        rightGroup: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        },
        logoutBtn: {
          width: 32,
          height: 32,
          borderRadius: 4,
          backgroundColor: colors.homeHeaderIconButtonBg,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [colors],
  );
}
