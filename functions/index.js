// functions/index.js

const functions = require('firebase-functions');
const axios = require('axios');
const FormData = require('form-data');
const { z } = require('zod');
const CONFIG = require('./config');

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
// Zodスキーマ定義（APIレスポンス検証用）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 質問生成APIレスポンスのスキーマ
 * OpenAI APIから返されるJSON形式を検証
 * 注: AIが予期しないフィールドを追加する可能性があるため、
 *     必要なフィールドのみを検証し、未知のフィールドは許可する
 */
const QuestionResponseSchema = z.object({
  questions: z.array(
    z.string()
      .min(1, '質問は空文字列であってはなりません')
      .max(500, '質問が長すぎます（最大500文字）')
  ).min(CONFIG.QUESTION.AI_COUNT, `最低${CONFIG.QUESTION.AI_COUNT}個の質問が必要です`)
    .max(10, '質問が多すぎます（最大10個）'),
  reasoning: z.string().optional(), // AI の推論プロセス（オプション）
  // その他のフィールド（totalQuestions等）はAIが追加する可能性があるため許可
});

/**
 * フィードバック生成APIレスポンスのスキーマ
 * 注: AIが予期しないフィールドを追加する可能性があるため、
 *     必要なフィールドのみを検証し、未知のフィールドは許可する
 */
const FeedbackResponseSchema = z.object({
  summary: z.string()
    .min(1, '要約が必要です')
    .max(500, '要約が長すぎます'),
  goodPoints: z.array(
    z.object({
      aspect: z.string().min(1, '評価の観点が必要です'),
      quote: z.string().optional(), // 引用はオプション
      comment: z.string().min(1, 'コメントが必要です'),
    })
  ).min(1, '最低1つの良い点が必要です')
    .max(5, '良い点が多すぎます'),
  improvementPoints: z.array(
    z.object({
      aspect: z.string().min(1, '改善の観点が必要です'),
      original: z.string().optional(), // 改善前の表現
      improved: z.string().min(1, '改善後の表現が必要です'),
      reason: z.string().min(1, '理由が必要です'),
    })
  ).min(1, '最低1つの改善点が必要です')
    .max(5, '改善点が多すぎます'),
  encouragement: z.string()
    .min(1, '励ましの言葉が必要です')
    .max(500, '励ましの言葉が長すぎます'),
});

/**
 * Whisper API レスポンスのスキーマ
 * 注: OpenAI APIは将来的にフィールドを追加する可能性があるため、
 *     必要なフィールドのみを検証し、未知のフィールドは許可する
 */
