// src/navigation/AppNavigator.js
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// 認証画面
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// メイン画面
import HomeScreen from '../screens/HomeScreen';
import SceneSelectionScreen from '../screens/SceneSelectionScreen';
import PracticeScreen from '../screens/PracticeScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 認証前のナビゲーター
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// ホームタブのスタックナビゲーター
function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ 
          title: 'ホーム',
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="SceneSelection" 
        component={SceneSelectionScreen}
        options={{ title: '場面選択' }}
      />
      <Stack.Screen 
        name="Practice" 
        component={PracticeScreen}
        options={{ title: '練習中' }}
      />
      <Stack.Screen 
        name="Feedback" 
        component={FeedbackScreen}
        options={{ 
          title: 'フィードバック',
          headerLeft: null, // 戻るボタンを非表示
        }}
      />
    </Stack.Navigator>
  );
}

// 履歴タブのスタックナビゲーター
function HistoryStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HistoryScreen" 
        component={HistoryScreen}
        options={{ 
          title: '練習履歴',
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="SessionDetail" 
        component={SessionDetailScreen}
        options={{ title: 'セッション詳細' }}
      />
    </Stack.Navigator>
  );
}

// メインのタブナビゲーター
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // タブナビゲーターのヘッダーは非表示
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{ title: 'ホーム' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryStackNavigator}
        options={{ title: '履歴' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'プロフィール',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Tab.Navigator>
  );
}

// メインナビゲーター
export default function AppNavigator() {
  const { user, loading, isGuest } = useAuth();

  // 認証状態をチェック中
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // ユーザーがログインしているか、ゲストモードの場合はメイン画面
  // それ以外は認証画面
  return user || isGuest ? <MainTabNavigator /> : <AuthNavigator />;
}