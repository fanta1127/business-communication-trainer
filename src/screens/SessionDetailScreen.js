// src/screens/SessionDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 

export default function SessionDetailScreen({ navigation, route }) {
  const { session } = route.params || {};

  // セッションデータを安全にマージ
  const mockSession = {
    id: session?.id || '1',
    sceneName: session?.sceneName || '週次報告会議',
    sceneIcon: session?.sceneIcon || '📊',
    date: session?.date || '2025年10月7日 10:30',
    duration: session?.duration || '8分',
    questions: session?.questions || [
      {
        question: '今週の進捗状況と、現在直面している課題を具体的に説明してください',
        answer: 'ECサイトの決済機能を実装中です。APIエラーで3日遅延しています。',
      },
      {
        question: 'その課題に対して、どのような対策を考えていますか？',
        answer: '対策を検討中です。API提供元に問い合わせる予定です。',
      },
      {
        question: 'チームメンバーとの連携はうまくいっていますか？',
        answer: 'はい、毎日スタンドアップミーティングで情報共有しています。',
      },
    ],
    feedback: session?.feedback || {
      summary: '全体的に具体的な説明ができており、良い報告でした。',
      goodPoints: ['具体性', '問題認識'],
      improvementPoints: ['論理構造', '解決策の提示'],
    },
  };

  const handleDelete = () => {
    Alert.alert(
      '削除確認',
      'このセッションを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: () => {
            // 削除処理（後で実装）
            console.log('セッション削除');
            navigation.goBack();
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.sceneIcon}>{mockSession.sceneIcon}</Text>
          <Text style={styles.sceneName}>{mockSession.sceneName}</Text>
          <Text style={styles.date}>{mockSession.date}</Text>
          <Text style={styles.duration}>所要時間: {mockSession.duration}</Text>
        </View>

        <View style={styles.content}>
          {/* Q&A履歴 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>質問と回答</Text>
            {mockSession.questions.map((qa, index) => (
              <View key={index} style={styles.qaCard}>
                <View style={styles.questionContainer}>
                  <Text style={styles.qaLabel}>Q{index + 1}</Text>
                  <Text style={styles.questionText}>{qa.question}</Text>
                </View>
                <View style={styles.answerContainer}>
                  <Text style={styles.qaLabel}>A</Text>
                  <Text style={styles.answerText}>{qa.answer}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* フィードバックサマリー */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>フィードバック</Text>
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackSummary}>{mockSession.feedback.summary}</Text>
              
              <View style={styles.feedbackPoints}>
                <Text style={styles.pointsLabel}>✅ 良かった点</Text>
                {mockSession.feedback.goodPoints.map((point, index) => (
                  <Text key={index} style={styles.pointItem}>• {point}</Text>
                ))}
              </View>
              
              <View style={styles.feedbackPoints}>
                <Text style={styles.pointsLabel}>💡 改善点</Text>
                {mockSession.feedback.improvementPoints.map((point, index) => (
                  <Text key={index} style={styles.pointItem}>• {point}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>削除</Text>
          </TouchableOpacity>
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
    padding: 24,
    alignItems: 'center',
  },
  sceneIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  sceneName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  answerContainer: {
    flexDirection: 'row',
  },
  qaLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: 12,
    width: 24,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  answerText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  feedbackSummary: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  feedbackPoints: {
    marginBottom: 12,
  },
  pointsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pointItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 8,
    marginBottom: 4,
  },
  actions: {
    padding: 16,
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});