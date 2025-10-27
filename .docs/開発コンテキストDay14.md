# 📄 開発コンテキスト - Business Communication Trainer (Day 14用)

**作成日**: 2025年10月27日
**バージョン**: v2.6（履歴機能実装版）
**現在のステータス**: Day 13完了 ✅ + データ保存機能実装完了 ✅ → Day 14準備完了

---

## 📊 プロジェクト基本情報

| 項目 | 内容 |
|------|------|
| **リポジトリ** | https://github.com/fanta1127/business-communication-trainer/ |
| **現在のブランチ** | `day10-development-build` |
| **進捗** | Day 13/21 完了 (61.9%) |
| **次回** | Day 14 - 履歴機能実装 |
| **技術スタック** | React Native + Expo SDK 54 / Firebase / OpenAI API |

---

## 🎯 Day 14: 履歴機能実装

### **目標**
保存されたセッションの一覧表示と詳細表示機能を実装し、ユーザーが過去の練習履歴を振り返り、削除できるようにする。

### **実装内容**
1. **HistoryScreen実装**: セッション一覧表示とPull to Refresh
2. **SessionDetailScreen実装**: セッション詳細表示とフィードバック再表示
3. **削除機能**: セッション削除と確認ダイアログ
4. **エラーハンドリング**: データ取得エラー・削除エラーへの対応
5. **テスト**: 履歴表示・削除機能の動作確認

---

## 🎉 Week 2進捗状況

```
Week 1: 基盤構築 (100%完了!) ✅
├─ Day 1-4: 環境/認証/画面 ✅
├─ Day 5: 場面データ/SessionContext ✅
├─ Day 6: 音声録音機能 ✅
├─ Day 7: 練習画面の完成 ✅
└─ Day 8: OpenAI API（質問生成）✅

Week 2: AI統合 + データ管理 (92.8%完了)
├─ Day 9: ゲストモード廃止 + フィードバックAPI ✅
├─ Day 10: Android Development Build ✅
├─ Day 10.5: iOS実機テスト環境構築 ✅
├─ Day 11: 音声文字起こし機能（Whisper API）✅
├─ Day 12: Firestoreデータモデル ✅
├─ Day 13: データ保存機能 ✅
└─ Day 14: 履歴機能 ⏳ ← 次回

全体進捗: 13/21日 (61.9%)
```

---

## 🎊 Day 13の主要成果（完了）

### ✅ データ保存機能実装完全成功

**達成内容**:
- ✅ FeedbackScreen実装（フィードバック表示）
- ✅ SessionContext保存機能追加（saveSessionToFirestore）
- ✅ 保存ボタン実装（リトライ機能付き）
- ✅ エラーハンドリング（ネットワークエラー・権限エラー）
- ✅ セッション時間計測機能
- ✅ PracticeScreenからFeedbackScreenへの遷移

**GitHubコミット**:
```
コミットID: c12c1c2
メッセージ: [feat] Day 13: データ保存機能実装
```

**実装済み機能**:
```javascript
// src/contexts/SessionContext.js
const saveSessionToFirestore = async () => {
  // ユーザーチェック・データバリデーション
  // Firestore保存
  // エラーハンドリング
};

// src/screens/FeedbackScreen.js
const handleSaveSession = async (retryCount = 0) => {
  // 保存処理
  // リトライ機能（最大2回）
  // 保存成功アラート
};
```

---

## 📂 現在のプロジェクト構造（Day 13完了時点）

```
BusinessTrainer/
├── src/
│   ├── screens/
│   │   ├── PracticeScreen.js ✅ (質問生成・回答入力・フィードバック生成)
│   │   ├── FeedbackScreen.js ✅ (フィードバック表示・保存機能)
│   │   ├── HistoryScreen.js ⏳ Day 14実装予定 ← 次回
│   │   └── SessionDetailScreen.js ⏳ Day 14実装予定 ← 次回
│   ├── contexts/
│   │   └── SessionContext.js ✅ (保存機能実装済み)
│   └── services/
│       └── firestoreService.js ✅ (Day 12で実装完了)
```

---

## 📋 Day 14実装タスク

