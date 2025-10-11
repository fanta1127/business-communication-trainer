// src/screens/PracticeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/SessionContext';
import VoiceRecorder from '../components/VoiceRecorder';

export default function PracticeScreen({ navigation, route }) {
  const { scene } = route.params || {};
  const {
    currentSession,
    currentQuestionIndex,
    getCurrentQuestion,
    saveAnswer,
    moveToNextQuestion,
    getProgress,
    resetSession,
  } = useSession();

  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [audioUri, setAudioUri] = useState(null);

  // 現在の質問を取得
  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const totalQuestions = currentSession?.totalQuestions || 1;

  useEffect(() => {
    // 質問が変わったらタイマーをリセット
    setStartTime(Date.now());
    setAnswer('');
    setAudioUri(null);
  }, [currentQuestionIndex]);

  /**
   * 音声録音完了時の処理
   */
  const handleRecordingComplete = (uri, duration) => {
    setAudioUri(uri);
    console.log('録音完了:', { uri, duration });
    
    // テキスト入力にフォーカスを促す
    // 将来的にここで音声認識APIを呼び出す
  };

  /**
   * 次へボタンの処理
   */
  const handleNext = () => {
    if (answer.trim() === '') {
      Alert.alert('エラー', '回答を入力してください');
      return;
    }

    // 回答時間を計算（秒）
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    // 回答を保存（将来的にはaudioUriも保存）
    saveAnswer(answer.trim(), duration);

    // 次の質問へ移動
    const hasNext = moveToNextQuestion();
    
    if (!hasNext) {
      // 全質問完了
      Alert.alert(
        '質問回答完了',
        '固定質問への回答が完了しました。AI質問生成機能は後日実装予定です。',
        [
          {
            text: 'ホームに戻る',
            onPress: () => {
              resetSession();
              navigation.navigate('Home');
            },
          },
        ]
      );
    } else {
      // 次の質問があるのでanswerをクリア
      setAnswer('');
    }
  };

  /**
   * セッション終了の確認
   */
  const handleEndSession = () => {
    Alert.alert(
      'セッションを終了',
      '練習を中断してもよろしいですか？進捗は保存されません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '終了する',
          style: 'destructive',
          onPress: () => {
            resetSession();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  // セッションがない場合の処理
  if (!currentSession || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>セッションが見つかりません</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>ホームに戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            質問 {currentQuestionIndex + 1} / {totalQuestions}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <TouchableOpacity onPress={handleEndSession} style={styles.endButton}>
          <Text style={styles.endButtonText}>終了</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sceneInfo}>
          <Text style={styles.sceneIcon}>{scene?.icon || '📊'}</Text>
          <Text style={styles.sceneName}>{scene?.name || '練習中'}</Text>
        </View>

        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionLabel}>
              {currentQuestion.isFixedQuestion ? '📌 固定質問' : '🤖 AI質問'}
            </Text>
          </View>
          <Text style={styles.questionText}>
            {currentQuestion.questionText}
          </Text>
        </View>

        {/* 音声録音コンポーネント */}
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={false}
        />

        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>あなたの回答</Text>
          <TextInput
            style={styles.answerInput}
            value={answer}
            onChangeText={setAnswer}
            placeholder="ここに回答を入力してください..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{answer.length} 文字</Text>
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            具体的な数値や事例を含めると、より効果的な練習になります
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !answer.trim() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!answer.trim()}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === totalQuestions - 1 ? '完了' : '次へ'}
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  endButton: {
    padding: 8,
  },
  endButtonText: {
    color: '#FF5252',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sceneInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sceneIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  sceneName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  questionCard: {
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
  questionHeader: {
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  answerSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    color: '#333',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  tip: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  nextButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
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
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 32,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});