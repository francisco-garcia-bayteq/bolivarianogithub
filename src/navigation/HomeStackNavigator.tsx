import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {
  FrequentPayment,
  InvestmentBalance,
  LoanBalance,
} from '../domain/entities/ContractBalance';
import type {AccountMovement} from '../domain/entities/AccountMovement';
import {HomeScreen} from '../presentation/home/HomeScreen';
import {CardDetailScreen} from '../presentation/cardDetail/CardDetailScreen';
import {InvestmentDetailScreen} from '../presentation/investmentDetail/InvestmentDetailScreen';
import {LoanDetailScreen} from '../presentation/loanDetail/LoanDetailScreen';
import {TransactionsScreen} from '../presentation/transactions/TransactionsScreen';
import {MovementDetailScreen} from '../presentation/transactions/MovementDetailScreen';
import type {MovementsListRouteParams} from './MovementsStackNavigator';
import {FrequentPaymentsScreen} from '../presentation/frequentPayments/FrequentPaymentsScreen';

export type HomeStackParamList = {
  HomeMain: {refreshHome?: number} | undefined;
  CardDetail: {maskedCardNumber: string};
  InvestmentDetail: {
    investmentGuid: string;
    /** Snapshot desde Home para el primer render sin depender solo del caché de React Query. */
    investmentBalance?: InvestmentBalance;
  };
  LoanDetail: {
    loanGuid: string;
    loanBalance?: LoanBalance;
  };
  MovementsList: MovementsListRouteParams;
  MovementDetail: {movement: AccountMovement};
  FrequentPayments: {
    items: FrequentPayment[];
    initialIndex: number;
  };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} />
      <Stack.Screen
        name="InvestmentDetail"
        component={InvestmentDetailScreen}
      />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
      <Stack.Screen name="MovementsList" component={TransactionsScreen} />
      <Stack.Screen name="MovementDetail" component={MovementDetailScreen} />
      <Stack.Screen
        name="FrequentPayments"
        component={FrequentPaymentsScreen}
      />
    </Stack.Navigator>
  );
}
