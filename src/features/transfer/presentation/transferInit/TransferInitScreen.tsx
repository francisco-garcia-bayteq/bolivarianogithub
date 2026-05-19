import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ToolbarApp} from '../components/ToolbarApp.tsx';
import {buildTransferSharedStyles} from '../components/transferSharedStyles';
import {ThemeColors, useTheme} from '../../../../providers';
import {Lexend} from '../../../../theme/lexend';
import type {TransferStackParamList} from '../../navigation/TransferStackNavigator';
import {useTransferInitViewModel} from './useTransferInitViewModel.tsx';
import {ErrorBannerComponent} from './components/ErrorBannerComponent.tsx';
import {TransferOptionCard} from './components/TransferOptionCard.tsx';

import AccountTransferIcon from '../../../../../assets/images/svg/arrows-retweet.svg';
import AccountUserTransferIcon from '../../../../../assets/images/svg/users_transfer.svg';

export function TransferInitScreen() {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  const navigation =
    useNavigation<NativeStackNavigationProp<TransferStackParamList>>();

  const {
    isLoading,
    error,
    retry,
    isBetweenOwnAccountsEnabled,
    isThirdPartyEnabled,
  } = useTransferInitViewModel();

  return (
    <View style={styles.root} testID="transfer-init-screen">
      <View style={styles.toolbarBorder}>
        <ToolbarApp
          title="TRANSFERENCIAS"
          onBackPress={() => {
            navigation.goBack();
          }}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionSubtitle}>Transferir mi dinero</Text>

        {error ? (
          <ErrorBannerComponent
            textRetry="Reintentar"
            errorText={error}
            onRetry={() => {
              retry().catch(() => {});
            }}
          />
        ) : null}

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.cards}>
            <TransferOptionCard
              title="Entre mis cuentas"
              description="Transfiere dinero de forma inmediata."
              enabled={isBetweenOwnAccountsEnabled}
              onPress={() => {
                navigation.navigate('TransferMain');
              }}
              testID="transfer-init-between-accounts"
              leadingIcon={
                <AccountTransferIcon color={colors.primary}/>

              }
            />
            <TransferOptionCard
              title="A terceros"
              description="Transfiere dinero a otros beneficiarios."
              enabled={isThirdPartyEnabled}
              onPress={() => {}}
              testID="transfer-init-third-party"
              leadingIcon={

                <AccountUserTransferIcon color={colors.primary}/>
              }
            />
          </View>
        )}
      </View>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        ...buildTransferSharedStyles(colors),
        toolbarBorder: {
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        content: {
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 16,
        },
        sectionSubtitle: {
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          marginBottom: 16,
        },
        cards: {
          gap: 16,
        },
      }),
    [colors],
  );
}
