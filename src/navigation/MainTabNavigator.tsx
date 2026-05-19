import React, {useCallback} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {PlatformPressable} from '@react-navigation/elements';
import {
  createBottomTabNavigator,
  type BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import {useIsFocused} from '@react-navigation/core';
import {
  getFocusedRouteNameFromRoute,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HomeStackNavigator} from './HomeStackNavigator';
import type {HomeStackParamList} from './HomeStackNavigator';
import {TransferStackNavigator} from '../features/transfer/navigation/TransferStackNavigator';
import {useTheme} from '../providers/theme';
import {Lexend} from '../theme/lexend';
import {
  TabHomeIcon,
  TabOthersIcon,
  TabPaymentsIcon,
  TabTransferIcon,
  TabWithdrawIcon,
} from './tabIcons';
import {
  OthersTabScreen,
  PaymentsTabScreen,
  WithdrawTabScreen,
} from '../presentation/placeholders/TabSectionPlaceholderScreen';

const TAB_BAR_HEIGHT = 60;

export type MainTabParamList = {
  /** Stack Inicio: `HomeMain` acepta `refreshHome` para forzar recarga al volver desde transferencia. */
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Transfer: undefined;
  Withdraw: undefined;
  Payments: undefined;
  Others: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabBarIconProps = {color: string; size?: number};

const tabBarIconHome = ({color, size}: TabBarIconProps) => (
  <TabHomeIcon color={color} size={size ?? 24} />
);

const tabBarIconTransfer = ({color, size}: TabBarIconProps) => (
  <TabTransferIcon color={color} size={size ?? 24} />
);

const tabBarIconWithdraw = ({color, size}: TabBarIconProps) => (
  <TabWithdrawIcon color={color} size={size ?? 24} />
);

const tabBarIconPayments = ({color, size}: TabBarIconProps) => (
  <TabPaymentsIcon color={color} size={size ?? 24} />
);

const tabBarIconOthers = ({color, size}: TabBarIconProps) => (
  <TabOthersIcon color={color} size={size ?? 24} />
);

function UnmountOnBlur({children}: {children: React.ReactNode}) {
  const isFocused = useIsFocused();

  if (!isFocused) {
    return null;
  }

  return children;
}

function transferStackTabLayout({children}: {children: React.ReactNode}) {
  return <UnmountOnBlur>{children}</UnmountOnBlur>;
}

export function MainTabNavigator() {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarButton = useCallback(
    (props: BottomTabBarButtonProps) => {
      const focused = props.accessibilityState?.selected;
      return (
        <PlatformPressable
          {...props}
          pressOpacity={0.88}
          style={[
            props.style,
            focused && {
              backgroundColor: colors.primary,
              borderRadius: 10,
              marginHorizontal: 4,
            },
          ]}
        />
      );
    },
    [colors.primary],
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarButton,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.borderLight,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 4),
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontFamily: Lexend.semiBold,
          fontSize: 12,
          marginLeft: 4,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          paddingTop: Platform.OS === 'android' ? 4 : 0,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={({route}) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
          const hideTabBar =
            focused === 'CardDetail' ||
            focused === 'InvestmentDetail' ||
            focused === 'LoanDetail' ||
            focused === 'MovementsList' ||
            focused === 'MovementDetail' ||
            focused === 'FrequentPayments';
          return {
            title: 'Inicio',
            tabBarIcon: tabBarIconHome,
            tabBarStyle: hideTabBar
              ? {display: 'none'}
              : {
                  backgroundColor: colors.white,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.borderLight,
                  height: TAB_BAR_HEIGHT + insets.bottom,
                  paddingBottom: Math.max(insets.bottom, 4),
                  paddingTop: 4,
                },
          };
        }}
      />
      <Tab.Screen
        name="Transfer"
        component={TransferStackNavigator}
        layout={transferStackTabLayout}
        options={{
          popToTopOnBlur: true,
          title: 'Transferir',
          tabBarIcon: tabBarIconTransfer,
        }}
      />
      <Tab.Screen
        name="Withdraw"
        component={WithdrawTabScreen}
        options={{
          title: 'Retirar',
          tabBarIcon: tabBarIconWithdraw,
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsTabScreen}
        options={{
          title: 'Pagos',
          tabBarIcon: tabBarIconPayments,
        }}
      />
      <Tab.Screen
        name="Others"
        component={OthersTabScreen}
        options={{
          title: 'Otros',
          tabBarIcon: tabBarIconOthers,
        }}
      />
    </Tab.Navigator>
  );
}
