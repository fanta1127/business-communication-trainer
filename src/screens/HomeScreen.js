// src/screens/HomeScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>
            ようこそ、{user?.displayName || 'ユーザー'}さん！
          </Text>
          <Text style={styles.subtitle}>
            ビジネスコミュニケーションスキルを磨きましょう
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => {
            // SceneSelectionScreenへ遷移
            navigation.navigate('SceneSelection');
          }}
        >
          <Text style={styles.startButtonText}>練習を始める</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>このアプリについて</Text>
          <Text style={styles.infoText}>
            4つのビジネスシーンで練習できます：
          </Text>
          <Text style={styles.infoItem}>📊 週次報告会議</Text>
          <Text style={styles.infoItem}>💡 プロジェクト提案</Text>
          <Text style={styles.infoItem}>🔧 問題解決の議論</Text>
          <Text style={styles.infoItem}>🎯 顧客へのプレゼン</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  welcomeSection: {
    backgroundColor: '#2196F3',
    padding: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
    marginLeft: 10,
  },
});