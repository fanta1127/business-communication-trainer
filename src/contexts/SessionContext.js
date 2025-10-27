import React, { createContext, useState, useContext } from 'react';
import { QUESTION_CONFIG } from '../constants/appConfig';
import { saveSession } from '../services/firestoreService';
import { useAuth } from './AuthContext';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const startSession = (scene) => {
    const totalQuestions = QUESTION_CONFIG.TOTAL_COUNT;
    
    const newSession = {
      sessionId: generateSessionId(),
      sceneId: scene.id,
      sceneName: scene.name,
      timestamp: new Date().toISOString(),
      qaList: [
        {
          questionId: 'q0',
          questionText: scene.fixedQuestion,
          answerText: '',
          answerDuration: 0,
          isFixedQuestion: true,
        },
      ],
      totalQuestions,
      feedback: null,
      duration: 0,
      startTime: Date.now(),
    };

    setCurrentSession(newSession);
    setCurrentQuestionIndex(0);
    setIsSessionActive(true);
  };

  const saveAnswer = (answerText, duration = 0) => {
    if (!currentSession) return;

    const updatedQaList = [...currentSession.qaList];
    updatedQaList[currentQuestionIndex] = {
      ...updatedQaList[currentQuestionIndex],
      answerText,
      answerDuration: duration,
    };

    setCurrentSession({
      ...currentSession,
      qaList: updatedQaList,
    });
  };

  /**
   * AI生成質問をセッションに追加し、次の質問に自動的に移動
   * @param {string[]} questions - AI生成された質問の配列
   */
  const addAiQuestions = (questions) => {
    setCurrentSession(prevSession => {
      if (!prevSession) {
        console.warn('[SessionContext] addAiQuestions: セッションが存在しません');
        return prevSession;
      }

      const newQuestions = questions.map((questionText, index) => ({
        questionId: `q${prevSession.qaList.length + index}`,
        questionText,
        answerText: '',
        answerDuration: 0,
        isFixedQuestion: false,
      }));

      return {
        ...prevSession,
        qaList: [...prevSession.qaList, ...newQuestions],
      };
    });

    // 質問が追加されたので、次の質問（最初のAI質問）に移動
    setCurrentQuestionIndex(prev => prev + 1);
  };

  /**
   * 次の質問に移動
   * @returns {boolean} 移動できた場合true、最後の質問の場合false
   */
  const moveToNextQuestion = () => {
    if (!currentSession) {
      console.warn('[SessionContext] moveToNextQuestion: セッションが存在しません');
      return false;
    }

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < currentSession.qaList.length) {
      setCurrentQuestionIndex(nextIndex);
      return true;
    }

    return false;
  };

  const saveFeedback = (feedback) => {
    if (!currentSession) return;

    const endTime = Date.now();
    const totalDuration = Math.floor((endTime - currentSession.startTime) / 1000);

    setCurrentSession({
      ...currentSession,
      feedback,
      duration: totalDuration,
    });
  };

  const endSession = () => {
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setIsSessionActive(false);
  };

  const resetSession = () => {
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setIsSessionActive(false);
  };

  const getCurrentQuestion = () => {
    if (!currentSession || currentQuestionIndex >= currentSession.qaList.length) {
      return null;
    }
    return currentSession.qaList[currentQuestionIndex];
  };

  const isSessionComplete = () => {
    if (!currentSession) return false;
    
    return currentSession.qaList.every((qa) => qa.answerText.trim() !== '');
  };

  const getProgress = () => {
    if (!currentSession) return 0;

    const answeredCount = currentSession.qaList.filter(
      (qa) => qa.answerText.trim() !== ''
    ).length;

    return Math.floor((answeredCount / QUESTION_CONFIG.TOTAL_COUNT) * 100);
  };

  /**
   * セッションをFirestoreに保存
   * @returns {Promise<string>} 保存されたセッションID
   */
  const saveSessionToFirestore = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      console.log('[SessionContext] Saving session to Firestore...');

      // ユーザーチェック
      if (!user || !user.uid) {
        throw new Error('ログインが必要です');
      }

      // セッションデータチェック
      if (!currentSession) {
        throw new Error('保存するセッションがありません');
      }

      // セッションデータを準備
      const sessionData = {
        sceneId: currentSession.sceneId,
        sceneName: currentSession.sceneName,
        qaList: currentSession.qaList,
        feedback: currentSession.feedback,
        duration: currentSession.duration || 0,
      };

      // Firestoreに保存
      const sessionId = await saveSession(user.uid, sessionData);

      console.log('[SessionContext] Session saved successfully:', sessionId);

      return sessionId;

    } catch (error) {
      console.error('[SessionContext] Save error:', error);

      // エラーメッセージの分類
      let userMessage = error.message;

      if (error.message.includes('network') || error.message.includes('Network')) {
        userMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (error.message.includes('permission')) {
        userMessage = 'データへのアクセス権限がありません。ログインしてください。';
      }

      setSaveError(userMessage);
      throw new Error(userMessage);

    } finally {
      setSaving(false);
    }
  };

  const value = {
    currentSession,
    currentQuestionIndex,
    isSessionActive,
    startSession,
    saveAnswer,
    addAiQuestions,
    moveToNextQuestion,
    saveFeedback,
    endSession,
    resetSession,
    getCurrentQuestion,
    isSessionComplete,
    getProgress,
    saveSessionToFirestore,
    saving,
    saveError,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};