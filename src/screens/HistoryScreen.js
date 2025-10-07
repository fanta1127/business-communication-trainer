// src/screens/HistoryScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function HistoryScreen({ navigation }) {
  const { isGuest, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // 仮の履歴データ（後でFirestoreから取得）
  const [sessions, setSessions] = useState([
    {
      id: '1',
      sceneName: '週次報告会議',
      sceneIcon: '📊',
      date: '2025年10月7日 10:30',
      duration: '8分',
      questionCount: 4,
    },
    {
      id: '2',
      sceneName: 'プロジェクト提案',
      sceneIcon: '💡',
      date: '2025年10月6日 14:15',
      duration: '10分',
      questionCount: 5,
    },
    {
      id: '3',
      sceneName: '顧客へのプレゼン',
      sceneIcon: '🎯',
      date: '2025年10月5日 09:45',
      duration: '7分',
      questionCount: 3,
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // 履歴を再取得する処理（後で実装）
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleSessionPress = (session) => {
    // SessionDetailScreenへ遷移
    navigation.navigate('SessionDetail', { session });
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>練習履歴</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>履歴機能を使用するには</Text>
          <Text style={styles.emptyText}>
            アカウント登録が必要です
          </Text>
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={logout}
          >
            <Text style={styles.signupButtonText}>アカウントを作成</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 履歴がない場合
  if (!sessions || sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>練習履歴</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.emptyScrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>まだ練習履歴がありません</Text>
            <Text style={styles.emptyText}>
              練習を開始すると、ここに履歴が表示されます
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 履歴がある場合
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>練習履歴</Text>
        <Text style={styles.headerSubtitle}>
          {sessions.length}件のセッション
        </Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
      >
        <View style={styles.sessionsList}>
          {sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => handleSessionPress(session)}
              activeOpacity={0.7}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionIconContainer}>
                  <Text style={styles.sessionIcon}>{session.sceneIcon}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{session.sceneName}</Text>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                </View>
              </View>
              
              <View style={styles.sessionStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⏱</Text>
                  <Text style={styles.statText}>{session.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>💬</Text>
                  <Text style={styles.statText}>{session.questionCount}問</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  sessionsList: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sessionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionIcon: {
    fontSize: 24,
  },
  sessionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  arrowContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  arrow: {
    fontSize: 24,
    color: '#999',
  },
  emptyScrollContainer: {
    flex: 1,
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
    marginBottom: 20,
  },
  signupButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});