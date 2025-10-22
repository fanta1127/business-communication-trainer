import { registerRootComponent } from 'expo';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { SessionProvider } from './src/contexts/SessionContext';
import AppNavigator from './src/navigation/AppNavigator';
import { 
  initializeSpeechRecognition, 
  cleanupSpeechRecognition 
} from './src/services/speechService'; // 🆕 追加

export default function App() {
  // 🆕 音声認識の初期化とクリーンアップ
  useEffect(() => {
    console.log('[App] アプリ起動 - 音声認識サービスを初期化');
    
    // アプリ起動時に初期化
    initializeSpeechRecognition();
    
    // アプリ終了時にクリーンアップ
    return () => {
      console.log('[App] アプリ終了 - 音声認識サービスをクリーンアップ');
      cleanupSpeechRecognition();
    };
  }, []);

  return (
    <AuthProvider>
      <SessionProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SessionProvider>
    </AuthProvider>
  );
}

registerRootComponent(App);