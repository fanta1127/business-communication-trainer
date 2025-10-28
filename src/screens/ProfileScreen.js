// src/screens/ProfileScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../services/authService';
import { getUserStatistics, formatTotalDuration } from '../services/statisticsService';
import StatisticsCard from '../components/StatisticsCard';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchStatistics = async () => {
        if (!user?.uid) {
          setStatsLoading(false);
          return;
        }

        try {
          setStatsLoading(true);
          setStatsError(null);
          const stats = await getUserStatistics(user.uid);
          setStatistics(stats);
        } catch (error) {
          console.error('[ProfileScreen] 統計取得エラー:', error);
          setStatsError(error.message);
        } finally {
          setStatsLoading(false);
        }
      };

      fetchStatistics();
    }, [user])
  );

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      '本当にログアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await logOut();
            } catch (error) {
              Alert.alert('エラー', 'ログアウトに失敗しました');
            }
          },
        },
      ]
    );
  };

  const renderWeeklyComparison = () => {
    if (!statistics) return null;

    const { thisWeek, lastWeek } = statistics.weeklyStats;
    const diff = thisWeek - lastWeek;
    let subtitle = '';

    if (diff > 0) {
      subtitle = `先週より+${diff}回`;
    } else if (diff < 0) {
      subtitle = `先週より${diff}回`;
    } else if (lastWeek > 0) {
      subtitle = '先週と同じ';
    }

    return (
      <StatisticsCard
        icon="calendar"
        iconColor="#4CAF50"
        title="今週の練習回数"
        value={`${thisWeek}回`}
        subtitle={subtitle}
      />
    );
  };

  const renderSceneStats = () => {
    if (!statistics || !statistics.sceneStats || statistics.sceneStats.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>場面別統計</Text>
        {statistics.sceneStats.map((scene) => {
          const lastPracticedText = scene.lastPracticed
            ? new Date(scene.lastPracticed).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
              })
            : '未実施';

          return (
            <View key={scene.sceneId} style={styles.sceneCard}>
              <View style={styles.sceneInfo}>
                <Text style={styles.sceneName}>{scene.sceneName}</Text>
                <Text style={styles.sceneDate}>最終: {lastPracticedText}</Text>
              </View>
              <View style={styles.sceneCount}>
                <Text style={styles.sceneCountText}>{scene.count}</Text>
                <Text style={styles.sceneCountLabel}>回</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderRecentActivity = () => {
    if (!statistics || !statistics.recentActivity || statistics.recentActivity.length === 0) {
      return null;
    }

    const maxCount = Math.max(...statistics.recentActivity.map((a) => a.count), 1);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>最近7日間の活動</Text>
        <View style={styles.activityChart}>
          {statistics.recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityBar}>
              <View style={styles.activityBarContainer}>
                <View
                  style={[
                    styles.activityBarFill,
                    {
                      height: activity.count > 0 ? `${(activity.count / maxCount) * 100}%` : '2%',
                      backgroundColor: activity.count > 0 ? '#2196F3' : '#e0e0e0',
                    },
                  ]}
                />
              </View>
              <Text style={styles.activityDate}>{activity.date}</Text>
              <Text style={styles.activityCount}>{activity.count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* プロフィールセクション */}
      <View style={styles.profileSection}>
        <Text style={styles.title}>プロフィール</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>名前</Text>
          <Text style={styles.value}>{user?.displayName || '未設定'}</Text>

          <Text style={styles.label}>メールアドレス</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
      </View>

      {/* 統計セクション */}
      <View style={styles.statsSection}>
        <Text style={styles.title}>練習統計</Text>

        {statsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>統計データを読み込み中...</Text>
          </View>
        ) : statsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>統計データの取得に失敗しました</Text>
            <Text style={styles.errorDetail}>{statsError}</Text>
          </View>
        ) : statistics && statistics.totalSessions > 0 ? (
          <View style={styles.statsContent}>
            {/* 総練習回数 */}
            <StatisticsCard
              icon="trophy"
              iconColor="#FFB300"
              title="総練習回数"
              value={`${statistics.totalSessions}回`}
            />

            {/* 総練習時間 */}
            <StatisticsCard
              icon="time"
              iconColor="#2196F3"
              title="総練習時間"
              value={formatTotalDuration(statistics.totalDuration)}
            />

            {/* 平均所要時間 */}
            <StatisticsCard
              icon="speedometer"
              iconColor="#9C27B0"
              title="平均所要時間"
              value={formatTotalDuration(statistics.averageDuration)}
              subtitle="1セッションあたり"
            />

            {/* 今週の練習回数 */}
            {renderWeeklyComparison()}

            {/* 最近7日間の活動 */}
            {renderRecentActivity()}

            {/* 場面別統計 */}
            {renderSceneStats()}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>まだ練習履歴がありません</Text>
            <Text style={styles.emptySubtext}>練習を始めると、ここに統計が表示されます</Text>
          </View>
        )}
      </View>

      {/* ログアウトボタン */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>ログアウト</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  statsContent: {
    marginTop: 10,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sceneCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sceneInfo: {
    flex: 1,
  },
  sceneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sceneDate: {
    fontSize: 12,
    color: '#999',
  },
  sceneCount: {
    alignItems: 'center',
    minWidth: 50,
  },
  sceneCountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  sceneCountLabel: {
    fontSize: 12,
    color: '#666',
  },
  activityChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 4,
  },
  activityBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activityBarContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  activityBarFill: {
    width: '80%',
    borderRadius: 4,
    minHeight: 2,
  },
  activityDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  activityCount: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
