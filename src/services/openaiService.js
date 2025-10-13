// src/services/openaiService.js

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getSceneById } from '../constants/scenes';
import { getDefaultQuestions } from '../constants/defaultQuestions';

/**
 * AI質問生成（Cloud Functions経由）
 * セキュアな実装：APIキーはサーバー側で管理
 * 
 * @param {string} sceneId - 場面ID
 * @param {string} userAnswer - ユーザーの回答
 * @returns {Promise<Object>} { questions, totalQuestions, source }
 */
export const generateQuestions = async (sceneId, userAnswer) => {
  console.log('[OpenAI] 質問生成開始（Cloud Functions経由）:', { 
    sceneId, 
    answerLength: userAnswer.length 
  });

  // 入力バリデーション
  if (!sceneId || !userAnswer || userAnswer.trim().length < 10) {
    console.error('[OpenAI] 入力バリデーションエラー');
    return useFallbackQuestions(sceneId, 'VALIDATION_ERROR');
  }

  // 場面データを取得
  const scene = getSceneById(sceneId);
  if (!scene) {
    console.error('[OpenAI] 場面が見つかりません:', sceneId);
    return useFallbackQuestions(sceneId, 'SCENE_NOT_FOUND');
  }

  try {
    // Firebase Cloud Functions を呼び出し
    const functions = getFunctions(undefined, 'asia-northeast1');
    const generateQuestionsFunc = httpsCallable(functions, 'generateQuestions');

    // Cloud Functionに送信するデータ
    const requestData = {
      sceneId: scene.id,
      sceneName: scene.name,
      aiPrompt: scene.aiPrompt,
      userAnswer: userAnswer.trim(),
    };

    console.log('[OpenAI] Cloud Function呼び出し中...');

    // タイムアウト付きで呼び出し
    const result = await Promise.race([
      generateQuestionsFunc(requestData),
      timeoutPromise(35000, 'Cloud Function タイムアウト'),
    ]);

    // 成功
    const data = result.data;
    console.log('[OpenAI] 質問生成成功:', { 
      questionCount: data.questions.length,
      source: data.source 
    });

    return {
      questions: data.questions,
      totalQuestions: data.totalQuestions,
      source: data.source,
      reasoning: data.reasoning || '',
    };

  } catch (error) {
    console.error('[OpenAI] Cloud Function呼び出しエラー:', error);

    // エラーの種類に応じた処理
    if (error.code === 'unauthenticated') {
      console.error('[OpenAI] 認証エラー - ログインが必要');
      throw new Error('この機能を使用するにはログインが必要です');
    }

    // フォールバック質問を使用
    console.warn('[OpenAI] フォールバック質問を使用');
    return useFallbackQuestions(sceneId, error.message);
  }
};

/**
 * フォールバック質問を使用
 * @private
 */
function useFallbackQuestions(sceneId, reason) {
  console.log('[OpenAI] フォールバック質問を使用:', { sceneId, reason });
  
  const questions = getDefaultQuestions(sceneId);
  
  return {
    questions,
    totalQuestions: questions.length,
    source: 'DEFAULT',
    reason,
  };
}

/**
 * タイムアウト用Promise
 * @private
 */
function timeoutPromise(ms, errorMessage) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
}

/**
 * OpenAI API接続テスト（デバッグ用）
 */
export const checkAPIStatus = async () => {
  try {
    const functions = getFunctions(undefined, 'asia-northeast1');
    const checkConnection = httpsCallable(functions, 'checkOpenAIConnection');
    
    const result = await checkConnection();
    return result.data;
  } catch (error) {
    return {
      status: 'ERROR',
      message: error.message,
    };
  }
};

/**
 * エラーメッセージをユーザーフレンドリーな形式に変換
 */
export const getErrorMessage = (error) => {
  if (!error) return '不明なエラーが発生しました';

  // Firebase Functions エラーコード
  switch (error.code) {
    case 'unauthenticated':
      return 'ログインが必要です';
    case 'permission-denied':
      return 'この操作を実行する権限がありません';
    case 'resource-exhausted':
      return 'リクエスト数が上限に達しました。しばらくしてから再試行してください。';
    case 'failed-precondition':
      return 'サーバー側の設定に問題があります';
    case 'internal':
      return 'サーバーエラーが発生しました';
    default:
      return error.message || '不明なエラーが発生しました';
  }
};