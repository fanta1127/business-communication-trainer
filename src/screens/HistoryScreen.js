// src/screens/HistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getUserSessions, deleteSession } from '../services/firestoreService';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // セッション一覧を取得
  const fetchSessions = async () => {
    try {
      setError(null);
      console.log('[History] セッション一覧取得開始');

      const fetchedSessions = await getUserSessions(user.uid);
      setSessions(fetchedSessions);

      console.log('[History] セッション取得成功:', fetchedSessions.length);
    } catch (error) {
      console.error('[History] セッション取得エラー:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 画面フォーカス時に読み込み
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        fetchSessions();
      }
    }, [user])
  );

  // Pull to Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSessions();
  }, []);

  // セッション削除
  const handleDelete = async (sessionId) => {
    Alert.alert(
      'セッション削除',
      'このセッションを削除してもよろしいですか？\n\nこの操作は取り消せません。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[History] セッション削除:', sessionId);
              await deleteSession(sessionId, user.uid);

              // 削除後、一覧を更新
              setSessions(prevSessions =>
                prevSessions.filter(session => session.sessionId !== sessionId)
              );

              Alert.alert('削除完了', 'セッションを削除しました。');
            } catch (error) {
              console.error('[History] 削除エラー:', error);
              Alert.alert('削除エラー', error.message);
            }
          },
        },
      ]
    );
  };

  // セッション詳細画面へ遷移
  const handleSessionPress = (session) => {
    navigation.navigate('SessionDetail', { session });
  };

  // 日時フォーマット
  const formatDate = (timestamp) => {
    if (!timestamp) return '日時不明';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `今日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (diffDays === 1) {
      return `昨日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  // 時間フォーマット（秒 → 分:秒）
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // セッションカードのレンダリング
  const renderSessionCard = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => handleSessionPress(item)}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sceneName}>{item.sceneName}</Text>
        <TouchableOpacity
          onPress={() => handleDelete(item.sessionId)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>

      <View style={styles.sessionInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="hourglass-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{formatDuration(item.duration)}</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="chatbubbles-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.qaList?.length || 0}問</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ローディング表示
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>履歴を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // エラー表示
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
          <Text style={styles.errorText}>データの取得に失敗しました</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSessions}>
            <Text style={styles.retryButtonText}>再試行</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 空の状態
  if (sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>まだ練習履歴がありません</Text>
          <Text style={styles.emptySubText}>
            練習を完了してフィードバックを保存すると、{'\n'}
            ここに履歴が表示されます
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.startButtonText}>練習を始める</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // セッション一覧表示
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>練習履歴</Text>
        <Text style={styles.headerSubtitle}>{sessions.length}件のセッション</Text>
      </View>

      <FlatList
        style={styles.flatListStyle}
        data={sessions}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.sessionId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
  },
  flatListStyle: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  errorDetail: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    marginTop: 24,
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sceneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  sessionInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});
