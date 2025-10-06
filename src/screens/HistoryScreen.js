// src/screens/HistoryScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function HistoryScreen() {
  const { isGuest } = useAuth();

  if (isGuest) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>履歴機能を使用するには</Text>
          <Text style={styles.emptyText}>
            アカウント登録が必要です
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>まだ練習履歴がありません</Text>
        <Text style={styles.emptyText}>
          練習を開始すると、ここに履歴が表示されます
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});