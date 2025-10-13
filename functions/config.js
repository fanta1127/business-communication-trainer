// functions/config.js

/**
 * Cloud Functions 設定定数
 * 
 * ⚠️ 重要: この設定は src/constants/appConfig.js と同期する必要があります
 * フロントエンドとバックエンドで同じ値を使用する場合、両方を更新してください
 */

module.exports = {
  // Firebase設定
  FIREBASE: {
    REGION: 'asia-northeast1',  // 東京リージョン
  },

  // 質問設定
  QUESTION: {
    AI_COUNT: 3,                 // AI生成質問数
    MIN_ANSWER_LENGTH: 10,       // 最小回答文字数
  },

  // OpenAI設定
  OPENAI: {
    API_URL: 'https://api.openai.com/v1/chat/completions',
    MODEL: 'gpt-4o-mini',
    TEMPERATURE: 0.7,
    MAX_TOKENS_QUESTIONS: 1000,
    MAX_TOKENS_FEEDBACK: 1500,   // フィードバック用（Day 9実装予定）
  },

  // タイムアウト設定（ミリ秒）
  TIMEOUT: {
    OPENAI_API_MS: 30000,        // OpenAI API呼び出し（30秒）
    CONNECTION_TEST_MS: 10000,   // 接続テスト用（10秒）
  },
};

