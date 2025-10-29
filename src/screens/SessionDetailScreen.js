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
              await deleteSession(session.sessionId, user.uid);
              navigation.goBack();
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
