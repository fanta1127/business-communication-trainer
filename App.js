// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { SessionProvider } from './src/contexts/SessionContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SessionProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SessionProvider>
      </AuthProvider> 
    </SafeAreaProvider>  
  );
}