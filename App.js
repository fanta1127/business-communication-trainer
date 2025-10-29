import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { SessionProvider } from './src/contexts/SessionContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <>
      <AuthProvider>
        <SessionProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SessionProvider>
      </AuthProvider>
      <Toast />
    </>
  );
}

registerRootComponent(App);