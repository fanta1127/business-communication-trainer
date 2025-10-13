// functions/index.js

const functions = require('firebase-functions');
const axios = require('axios');
const CONFIG = require('./config');  // ✅ 設定ファイルをインポート

/**
 * AI質問生成 Cloud Function
 * HTTPSコール可能な関数として公開
 */
exports.generateQuestions = functions
  .region(CONFIG.FIREBASE.REGION)  // ✅ 定数使用
  .https.onCall(async (data, context) => {

    // 認証チェック
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'この機能を使用するにはログインが必要です'
      );
    }

    // 入力バリデーション
    const { sceneId, sceneName, aiPrompt, userAnswer } = data;

    if (!sceneId || !aiPrompt || !userAnswer) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '必要なパラメータが不足しています'
      );
    }

    // ✅ 定数使用
    if (userAnswer.trim().length < CONFIG.QUESTION.MIN_ANSWER_LENGTH) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `回答は${CONFIG.QUESTION.MIN_ANSWER_LENGTH}文字以上入力してください`
      );
    }

    // OpenAI APIキーの取得
    const OPENAI_API_KEY = functions.config().openai?.key;

    if (!OPENAI_API_KEY) {
      console.error('[generateQuestions] OpenAI APIキーが設定されていません');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'OpenAI APIキーが設定されていません'
      );
    }

    // ユーザー情報をログに記録
    const userId = context.auth.uid;
    console.log(`[generateQuestions] User: ${userId}, Scene: ${sceneId}`);

    try {
      // ✅ 定数使用: OpenAI API呼び出し
      const response = await axios.post(
        CONFIG.OPENAI.API_URL,
        {
          model: CONFIG.OPENAI.MODEL,
          messages: [
            {
              role: 'system',
              content: aiPrompt,
            },
            {
              role: 'user',
              content: `ユーザーの回答: ${userAnswer}`,
            },
          ],
          temperature: CONFIG.OPENAI.TEMPERATURE,
          max_tokens: CONFIG.OPENAI.MAX_TOKENS_QUESTIONS,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          timeout: CONFIG.TIMEOUT.OPENAI_API_MS,
        }
      );

      // レスポンス検証
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      // JSONパース
      const content = JSON.parse(response.data.choices[0].message.content);

      // 質問配列の検証
      if (!Array.isArray(content.questions) || content.questions.length === 0) {
        throw new Error('No questions in API response');
      }

      // ✅ 定数使用: 質問数を厳密に制限
      const REQUIRED_COUNT = CONFIG.QUESTION.AI_COUNT;
      const questions = content.questions.slice(0, REQUIRED_COUNT);

      if (questions.length < REQUIRED_COUNT) {
        throw new Error(
          `AI generated insufficient questions (expected ${REQUIRED_COUNT}, got ${questions.length})`
        );
      }

      if (content.questions.length > REQUIRED_COUNT) {
        console.warn(
          `[generateQuestions] AI generated ${content.questions.length} questions, using first ${REQUIRED_COUNT}`
        );
      }

      // 成功レスポンス
      console.log(`[generateQuestions] Success: ${questions.length} questions`);

      return {
        questions,
        totalQuestions: REQUIRED_COUNT,  // ✅ 定数使用（常に3）
        source: 'AI',
        reasoning: content.reasoning || '',
      };

    } catch (error) {
      console.error('[generateQuestions] Error:', error.message);

      // OpenAI APIエラーの場合
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'OpenAI API認証エラー'
          );
        } else if (status === 429) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            'リクエスト数が上限に達しました'
          );
        }
      }

      // その他のエラー
      throw new functions.https.HttpsError(
        'internal',
        'AI質問の生成に失敗しました: ' + error.message
      );
    }
  });

/**
 * API接続テスト用の関数（デバッグ用）
 */
exports.checkOpenAIConnection = functions
  .region(CONFIG.FIREBASE.REGION)  // ✅ 定数使用
  .https.onCall(async (data, context) => {

    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'この機能を使用するにはログインが必要です'
      );
    }

    const OPENAI_API_KEY = functions.config().openai?.key;

    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'OpenAI APIキーが設定されていません'
      );
    }

    try {
      // ✅ 定数使用
      const response = await axios.post(
        CONFIG.OPENAI.API_URL,
        {
          model: CONFIG.OPENAI.MODEL,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          timeout: CONFIG.TIMEOUT.CONNECTION_TEST_MS,
        }
      );

      return {
        status: 'OK',
        message: 'OpenAI API接続成功',
        model: response.data.model,
      };
    } catch (error) {
      console.error('[checkOpenAIConnection] Error:', error.message);
      throw new functions.https.HttpsError(
        'internal',
        'OpenAI API接続エラー: ' + error.message
      );
    }
  });