### **タスク1: HistoryScreen実装（2-3時間）**

#### **1-1. HistoryScreen基本UI作成**

**ファイル**: `src/screens/HistoryScreen.js`

**実装内容**:
```javascript
// src/screens/HistoryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
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

  // 初回読み込み
  useEffect(() => {
    if (user?.uid) {
      fetchSessions();
    }
  }, [user]);

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
              await deleteSession(user.uid, sessionId);

              // 削除後、一覧を更新
              setSessions(prevSessions =>
                prevSessions.filter(session => session.id !== sessionId)
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
          onPress={() => handleDelete(item.id)}
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
        data={sessions}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
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
```

---

### **タスク2: SessionDetailScreen実装（2-3時間）**

#### **2-1. SessionDetailScreen基本UI作成**

**ファイル**: `src/screens/SessionDetailScreen.js`

**実装内容**:
```javascript
// src/screens/SessionDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { deleteSession } from '../services/firestoreService';

export default function SessionDetailScreen({ navigation, route }) {
  const { session } = route.params || {};
  const { user } = useAuth();

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>セッションが見つかりません</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { sceneName, qaList, feedback, duration, createdAt } = session;

  // 日時フォーマット
  const formatDate = (timestamp) => {
    if (!timestamp) return '日時不明';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 時間フォーマット
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  // 削除処理
  const handleDelete = () => {
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
              await deleteSession(user.uid, session.id);
              Alert.alert('削除完了', 'セッションを削除しました。', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('[SessionDetail] 削除エラー:', error);
              Alert.alert('削除エラー', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.sceneName}>{sceneName}</Text>
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#fff" />
              <Text style={styles.metaText}>{formatDate(createdAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#fff" />
              <Text style={styles.metaText}>{formatDuration(duration)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* 質問と回答セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 質問と回答</Text>
            {qaList && qaList.map((qa, index) => (
              <View key={index} style={styles.qaCard}>
                <View style={styles.qaHeader}>
                  <Text style={styles.qaLabel}>
                    {qa.isFixedQuestion ? '📌 固定質問' : '🤖 AI質問'} {index + 1}
                  </Text>
                </View>
                <Text style={styles.questionText}>Q: {qa.questionText}</Text>
                <View style={styles.answerContainer}>
                  <Text style={styles.answerLabel}>A:</Text>
                  <Text style={styles.answerText}>{qa.answerText}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* フィードバックセクション */}
          {feedback && (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>総評</Text>
                <Text style={styles.summaryText}>{feedback.summary}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✅ 良かった点</Text>
                {feedback.goodPoints && feedback.goodPoints.map((point, index) => (
                  <View key={index} style={styles.feedbackCard}>
                    <Text style={styles.pointAspect}>{point.aspect}</Text>
                    {point.quote && (
                      <View style={styles.quoteContainer}>
                        <Text style={styles.quote}>"{point.quote}"</Text>
                      </View>
                    )}
                    <Text style={styles.pointComment}>{point.comment}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 改善のヒント</Text>
                {feedback.improvementPoints && feedback.improvementPoints.map((point, index) => (
                  <View key={index} style={styles.improvementCard}>
                    <Text style={styles.pointAspect}>{point.aspect}</Text>
                    <View style={styles.beforeAfter}>
                      <View style={styles.beforeContainer}>
                        <Text style={styles.beforeLabel}>改善前:</Text>
                        <Text style={styles.beforeText}>{point.original}</Text>
                      </View>
                      <View style={styles.afterContainer}>
                        <Text style={styles.afterLabel}>改善後:</Text>
                        <Text style={styles.afterText}>{point.improved}</Text>
                      </View>
                    </View>
                    <Text style={styles.improvementReason}>{point.reason}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.encouragementCard}>
                <Text style={styles.encouragementIcon}>🌟</Text>
                <Text style={styles.encouragementText}>{feedback.encouragement}</Text>
              </View>
            </>
          )}

          {/* 削除ボタン */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#FF5252" />
            <Text style={styles.deleteButtonText}>このセッションを削除</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    padding: 24,
  },
  sceneName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  qaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  qaHeader: {
    marginBottom: 8,
  },
  qaLabel: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  answerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  improvementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  pointAspect: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  quoteContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  quote: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  pointComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  beforeAfter: {
    marginVertical: 12,
  },
  beforeContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  afterContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
  },
  beforeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 4,
  },
  beforeText: {
    fontSize: 14,
    color: '#333',
  },
  afterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  afterText: {
    fontSize: 14,
    color: '#333',
  },
  improvementReason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
  },
  encouragementCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  encouragementIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  encouragementText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF5252',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## 🧪 テスト項目

### **基本動作テスト**
- [ ] HistoryScreenでセッション一覧が表示される
- [ ] Pull to Refreshで一覧が更新される
- [ ] セッションカードをタップすると詳細画面に遷移する
- [ ] SessionDetailScreenで全情報（質問・回答・フィードバック）が表示される
- [ ] 日時・時間のフォーマットが正しい

### **削除機能テスト**
- [ ] HistoryScreenから削除ボタンをタップすると確認ダイアログが表示される
- [ ] 削除実行後、一覧から削除される
- [ ] SessionDetailScreenから削除できる
- [ ] 削除後、HistoryScreenに戻る
- [ ] Firebase Consoleでデータが削除されている

### **エラーハンドリングテスト**
- [ ] データ取得エラー時に適切なエラーメッセージが表示される
- [ ] 削除エラー時に適切なエラーメッセージが表示される
- [ ] ネットワークエラー時に再試行ボタンが表示される

### **空の状態テスト**
- [ ] セッションがない場合、空の状態メッセージが表示される
- [ ] 「練習を始める」ボタンでHomeScreenに遷移する

### **UI/UXテスト**
- [ ] スクロールが正常に動作する
- [ ] ローディングインジケーターが表示される
- [ ] カードのデザインが見やすい
- [ ] アイコンが適切に表示される

---

## ⏱️ 所要時間

| タスク | 時間 |
|--------|------|
| **HistoryScreen UI実装** | 2時間 |
| **SessionDetailScreen UI実装** | 2時間 |
| **削除機能実装** | 1時間 |
| **Pull to Refresh実装** | 0.5時間 |
| **日時フォーマット実装** | 0.5時間 |
| **テスト（表示・削除）** | 1時間 |
| **デバッグ** | 0.5時間 |
| **合計** | 約7.5時間 |

---

## 🔧 Day 14完了基準

### ✅ 実装チェックリスト

#### **HistoryScreen実装**
- [ ] HistoryScreen.js作成
- [ ] セッション一覧表示実装
- [ ] Pull to Refresh実装
- [ ] 削除ボタン実装
- [ ] 空の状態表示実装
- [ ] エラー表示実装

#### **SessionDetailScreen実装**
- [ ] SessionDetailScreen.js作成
- [ ] セッション詳細表示実装
- [ ] 質問と回答表示実装
- [ ] フィードバック表示実装
- [ ] 削除ボタン実装

#### **削除機能**
- [ ] 削除確認ダイアログ実装
- [ ] 削除処理実装
- [ ] 削除後のUI更新

#### **テスト**
- [ ] セッション一覧表示テスト成功
- [ ] セッション詳細表示テスト成功
- [ ] 削除機能テスト成功
- [ ] Firebase Consoleでデータ確認

---

## 📝 重要な技術パターン

### **Firestoreからのデータ取得**

```javascript
// HistoryScreen.js
import { getUserSessions } from '../services/firestoreService';

