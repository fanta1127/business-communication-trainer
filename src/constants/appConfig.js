// src/constants/appConfig.js

/**
 * アプリケーション全体の設定定数
 * ここを変更すれば全体に反映される
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 質問設定
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const QUESTION_CONFIG = {
    /** 固定質問の数（常に1） */
    FIXED_COUNT: 1,
    
    /** AI生成質問の数 */
    AI_COUNT: 3,
    
    /** 総質問数（自動計算） */
    get TOTAL_COUNT() {
      return this.FIXED_COUNT + this.AI_COUNT;
    },
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 回答設定
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  export const ANSWER_CONFIG = {
    /** 最小文字数 */
    MIN_LENGTH: 10,
    
    /** 最大文字数 */
    MAX_LENGTH: 2000,
    
    /** 警告文字数（最大の75%） */
    WARNING_LENGTH: 1500,
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // タイムアウト設定
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  export const TIMEOUT_CONFIG = {
    /** OpenAI API呼び出し（サーバー側） */
    OPENAI_SERVER_MS: 30000,
    
    /** Cloud Functions呼び出し（クライアント側） */
    CLOUD_FUNCTION_MS: 35000,
    
    /** フィードバック生成 */
    FEEDBACK_MS: 45000,
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Firebase設定
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  export const FIREBASE_CONFIG = {
    /** Functionsのリージョン */
    REGION: 'asia-northeast1',
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OpenAI設定
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  export const OPENAI_CONFIG = {
    /** 使用モデル */
    MODEL: 'gpt-4o-mini',
    
    /** Temperature設定 */
    TEMPERATURE: 0.7,
    
    /** 質問生成の最大トークン数 */
    MAX_TOKENS_QUESTIONS: 1000,
    
    /** フィードバック生成の最大トークン数 */
    MAX_TOKENS_FEEDBACK: 1500,
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ユーティリティ関数
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * プログレスバーの割合を計算
   * @param {number} currentIndex - 現在の質問インデックス（0始まり）
   * @returns {number} 0-100のパーセンテージ
   */
  export const calculateProgress = (currentIndex) => {
    return Math.floor(((currentIndex + 1) / QUESTION_CONFIG.TOTAL_COUNT) * 100);
  };
  
  /**
   * 質問番号を取得（1始まり）
   * @param {number} index - 質問インデックス（0始まり）
   * @returns {string} "1/4"形式
   */
  export const getQuestionNumber = (index) => {
    return `${index + 1}/${QUESTION_CONFIG.TOTAL_COUNT}`;
  };