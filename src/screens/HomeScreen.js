// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, isGuest } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>
          ようこそ、{isGuest ? 'ゲスト' : user?.displayName || 'ユーザー'}さん！
        </Text>
        <Text style={styles.subtitle}>
          ビジネスコミュニケーションスキルを磨きましょう
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => {
          // TODO: Day 5で場面選択画面への遷移を実装
          alert('場面選択画面は Day 5 で実装します');
        }}
      >
        <Text style={styles.startButtonText}>練習を始める</Text>
      </TouchableOpacity>

      {isGuest && (
        <View style={styles.guestNotice}>
          <Text style={styles.guestNoticeText}>
            ⚠️ ゲストモードでは練習履歴が保存されません
          </Text>
          <Text style={styles.guestNoticeSubtext}>
            アカウント登録で履歴を記録できます
          </Text>
        </View>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    backgroundColor: '#2196F3',
    padding: 30,
    paddingTop: 40,
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
  guestNotice: {
    backgroundColor: '#FFF3CD',
    margin: 20,
    marginTop: 0,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  guestNoticeText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
    marginBottom: 5,
  },
  guestNoticeSubtext: {
    fontSize: 12,
    color: '#856404',
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