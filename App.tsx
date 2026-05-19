import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AppNavigator} from './src/navigation/AppNavigator';
import {DIProvider} from './src/di';
import {AuthProvider, SecurityProvider, SessionTimeoutProvider} from './src/providers';
import {ThemeProvider} from './src/providers';
import {TlsPinningBootstrap} from './src/presentation/TlsPinningBootstrap';
import {ErrorBoundary} from "react-error-boundary";
import {BoundaryAppFallback} from "./src/presentation/boundary/BoundaryAppFallback.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <ErrorBoundary fallbackRender={BoundaryAppFallback}>
      <DIProvider>
        <QueryClientProvider client={queryClient}>
          <TlsPinningBootstrap />
          <SecurityProvider>
            <AuthProvider>
              <SessionTimeoutProvider>
                <ThemeProvider>
                  <SafeAreaProvider>
                    <KeyboardProvider>
                      <NavigationContainer>
                        <AppNavigator />
                      </NavigationContainer>
                    </KeyboardProvider>
                  </SafeAreaProvider>
                </ThemeProvider>
              </SessionTimeoutProvider>
            </AuthProvider>
          </SecurityProvider>
        </QueryClientProvider>
      </DIProvider>
    </ErrorBoundary>
  );
}

export default App;
