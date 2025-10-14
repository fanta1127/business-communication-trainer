// src/services/openaiService.js

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getSceneById } from '../constants/scenes';
import { getDefaultQuestions } from '../constants/defaultQuestions';
import { getDefaultFeedback } from '../constants/defaultFeedback';  // ✅ 追加
import { 
  ANSWER_CONFIG, 
  FIREBASE_CONFIG, 
  TIMEOUT_CONFIG 
} from '../constants/appConfig';

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

  // ✅ 定数使用: 入力バリデーション
  if (!sceneId || !userAnswer || userAnswer.trim().length < ANSWER_CONFIG.MIN_LENGTH) {
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
    // ✅ 定数使用: Firebase Cloud Functions を呼び出し
    const functions = getFunctions(undefined, FIREBASE_CONFIG.REGION);
    const generateQuestionsFunc = httpsCallable(functions, 'generateQuestions');

    // Cloud Functionに送信するデータ
    const requestData = {
      sceneId: scene.id,
      sceneName: scene.name,
      aiPrompt: scene.aiPrompt,
      userAnswer: userAnswer.trim(),
    };

    console.log('[OpenAI] Cloud Function呼び出し中...');

    // ✅ 定数使用: タイムアウト付きで呼び出し
    const result = await Promise.race([
      generateQuestionsFunc(requestData),
      timeoutPromise(TIMEOUT_CONFIG.CLOUD_FUNCTION_MS, 'Cloud Function タイムアウト'),
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
 * AIフィードバック生成（Cloud Functions経由）
 * セキュアな実装：APIキーはサーバー側で管理
 * 
 * @param {string} sceneId - 場面ID
 * @param {string} sceneName - 場面名
 * @param {Array} qaList - Q&Aリスト [{ questionText, answerText }, ...]
 * @returns {Promise<Object>} { summary, goodPoints, improvementPoints, encouragement, source }
 */
export const generateFeedback = async (sceneId, sceneName, qaList) => {
  console.log('[OpenAI] フィードバック生成開始（Cloud Functions経由）:', { 
    sceneId,
    sceneName,
    qaCount: qaList.length 
  });

  // ✅ 入力バリデーション
  if (!sceneId || !sceneName || !Array.isArray(qaList) || qaList.length === 0) {
    console.error('[OpenAI] 入力バリデーションエラー');
    return useFallbackFeedback(sceneId, 'VALIDATION_ERROR');
  }

  // qaListの各要素をバリデーション
  for (const qa of qaList) {
    if (!qa.questionText || !qa.answerText) {
      console.error('[OpenAI] qaListの形式が正しくありません');
      return useFallbackFeedback(sceneId, 'INVALID_QA_FORMAT');
    }
  }

  try {
    // ✅ 定数使用: Firebase Cloud Functions を呼び出し
    const functions = getFunctions(undefined, FIREBASE_CONFIG.REGION);
    const generateFeedbackFunc = httpsCallable(
      functions, 
      'generateFeedback',
      { timeout: TIMEOUT_CONFIG.FEEDBACK_MS }  // ✅ 定数使用（45秒）
    );

    // Cloud Functionに送信するデータ
    const requestData = {
      sceneId,
      sceneName,
      qaList,
    };

    console.log('[OpenAI] Cloud Function呼び出し中（フィードバック生成）...');

    // API呼び出し
    const result = await generateFeedbackFunc(requestData);

    // 成功
    const data = result.data;
    console.log('[OpenAI] フィードバック生成成功:', { 
      goodPointsCount: data.goodPoints?.length || 0,
      improvementPointsCount: data.improvementPoints?.length || 0,
      source: data.source 
    });

    return {
      summary: data.summary,
      goodPoints: data.goodPoints,
      improvementPoints: data.improvementPoints,
      encouragement: data.encouragement,
      source: data.source,
    };

  } catch (error) {
    console.error('[OpenAI] Cloud Function呼び出しエラー（フィードバック）:', error);

    // エラーの種類に応じた処理
    if (error.code === 'unauthenticated') {
      console.error('[OpenAI] 認証エラー - ログインが必要');
      throw new Error('この機能を使用するにはログインが必要です');
    }

    // エラー内容をログ出力
    console.warn('[OpenAI] エラー詳細:', {
      code: error.code,
      message: error.message,
    });

    // フォールバックフィードバックを使用
    console.warn('[OpenAI] フォールバックフィードバックを使用');
    return useFallbackFeedback(sceneId, error.message);
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
 * フォールバックフィードバックを使用
 * @private
 */
function useFallbackFeedback(sceneId, reason) {
  console.log('[OpenAI] フォールバックフィードバックを使用:', { sceneId, reason });
  
  const feedback = getDefaultFeedback(sceneId);
  
  return {
    summary: feedback.summary,
    goodPoints: feedback.goodPoints,
    improvementPoints: feedback.improvementPoints,
    encouragement: feedback.encouragement,
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
    // ✅ 定数使用
    const functions = getFunctions(undefined, FIREBASE_CONFIG.REGION);
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