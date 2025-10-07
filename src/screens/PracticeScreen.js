// src/screens/PracticeScreen.js
import React, { useState } from 'react';
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

export default function PracticeScreen({ navigation, route }) {
  const { scene } = route.params || {};
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);

  // 仮の質問データ（後でAIが生成）
  const questions = [
    '今週の進捗状況と、現在直面している課題を具体的に説明してください',
    'その課題に対して、どのような対策を考えていますか？',
    'チームメンバーとの連携はうまくいっていますか？',
  ];

  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleNext = () => {
    if (answer.trim() === '') {
      Alert.alert('エラー', '回答を入力してください');
      return;
    }

    // 回答を保存
    const newAnswers = [...answers, { question: questions[currentQuestionIndex], answer }];
    setAnswers(newAnswers);
    setAnswer('');

    if (currentQuestionIndex < totalQuestions - 1) {
      // 次の質問へ
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 全質問完了 → フィードバック画面へ
      navigation.navigate('Feedback', { 
        scene, 
        answers: newAnswers 
      });
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      'セッションを終了',
      '練習を中断してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '終了する', 
          style: 'destructive',
          onPress: () => navigation.navigate('Home')
        },
      ]
    );
  };

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
          <Text style={styles.questionLabel}>質問</Text>
          <Text style={styles.questionText}>
            {questions[currentQuestionIndex]}
          </Text>
        </View>

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
          <Text style={styles.charCount}>
            {answer.length} 文字
          </Text>
        </View>

        <TouchableOpacity style={styles.voiceButton}>
          <Text style={styles.voiceButtonIcon}>🎤</Text>
          <Text style={styles.voiceButtonText}>音声で回答（後で実装）</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !answer.trim() && styles.nextButtonDisabled]}
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
  questionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
  voiceButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  voiceButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  voiceButtonText: {
    fontSize: 16,
    color: '#666',
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
});