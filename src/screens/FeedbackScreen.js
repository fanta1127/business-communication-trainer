// src/screens/FeedbackScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/SessionContext';

export default function FeedbackScreen({ navigation }) {
  const { currentSession, resetSession, saveSessionToFirestore, saving } = useSession();

  // セッションデータが存在しない場合の処理
  if (!currentSession || !currentSession.feedback) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>フィードバックデータがありません</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              resetSession();
              navigation.navigate('Home');
            }}
          >
            <Text style={styles.primaryButtonText}>ホームに戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const feedback = currentSession.feedback;
  const sceneName = currentSession.sceneName;

  /**
   * セッションを保存（リトライ機能付き）
   */
  const handleSaveSession = async (retryCount = 0) => {
    const MAX_RETRIES = 2;

    try {
      const sessionId = await saveSessionToFirestore();

      Alert.alert(
        '保存完了',
        'セッションを保存しました。\n履歴から確認できます。',
        [
          {
            text: '履歴を見る',
            onPress: () => {
              resetSession();
              navigation.navigate('History');
            },
          },
          {
            text: 'OK',
            style: 'cancel',
          }
        ]
      );
    } catch (error) {
      console.error('[FeedbackScreen] Save error:', error);

      if (retryCount < MAX_RETRIES) {
        // リトライを提案
        Alert.alert(
          '保存エラー',
          `セッションの保存に失敗しました。\n\n${error.message}\n\nもう一度試しますか？`,
          [
            {
              text: 'キャンセル',
              style: 'cancel',
            },
            {
              text: 'リトライ',
              onPress: () => handleSaveSession(retryCount + 1),
            }
          ]
        );
      } else {
        // 最大リトライ回数に達した
        Alert.alert(
          '保存エラー',
          `セッションの保存に失敗しました。\n\n${error.message}\n\n後で履歴画面から再度保存できます。`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleRetry = () => {
    resetSession();
    navigation.navigate('SceneSelection');
  };

  const handleBackToHome = () => {
    resetSession();
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>お疲れ様でした！</Text>
          <Text style={styles.sceneName}>{sceneName}の練習を完了しました</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>総評</Text>
            <Text style={styles.summaryText}>{feedback.summary}</Text>
          </View>

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

          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementIcon}>🌟</Text>
            <Text style={styles.encouragementText}>{feedback.encouragement}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveSession}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>📁 履歴に保存</Text>
            )}
          </TouchableOpacity>
          
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sceneName: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
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
    textAlign: 'center',
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
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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