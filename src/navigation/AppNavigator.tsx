import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoginScreen} from '../presentation/auth/LoginScreen';
import {MainTabNavigator} from './MainTabNavigator';
import {SplashScreen} from '../presentation/splash';
import {BiometricOfferScreen} from '../presentation/auth/BiometricOfferScreen';
import {RegisterAliasScreen} from '../presentation/auth/RegisterAliasScreen';
import {useAuth} from '../providers';
import {User} from '../domain/entities/User';

export type OtpValidationParams = {mode: 'transfer'; email: string};

export type RootStackParamList = {
  CertificateHandshake: undefined;
  Login: undefined;
  RegisterAlias: {user: User; email: string};
  BiometricOffer: {user: User; email: string};
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const {isAuthenticated, isLoading} = useAuth();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isSplashVisible || isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator  screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RegisterAlias" component={RegisterAliasScreen} />
          <Stack.Screen name="BiometricOffer" component={BiometricOfferScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
