// src/contexts/SessionContext.js

import React, { createContext, useState, useContext } from 'react';
import { QUESTION_CONFIG } from '../constants/appConfig';  // ✅ 追加

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
    // ✅ 総質問数を定数から計算（固定1問 + AI質問）
    const totalQuestions = QUESTION_CONFIG.TOTAL_COUNT;
    
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
      totalQuestions, // ✅ 常に4（固定1 + AI3）
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
   * @returns {Promise<Object>} 更新されたセッション情報
   */
  const addAiQuestions = (questions) => {
    console.log('addAiQuestions開始:', {
      hasCurrentSession: !!currentSession,
      questionsLength: questions?.length,
      currentQaListLength: currentSession?.qaList?.length
    });
    
    return new Promise((resolve) => {
      setCurrentSession(prevSession => {
        if (!prevSession) {
          console.log('addAiQuestions: currentSessionがnullのため早期リターン');
          resolve(null);
          return prevSession;
        }

        const newQuestions = questions.map((questionText, index) => ({
          questionId: `q${prevSession.qaList.length + index}`,
          questionText,
          answerText: '',
          answerDuration: 0,
          isFixedQuestion: false,
        }));

        const updatedQaList = [...prevSession.qaList, ...newQuestions];
        
        const updatedSession = {
          ...prevSession,
          qaList: updatedQaList,
          // totalQuestionsは変更しない（startSessionで設定済み）
        };
        
        console.log('addAiQuestions更新前:', {
          originalQaListLength: prevSession.qaList.length,
          newQuestionsLength: newQuestions.length,
          updatedQaListLength: updatedQaList.length
        });
        
        // 更新されたセッション情報を返す
        setTimeout(() => {
          console.log('addAiQuestions: 状態更新完了、Promise解決');
          resolve(updatedSession);
        }, 0);
        
        console.log('addAiQuestions: setCurrentSession実行完了');
        
        return updatedSession;
      });
    });
  };

  /**
   * 次の質問に進む
   * @param {Object|null} sessionToUse - 使用するセッション情報（省略時はcurrentSessionを使用）
   * @returns {boolean} 次の質問があればtrue、なければfalse
   */
  const moveToNextQuestion = (sessionToUse = null) => {
    const session = sessionToUse || currentSession;
    if (!session) return false;

    const nextIndex = currentQuestionIndex + 1;
    
    // 渡されたセッション情報（または現在のセッション）で判定
    if (nextIndex < session.qaList.length) {
      setCurrentQuestionIndex(nextIndex);
      console.log('moveToNextQuestion成功:', {
        prevIndex: currentQuestionIndex,
        nextIndex,
        qaListLength: session.qaList.length,
        usedProvidedSession: !!sessionToUse
      });
      return true;
    }
    
    console.log('moveToNextQuestion: 次の質問なし', {
      nextIndex,
      qaListLength: session.qaList.length,
      usedProvidedSession: !!sessionToUse
    });
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
    
    // ✅ 定数使用（より明確に）
    return Math.floor((answeredCount / QUESTION_CONFIG.TOTAL_COUNT) * 100);
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