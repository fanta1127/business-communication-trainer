// functions/index.js

const functions = require('firebase-functions');
const axios = require('axios');

// OpenAI API設定（サーバー側の環境変数）
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 30000;

/**
 * AI質問生成 Cloud Function
 * HTTPSコール可能な関数として公開
 */
exports.generateQuestions = functions
  .region('asia-northeast1') // 東京リージョン（レイテンシ削減）
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

    if (userAnswer.trim().length < 10) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '回答は10文字以上入力してください'
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
      // OpenAI API呼び出し
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-4o-mini',
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
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          timeout: TIMEOUT_MS,
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

      // 質問数を3-5問に制限
      const questions = content.questions.slice(0, 5);

      if (questions.length < 3) {
        throw new Error('Insufficient questions generated');
      }

      // 成功レスポンス
      console.log(`[generateQuestions] Success: ${questions.length} questions`);
      
      return {
        questions,
        totalQuestions: questions.length,
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
  .region('asia-northeast1')
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
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          timeout: 10000,
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