const WhisperResponseSchema = z.object({
  text: z.string().min(1, '文字起こしテキストが必要です'),
  duration: z.number().optional(),
  // usage: OpenAIが追加したフィールド（オプション、使用しない）
  // その他の未知のフィールドも許可
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cloud Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * AI質問生成 Cloud Function
 * HTTPSコール可能な関数として公開
 */
exports.generateQuestions = functions
  .region(CONFIG.FIREBASE.REGION)
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

      // JSONパース（try-catchで安全に）
      let parsedContent;
      try {
        parsedContent = JSON.parse(response.data.choices[0].message.content);
      } catch (parseError) {
        console.error('[generateQuestions] JSON parse error:', parseError.message);
        throw new Error('OpenAI APIのレスポンスが不正なJSON形式です');
      }

      // Zodスキーマによる詳細な検証
      let content;
      try {
        content = QuestionResponseSchema.parse(parsedContent);
      } catch (validationError) {
        console.error('[generateQuestions] Validation error:', validationError.errors);
        // Zodのエラーメッセージをログに記録
        const errorMessages = validationError.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`APIレスポンスの検証に失敗しました: ${errorMessages}`);
      }

      const REQUIRED_COUNT = CONFIG.QUESTION.AI_COUNT;
      const questions = content.questions.slice(0, REQUIRED_COUNT);

      if (content.questions.length > REQUIRED_COUNT) {
        console.warn(
          `[generateQuestions] AI generated ${content.questions.length} questions, using first ${REQUIRED_COUNT}`
        );
      }

      // 成功レスポンス
      console.log(`[generateQuestions] Success: ${questions.length} questions`);

      return {
        questions,
        totalQuestions: REQUIRED_COUNT,
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
  .region(CONFIG.FIREBASE.REGION)
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
          max_tokens: CONFIG.OPENAI.MAX_TOKENS_FEEDBACK,
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

      // JSONパース（try-catchで安全に）
      let parsedFeedback;
      try {
        parsedFeedback = JSON.parse(response.data.choices[0].message.content);
      } catch (parseError) {
        console.error('[generateFeedback] JSON parse error:', parseError.message);
        throw new Error('OpenAI APIのレスポンスが不正なJSON形式です');
      }

      // Zodスキーマによる詳細な検証
      let feedback;
      try {
        feedback = FeedbackResponseSchema.parse(parsedFeedback);
      } catch (validationError) {
        console.error('[generateFeedback] Validation error:', validationError.errors);
        // Zodのエラーメッセージをログに記録
        const errorMessages = validationError.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`APIレスポンスの検証に失敗しました: ${errorMessages}`);
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
 * 🆕 Day 11: 音声文字起こし Cloud Function
 * OpenAI Whisper APIを使用して音声をテキストに変換
 */
exports.transcribeAudio = functions
  .region(CONFIG.FIREBASE.REGION)
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB'
  })
  .https.onCall(async (data, context) => {

    // 認証チェック
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'この機能を使用するにはログインが必要です'
      );
    }

    // 入力バリデーション
    const { audioBase64, format = 'm4a' } = data;

    if (!audioBase64) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '音声データが必要です'
      );
    }

    // OpenAI APIキーの取得
    const OPENAI_API_KEY = functions.config().openai?.key;

    if (!OPENAI_API_KEY) {
      console.error('[transcribeAudio] OpenAI APIキーが設定されていません');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'OpenAI APIキーが設定されていません'
      );
    }

    // ユーザー情報をログに記録
    const userId = context.auth.uid;
    console.log(`[transcribeAudio] User: ${userId}, Format: ${format}`);

    try {
      // Base64をBufferに変換
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      
      console.log(`[transcribeAudio] Audio size: ${audioBuffer.length} bytes (${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

      // ファイルサイズチェック（25MB制限）
      const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
      if (audioBuffer.length > MAX_FILE_SIZE) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `音声ファイルが大きすぎます（最大25MB、現在${(audioBuffer.length / 1024 / 1024).toFixed(2)}MB）`
        );
      }

      // FormDataを作成
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: `audio.${format}`,
        contentType: `audio/${format}`
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'ja');

      // Whisper APIに送信
      console.log('[transcribeAudio] Sending to Whisper API...');
      
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            ...formData.getHeaders()
          },
          timeout: 60000, // 60秒
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      // Whisper APIレスポンスの検証
      let validatedResponse;
      try {
        validatedResponse = WhisperResponseSchema.parse(response.data);
      } catch (validationError) {
        console.error('[transcribeAudio] Validation error:', validationError.errors);
        const errorMessages = validationError.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`Whisper APIレスポンスの検証に失敗しました: ${errorMessages}`);
      }

      const transcribedText = validatedResponse.text;

      console.log(`[transcribeAudio] Success: ${transcribedText.length} characters transcribed`);

      // レスポンス返却
      return {
        text: transcribedText,
        duration: validatedResponse.duration || null,
        source: 'WHISPER'
      };

    } catch (error) {
      console.error('[transcribeAudio] Error:', error.message);

      // OpenAI APIエラーの場合
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error('[transcribeAudio] API Error:', status, errorData);

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
        } else if (status === 413) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            '音声ファイルが大きすぎます'
          );
        }
      }

      // その他のエラー
      throw new functions.https.HttpsError(
        'internal',
        '音声の文字起こしに失敗しました: ' + error.message
      );
    }
  });

/**
 * API接続テスト用の関数（デバッグ用）
 */
exports.checkOpenAIConnection = functions
  .region(CONFIG.FIREBASE.REGION)
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