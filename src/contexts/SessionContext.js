// src/contexts/SessionContext.js

import React, { createContext, useState, useContext } from 'react';

/**
 * セッションコンテキスト
 * 練習セッションの状態を管理（質問、回答、進捗など）
 */
const SessionContext = createContext();

/**
 * セッションプロバイダー
 * アプリ全体でセッション状態を共有する
 */
export const SessionProvider = ({ children }) => {
  // 現在のセッション全体のデータ
  const [currentSession, setCurrentSession] = useState(null);
  
  // 現在の質問インデックス（0から始まる）
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // セッションが進行中かどうか
  const [isSessionActive, setIsSessionActive] = useState(false);

  /**
   * 新しいセッションを開始
   * @param {Object} scene - 選択された場面データ
   */
  const startSession = (scene) => {
    const newSession = {
      sessionId: generateSessionId(),
      sceneId: scene.id,
      sceneName: scene.name,
      timestamp: new Date().toISOString(),
      qaList: [
        // 最初は固定質問のみ
        {
          questionId: 'q0',
          questionText: scene.fixedQuestion,
          answerText: '',
          answerDuration: 0,
          isFixedQuestion: true,
        },
      ],
      totalQuestions: 1, // 固定質問1問のみ（AI質問生成後に増える）
      feedback: null,
      duration: 0,
      startTime: Date.now(),
    };

    setCurrentSession(newSession);
    setCurrentQuestionIndex(0);
    setIsSessionActive(true);
  };

  /**
   * 現在の質問への回答を保存
   * @param {string} answerText - 回答テキスト
   * @param {number} duration - 回答にかかった時間（秒）
   */
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
   * AI生成の追加質問をセッションに追加
   * @param {Array} questions - 生成された質問のリスト
   */
  const addAiQuestions = (questions) => {
    if (!currentSession) return;

    const newQuestions = questions.map((questionText, index) => ({
      questionId: `q${currentSession.qaList.length + index}`,
      questionText,
      answerText: '',
      answerDuration: 0,
      isFixedQuestion: false,
    }));

    setCurrentSession({
      ...currentSession,
      qaList: [...currentSession.qaList, ...newQuestions],
      totalQuestions: currentSession.qaList.length + newQuestions.length,
    });
  };

  /**
   * 次の質問に進む
   * @returns {boolean} 次の質問があればtrue、なければfalse
   */
  const moveToNextQuestion = () => {
    if (!currentSession) return false;

    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < currentSession.qaList.length) {
      setCurrentQuestionIndex(nextIndex);
      return true;
    }
    
    return false;
  };

  /**
   * フィードバックを保存
   * @param {Object} feedback - AIが生成したフィードバック
   */
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

  /**
   * セッションを終了
   */
  const endSession = () => {
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setIsSessionActive(false);
  };

  /**
   * セッションをリセット（中断時など）
   */
  const resetSession = () => {
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setIsSessionActive(false);
  };

  /**
   * 現在の質問を取得
   * @returns {Object|null} 現在の質問オブジェクト
   */
  const getCurrentQuestion = () => {
    if (!currentSession || currentQuestionIndex >= currentSession.qaList.length) {
      return null;
    }
    return currentSession.qaList[currentQuestionIndex];
  };

  /**
   * セッションが完了しているか確認
   * @returns {boolean} 全質問に回答済みならtrue
   */
  const isSessionComplete = () => {
    if (!currentSession) return false;
    
    return currentSession.qaList.every((qa) => qa.answerText.trim() !== '');
  };

  /**
   * 進捗率を計算
   * @returns {number} 0-100の進捗率
   */
  const getProgress = () => {
    if (!currentSession) return 0;
    
    const answeredCount = currentSession.qaList.filter(
      (qa) => qa.answerText.trim() !== ''
    ).length;
    
    return Math.floor((answeredCount / currentSession.totalQuestions) * 100);
  };

  const value = {
    // State
    currentSession,
    currentQuestionIndex,
    isSessionActive,
    
    // Actions
    startSession,
    saveAnswer,
    addAiQuestions,
    moveToNextQuestion,
    saveFeedback,
    endSession,
    resetSession,
    
    // Helpers
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

/**
 * SessionContextを使用するカスタムフック
 */
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

/**
 * ユニークなセッションIDを生成
 * @returns {string} セッションID
 * 例: session_1234567890123_a1b2c3d4e
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};