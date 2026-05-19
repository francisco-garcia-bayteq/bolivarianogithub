import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {AccountMovement} from '../domain/entities/AccountMovement';
import {TransactionsScreen} from '../presentation/transactions/TransactionsScreen';
import {MovementDetailScreen} from '../presentation/transactions/MovementDetailScreen';

/** Params compartidos con `HomeStackParamList.MovementsList` (misma pantalla, otro stack). */
export type MovementsListRouteParams =
  | {
      accountGuid?: string;
      /** Dispara reset de filtros al cambiar (p. ej. entrada desde tab o Inicio). */
      resetFilters?: number;
    }
  | undefined;

export type MovementsStackParamList = {
  MovementsList: MovementsListRouteParams;
  MovementDetail: {movement: AccountMovement};
};

const Stack = createNativeStackNavigator<MovementsStackParamList>();

export function MovementsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="MovementsList" component={TransactionsScreen} />
      <Stack.Screen name="MovementDetail" component={MovementDetailScreen} />
    </Stack.Navigator>
  );
}
