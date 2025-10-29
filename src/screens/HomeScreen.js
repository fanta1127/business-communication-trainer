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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    paddingTop: 40,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  startButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    marginTop: 32,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoItem: {
    fontSize: 16,
    color: '#1A1A1A',
    marginVertical: 6,
    marginLeft: 8,
    lineHeight: 24,
  },
});