const fetchSessions = async () => {
  try {
    const fetchedSessions = await getUserSessions(user.uid);
    setSessions(fetchedSessions);
  } catch (error) {
    console.error('取得エラー:', error);
    setError(error.message);
  }
};
```

### **Pull to Refresh**

```javascript
import { RefreshControl } from 'react-native';

const onRefresh = useCallback(() => {
  setRefreshing(true);
  fetchSessions();
}, []);

<FlatList
  data={sessions}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
/>
```

### **削除機能**

```javascript
import { deleteSession } from '../services/firestoreService';

const handleDelete = async (sessionId) => {
  Alert.alert(
    'セッション削除',
    'このセッションを削除してもよろしいですか？',
    [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(user.uid, sessionId);
          setSessions(prev => prev.filter(s => s.id !== sessionId));
        },
      },
    ]
  );
};
```

---

## 🚀 次回（Day 15）予定

### **Day 15: 統計・分析機能**
- 練習回数グラフ
- 場面別統計
- 成長トレンド表示
- 週間・月間レポート

---

## 🎓 これまでの学習成果

### **Week 1-2で習得した技術**

1. **React Native + Expo開発**
   - コンポーネント設計 ✅
   - Navigation ✅
   - Context API ✅
   - Hooks（useState, useEffect, useRef, useCallback）✅

2. **Firebase統合**
   - Authentication ✅
   - Cloud Functions ✅
   - Firestore CRUD操作 ✅

3. **OpenAI API活用**
   - gpt-4o-mini（質問生成・フィードバック生成）✅
   - Whisper API（音声文字起こし）✅

4. **ネイティブ機能**
   - 音声録音（expo-av）✅
   - ファイルシステム（expo-file-system）✅
   - 権限管理 ✅

5. **データ管理**
   - Firestore CRUD操作 ✅
   - セキュリティルール ✅
   - データバリデーション ✅
   - データ保存・取得 ✅

---

## 📞 開発サポート情報

### **リポジトリ**
- GitHub: https://github.com/fanta1127/business-communication-trainer/
- ブランチ: `day10-development-build`
- 最新コミット: `c12c1c2`

### **ドキュメント**
- Expo: https://docs.expo.dev/
- Firebase: https://firebase.google.com/docs
- Firestore: https://firebase.google.com/docs/firestore
- React Navigation: https://reactnavigation.org/docs/getting-started

### **ビルド情報**
- EAS Project ID: `d8957a17-7f57-454d-b344-0c7202fd1168`
- Android Build ID: `c9c92a50-6a10-4ef9-8c27-21b37614c7d2`
- iOS: Xcode Local Build（無料Personal Team）

### **デバイス情報**
- Android: 実機テスト成功 ✅
- iOS: 実機テスト成功 ✅
- Bundle ID: `com.fanta1127.businesstrainer`

---

## 🎯 Day 14開始準備チェックリスト

### **環境確認**

```bash
# プロジェクトに移動
cd ~/Desktop/Coding_Practice/Expo-app/BusinessTrainer

