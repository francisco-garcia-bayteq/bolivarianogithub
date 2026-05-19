import React, {useMemo} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type ThemeColors} from '../../providers';
import {Lexend} from '../../theme/lexend';
import {
  TransferIconClose,
} from '../../features/transfer/presentation/components/transferIcons.tsx';

const ALERT_CONTAINER_BG = '#FFE5E2';
const ICON_BOX = 56;

export type DevelopmentNoticeModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
};

const DEFAULT_TITLE = 'En Desarrollo';
const DEFAULT_MESSAGE =
  'Esta funcionalidad se encuentra en desarrollo';

export function DevelopmentNoticeModal({
  visible,
  onClose,
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
  icon,
}: Readonly<DevelopmentNoticeModalProps>) {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useStyles(colors);

  const defaultIcon = (
    <View style={styles.iconBox}>
      <Text>{"<>"}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          },
        ]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Cerrar"
        />
        <View style={styles.card} pointerEvents="box-none">
          <View style={styles.closeRow}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityRole="button"
              accessibilityLabel="Cerrar aviso">
              <TransferIconClose color={colors.iconPrimary} size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.body}>
            {icon ?? defaultIcon}
            <View style={styles.textBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          backgroundColor: 'rgba(0,0,0,0.45)',
        },
        card: {
          width: '100%',
          maxWidth: 400,
          borderRadius: 20,
          backgroundColor: colors.white,
          paddingHorizontal: 16,
          paddingBottom: 16,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 8},
              shadowOpacity: 0.12,
              shadowRadius: 24,
            },
            android: {elevation: 8},
            default: {},
          }),
        },
        closeRow: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingTop: 16,
          marginBottom: 4,
        },
        body: {
          alignItems: 'center',
          gap: 16,
          paddingBottom: 8,
        },
        iconBox: {
          width: ICON_BOX,
          height: ICON_BOX,
          borderRadius: 8,
          backgroundColor: ALERT_CONTAINER_BG,
          alignItems: 'center',
          justifyContent: 'center',
        },
        textBlock: {
          alignItems: 'center',
          gap: 12,
          width: '100%',
        },
        title: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 24,
          color: colors.textPrimary,
          textAlign: 'center',
        },
        message: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textSecondary,
          textAlign: 'center',
        },
      }),
    [colors],
  );
}
