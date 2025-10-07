// src/screens/FeedbackScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  // SafeAreaView を削除
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';  // 追加
import { useAuth } from '../contexts/AuthContext';

export default function FeedbackScreen({ navigation, route }) {
  const { scene, answers } = route.params || {};
  const { user, isGuest, logout } = useAuth();

  // 仮のフィードバックデータ（後でAIが生成）
  const feedback = {
    summary: '全体的に具体的な説明ができており、良い報告でした。さらに改善できる点もいくつかあります。',
    goodPoints: [
      {
        aspect: '具体性',
        quote: 'ECサイトの決済機能を実装中',
        comment: 'プロジェクト名を明確に示していて良い',
      },
      {
        aspect: '問題認識',
        quote: 'APIエラーで遅延',
        comment: '課題を明確に把握できている',
      },
    ],
    improvementPoints: [
      {
        aspect: '論理構造',
        original: '遅延しています',
        improved: '予定より3日遅延していますが、全体スケジュールへの影響は最小限です',
        reason: '影響範囲まで伝えると安心感を与えられます',
      },
      {
        aspect: '解決策の提示',
        original: '対策を検討中です',
        improved: 'API提供元に問い合わせ中で、明日までに回答を得る予定です',
        reason: '具体的なアクションと期限を示すと信頼感が増します',
      },
    ],
    encouragement: '素晴らしいスタートです！練習を重ねることで、さらに説得力のある報告ができるようになります。',
  };

  const handleSaveSession = () => {
    if (isGuest) {
      // ゲストモードの場合は、ログアウトして認証画面に戻る
      // AppNavigatorが自動的にAuthNavigatorに切り替わり、Signup画面に誘導できる
      logout();
    } else {
      // セッションを保存（後で実装）
      console.log('セッションを保存します');
      navigation.navigate('History');
    }
  };

  const handleRetry = () => {
    navigation.navigate('SceneSelection');
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>お疲れ様でした！</Text>
          <Text style={styles.sceneIcon}>{scene?.icon || '📊'}</Text>
          <Text style={styles.sceneName}>{scene?.name || '練習'}</Text>
        </View>

        <View style={styles.content}>
          {/* サマリー */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>総評</Text>
            <Text style={styles.summaryText}>{feedback.summary}</Text>
          </View>

          {/* 良かった点 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ 良かった点</Text>
            {feedback.goodPoints.map((point, index) => (
              <View key={index} style={styles.pointCard}>
                <Text style={styles.pointAspect}>{point.aspect}</Text>
                <View style={styles.quoteContainer}>
                  <Text style={styles.quote}>"{point.quote}"</Text>
                </View>
                <Text style={styles.pointComment}>{point.comment}</Text>
              </View>
            ))}
          </View>

          {/* 改善点 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 改善のヒント</Text>
            {feedback.improvementPoints.map((point, index) => (
              <View key={index} style={styles.improvementCard}>
                <Text style={styles.pointAspect}>{point.aspect}</Text>
                
                <View style={styles.beforeAfter}>
                  <View style={styles.beforeContainer}>
                    <Text style={styles.beforeAfterLabel}>Before</Text>
                    <Text style={styles.beforeText}>"{point.original}"</Text>
                  </View>
                  
                  <View style={styles.arrow}>
                    <Text>→</Text>
                  </View>
                  
                  <View style={styles.afterContainer}>
                    <Text style={styles.beforeAfterLabel}>After</Text>
                    <Text style={styles.afterText}>"{point.improved}"</Text>
                  </View>
                </View>
                
                <Text style={styles.improvementReason}>{point.reason}</Text>
              </View>
            ))}
          </View>

          {/* 励まし */}
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementIcon}>🌟</Text>
            <Text style={styles.encouragementText}>{feedback.encouragement}</Text>
          </View>
        </View>

        {/* アクションボタン */}
        <View style={styles.actions}>
          {isGuest ? (
            <View style={styles.guestNotice}>
              <Text style={styles.guestNoticeText}>
                ログインして履歴を保存しましょう
              </Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleSaveSession}
              >
                <Text style={styles.primaryButtonText}>アカウントを作成</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleSaveSession}
            >
              <Text style={styles.primaryButtonText}>履歴に保存</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleRetry}
          >
            <Text style={styles.secondaryButtonText}>別の場面を選ぶ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.textButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.textButtonText}>ホームへ戻る</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// スタイルは変更なし（省略）
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  sceneIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  sceneName: {
    fontSize: 18,
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pointCard: {
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
  beforeAfterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  beforeText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  afterText: {
    fontSize: 14,
    color: '#388e3c',
  },
  arrow: {
    alignItems: 'center',
    marginVertical: 4,
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
  actions: {
    padding: 16,
  },
  guestNotice: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  guestNoticeText: {
    fontSize: 14,
    color: '#f57c00',
    textAlign: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textButton: {
    padding: 16,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#666',
    fontSize: 16,
  },
});