# ブランチ確認
git branch
# day10-development-build

# 最新コードを確認
git status
git log --oneline -5
```

### **前提条件確認**

Day 14を開始する前に、以下が完了していることを確認:
- ✅ Day 13完了（データ保存機能実装済み）
- ✅ FeedbackScreen実装済み
- ✅ SessionContext保存機能実装済み
- ✅ firestoreService.js実装済み（getUserSessions, deleteSession関数）
- ✅ Firebase Console でセッションデータ確認済み

---

## ✨ Week 2の目標（Day 14実施時点）

### **完了項目** ✅
- [x] Day 9: ゲストモード廃止 + フィードバックAPI
- [x] Day 10: Android Development Build
- [x] Day 10.5: iOS実機テスト環境構築
- [x] Day 11: 音声文字起こし機能（Whisper API）
- [x] Day 12: Firestoreデータモデル
- [x] Day 13: データ保存機能

### **今週の残りタスク** ⏳
- [ ] Day 14: 履歴機能 ← 次回

### **Week 2終了時の目標**
```
✅ AI機能完全統合（質問生成・フィードバック・文字起こし）
✅ Android/iOS両対応
✅ Firestoreデータモデル構築
✅ データ保存機能
⏳ 履歴機能
⏳ エンドツーエンドで動作
```

---

## 🚀 Day 14: 履歴機能実装へ！

**保存されたセッションを一覧表示し、詳細を確認・削除できる機能を実装します！**

ユーザーが過去の練習を振り返り、成長を実感できるようになります。

**履歴機能を実現しましょう！** 🎯

---

**最終更新**: Day 13完了（2025年10月27日）
**次回作業**: Day 14 - 履歴機能実装
**Week 2目標**: データ管理完全実装へ
