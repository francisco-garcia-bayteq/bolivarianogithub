import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {OtpValidationParams} from '../../../navigation/AppNavigator';
import {TransferScreen} from '../presentation/TransferScreen';
import type {TransferReviewRouteParams} from '../presentation/TransferReview/transferReviewTypes';
import {TransferReviewScreen} from '../presentation/TransferReview/TransferReviewScreen';
import {TransferVoucherScreen} from '../presentation/transferResult/TranferVoucherScreen';
import type {TransferDataResume} from '../presentation/transferResult/TransferModalSuccess';
import {TransferInitScreen} from '../presentation/transferInit/TransferInitScreen';
import {OtpValidationScreen} from "../../../presentation/otp";


export type TransferStackParamList = {
  TransferInit: undefined;
  TransferMain: undefined;
  TransferReview: TransferReviewRouteParams;
  OtpValidationTransfer: OtpValidationParams;
  TransferVoucher: {routeSuccessTransactionData: TransferDataResume};
};

const Stack = createNativeStackNavigator<TransferStackParamList>();

export function TransferStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="TransferInit" component={TransferInitScreen} />
      <Stack.Screen name="TransferMain" component={TransferScreen} />
      <Stack.Screen name="TransferReview" component={TransferReviewScreen} />
      <Stack.Screen
        name="OtpValidationTransfer"
        component={OtpValidationScreen}
      />
      <Stack.Screen name="TransferVoucher" component={TransferVoucherScreen} />
    </Stack.Navigator>
  );
}
