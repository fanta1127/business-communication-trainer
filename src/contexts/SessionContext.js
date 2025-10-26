import React, { createContext, useState, useContext } from 'react';
import { QUESTION_CONFIG } from '../constants/appConfig';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

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