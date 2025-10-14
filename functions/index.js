// functions/index.js

const functions = require('firebase-functions');
const axios = require('axios');
const CONFIG = require('./config');  // ✅ 設定ファイルをインポート

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// システムプロンプト定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * フィードバック生成用システムプロンプト
 */
const FEEDBACK_SYSTEM_PROMPT = `あなたはビジネスコミュニケーションのプロフェッショナルコーチです。

ユーザーの回答に対して、以下の形式でフィードバックを提供してください：

1. summary: 全体的な印象を1-2文で簡潔に
2. goodPoints: 良かった点（2-3個）
   - aspect: 評価の観点（例: 具体性、論理構造、姿勢など）
   - quote: ユーザーの回答からの引用（該当部分があれば）
   - comment: なぜ良かったのか、具体的なコメント
3. improvementPoints: 改善のヒント（1-2個）
   - aspect: 改善の観点（例: 具体性、論理構造、表現方法など）
   - original: 改善前の表現（ユーザーの回答から）
   - improved: 改善後の表現例
   - reason: なぜ改善が必要か、その効果
4. encouragement: 励ましの言葉（前向きで具体的に）

【フィードバックの方針】
- 建設的で前向きなトーンを保つ
- 具体的な引用や改善例を示す
- ビジネスの文脈に適した表現を使う
- 改善点は実践可能な具体例を提示
- 良い点も改善点もバランスよく伝える

必ず以下のJSON形式で回答してください：
{
  "summary": "全体的な印象",
  "goodPoints": [
    {
      "aspect": "評価の観点",
      "quote": "引用テキスト",
      "comment": "コメント"
    }
  ],
  "improvementPoints": [
    {
      "aspect": "改善の観点",
      "original": "改善前",
      "improved": "改善後",
      "reason": "理由"
    }
  ],
  "encouragement": "励ましの言葉"
}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cloud Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
 * AIフィードバック生成 Cloud Function
 * HTTPSコール可能な関数として公開
 */
exports.generateFeedback = functions
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
    const { sceneId, sceneName, qaList } = data;

    if (!sceneId || !sceneName || !Array.isArray(qaList) || qaList.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '必要なパラメータが不足しています'
      );
    }

    // qaListの各要素をバリデーション
    for (const qa of qaList) {
      if (!qa.questionText || !qa.answerText) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'qaListの形式が正しくありません'
        );
      }
    }

    // OpenAI APIキーの取得
    const OPENAI_API_KEY = functions.config().openai?.key;

    if (!OPENAI_API_KEY) {
      console.error('[generateFeedback] OpenAI APIキーが設定されていません');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'OpenAI APIキーが設定されていません'
      );
    }

    // ユーザー情報をログに記録
    const userId = context.auth.uid;
    console.log(`[generateFeedback] User: ${userId}, Scene: ${sceneId}, QA Count: ${qaList.length}`);

    // Q&Aをテキストに整形
    const qaText = qaList
      .map((qa, idx) => `質問${idx + 1}: ${qa.questionText}\n回答${idx + 1}: ${qa.answerText}`)
      .join('\n\n');

    try {
      // ✅ 定数使用: OpenAI API呼び出し
      const response = await axios.post(
        CONFIG.OPENAI.API_URL,
        {
          model: CONFIG.OPENAI.MODEL,
          messages: [
            {
              role: 'system',
              content: FEEDBACK_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: `場面: ${sceneName}\n\n${qaText}`,
            },
          ],
          temperature: CONFIG.OPENAI.TEMPERATURE,
          max_tokens: CONFIG.OPENAI.MAX_TOKENS_FEEDBACK,  // ✅ 定数使用
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          timeout: CONFIG.TIMEOUT.OPENAI_API_MS,  // ✅ 定数使用
        }
      );

      // レスポンス検証
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      // JSONパース
      const feedback = JSON.parse(response.data.choices[0].message.content);

      // フィードバック構造の検証
      if (!feedback.summary || !feedback.goodPoints || !feedback.improvementPoints || !feedback.encouragement) {
        throw new Error('Invalid feedback structure');
      }

      // 配列の検証
      if (!Array.isArray(feedback.goodPoints) || !Array.isArray(feedback.improvementPoints)) {
        throw new Error('goodPoints and improvementPoints must be arrays');
      }

      // 成功レスポンス
      console.log(`[generateFeedback] Success: ${feedback.goodPoints.length} good points, ${feedback.improvementPoints.length} improvement points`);

      return {
        summary: feedback.summary,
        goodPoints: feedback.goodPoints,
        improvementPoints: feedback.improvementPoints,
        encouragement: feedback.encouragement,
        source: 'AI',
      };

    } catch (error) {
      console.error('[generateFeedback] Error:', error.message);

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
            'リクエスト数が上限に達しました。しばらくしてから再試行してください。'
          );
        }
      }

      // その他のエラー
      throw new functions.https.HttpsError(
        'internal',
        'フィードバックの生成に失敗しました: ' + error.message
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