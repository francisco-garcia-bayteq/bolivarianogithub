import {BackHandler, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {ThemeColors, useTheme} from '../../../../providers';
import React, {useCallback, useMemo} from 'react';
import {ToolbarApp} from '../components/ToolbarApp.tsx';
import {buildTransferSharedStyles} from '../components/transferSharedStyles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TertiaryLinkButton} from '../../../../presentation/components';
import {Button, SecondaryIconButton} from '../ui';
import {
  useRoute,
  RouteProp,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import type {TransferStackParamList} from '../../navigation/TransferStackNavigator';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ViewShot from 'react-native-view-shot';
import {TransferVoucherShareableCard} from '../components/TransferVoucherShareableCard';
import {useTransferVoucherCaptureShare} from '../useTransferVoucherCaptureShare';
import {Lexend} from '../../../../theme/lexend';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {MainTabParamList} from '../../../../navigation/MainTabNavigator';

const shareIcon = require('../../../../../assets/images/share-nodes.png');

type TransferVoucherRouteProp = RouteProp<TransferStackParamList, 'TransferVoucher'>;

type NativeNav = NativeStackNavigationProp<
  TransferStackParamList,
  'TransferVoucher'
>;

export const TransferVoucherScreen = () => {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const insets = useSafeAreaInsets();
  const {params} = useRoute<TransferVoucherRouteProp>();

  const navigation = useNavigation<NativeNav>();

  const transactionData = params.routeSuccessTransactionData;

  const navigateHomeWithRefresh = useCallback(() => {
    navigation.popToTop();
    const tabNav =
      navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
    tabNav?.navigate({
      name: 'Home',
      params: {
        screen: 'HomeMain',
        params: {refreshHome: Date.now()},
      },
    });
  }, [navigation]);

  const {viewShotRef, shareVoucher} = useTransferVoucherCaptureShare();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return;
      }
      const onBackPress = () => {
        navigateHomeWithRefresh();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigateHomeWithRefresh]),
  );

  return (
    <View style={styles.root} testID="transfer-voucher-screen">
      <ToolbarApp
        title="          COMPROBANTE"
        titleFont="regular"
        showBottomDivider
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 24) + 16},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.containerForm}>
          <View style={styles.contentColumn}>
            <ViewShot ref={viewShotRef} options={{format: 'png', quality: 1}}>
              <TransferVoucherShareableCard transferResume={transactionData} />
            </ViewShot>
            <View style={styles.actionsGroup}>
              <Button
                variant="loginPrimary"
                iconSourceRight={shareIcon}
                iconRightTintColor={colors.white}
                title="Compartir"
                labelStyle={styles.primaryButtonLabel}
                style={styles.primaryButton}
                onPress={() => {
                  shareVoucher().catch(() => {});
                }}
              />
              <SecondaryIconButton
                variant="outline"
                title="Nueva transferencia"
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'TransferMain'}],
                  });
                }}
                disabled={false}
                loading={false}
              />
              <TertiaryLinkButton
                title="Ir al inicio"
                labelStyle={styles.tertiaryLinkLabel}
                onPress={navigateHomeWithRefresh}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

function useStyles(colors: ThemeColors) {
  return useMemo(() => {
    const shared = buildTransferSharedStyles(colors);
    return StyleSheet.create({
      ...shared,
      scrollContent: {
        flexGrow: 1,
        paddingTop: 24,
      },
      containerForm: {
        paddingHorizontal: 24,
      },
      contentColumn: {
        gap: 24,
        width: '100%',
      },
      actionsGroup: {
        gap: 12,
        width: '100%',
      },
      primaryButton: {
        height: 48,
        paddingVertical: 0,
        justifyContent: 'center',
      },
      primaryButtonLabel: shared.primaryCtaText,
      tertiaryLinkLabel: {
        fontFamily: Lexend.semiBold,
        fontSize: 14,
        lineHeight: 22,
      },
    });
  }, [colors]);
}
