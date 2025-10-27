// src/services/speechService.js
// Day 11: OpenAI Whisper API統合版（expo-file-system最新API対応）

import { File } from 'expo-file-system';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FIREBASE_CONFIG } from '../constants/appConfig';

/**
 * Whisper APIで音声をテキストに変換
 * @param {string} audioUri - 録音ファイルのURI
 * @returns {Promise<string>} 文字起こしテキスト
 */
export const transcribeAudioWithWhisper = async (audioUri) => {
  try {
    console.log('[Speech] Transcribing with Whisper:', audioUri);

    // 1. 新しいFile APIを使用してバイナリデータを取得
    const file = new File(audioUri);
    const arrayBuffer = await file.arrayBuffer();
    
    // ArrayBufferをBase64に変換
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    console.log(`[Speech] Base64 size: ${base64.length} characters (${(base64.length / 1024).toFixed(2)} KB)`);

    // 2. Cloud Function呼び出し
    const functions = getFunctions(undefined, FIREBASE_CONFIG.REGION);
    const transcribeAudio = httpsCallable(functions, 'transcribeAudio');

    console.log('[Speech] Calling Cloud Function...');

    const result = await transcribeAudio({
      audioBase64: base64,
      format: 'm4a'
    });

    console.log('[Speech] Transcription success:', result.data.text);

    return result.data.text;

  } catch (error) {
    console.error('[Speech] Transcription error:', error);
    
    // エラーの詳細をログ
    if (error.code) {
      console.error('[Speech] Error code:', error.code);
    }
    if (error.message) {
      console.error('[Speech] Error message:', error.message);
    }
    
    throw error;
  }
};

/**
 * 音声認識が利用可能かチェック
 * Whisper APIは常に利用可能（ネットワーク接続があれば）
 */
export const isSpeechRecognitionAvailable = async () => {
  // Whisper APIはサーバーサイドなので、常に利用可能
  return true;
};

/**
 * リアルタイム音声認識を開始
 * 注意: Whisper APIはリアルタイム非対応のため、録音完了後に処理
 */
export const startRealtimeRecognition = async (onResult, onError) => {
  // Whisper APIはリアルタイム非対応
  // VoiceRecorderで録音完了後にtranscribeAudioWithWhisperを呼び出す
  console.log('[Speech] Realtime recognition not supported with Whisper API');
  
  // 何もしない（録音完了後に文字起こし）
  return;
};

/**
 * リアルタイム音声認識を停止
 */
export const stopRealtimeRecognition = async () => {
  // Whisper APIはリアルタイム非対応のため、何もしない
  console.log('[Speech] Stop realtime recognition (no-op)');
};

/**
 * リアルタイム音声認識をキャンセル
 */
export const cancelRealtimeRecognition = async () => {
  // Whisper APIはリアルタイム非対応のため、何もしない
  console.log('[Speech] Cancel realtime recognition (no-op)');
};

/**
 * 音声認識リソースをクリーンアップ
 */
export const cleanupSpeechRecognition = async () => {
  // Whisper APIはステートレスなので、クリーンアップ不要
  console.log('[Speech] Cleanup (no-op)');
};

/**
 * エラーメッセージを取得
 * @param {Error} error - エラーオブジェクト
 * @returns {string} ユーザー向けエラーメッセージ
 */
export const getSpeechErrorMessage = (error) => {
  if (!error) return '不明なエラーが発生しました';

  const message = error.message || '';
  const code = error.code || '';

  if (code === 'unauthenticated') {
    return 'ログインが必要です。もう一度ログインしてください。';
  }

  if (code === 'failed-precondition') {
    return 'OpenAI APIの設定に問題があります。管理者にお問い合わせください。';
  }

  if (code === 'resource-exhausted') {
    return 'APIの利用制限に達しました。しばらくしてから再試行してください。';
  }

  if (code === 'invalid-argument') {
    if (message.includes('大きすぎ')) {
      return '音声ファイルが大きすぎます。30秒以内の録音をお試しください。';
    }
    return '音声データに問題があります。もう一度録音してください。';
  }

  if (message.includes('network') || message.includes('Network')) {
    return 'ネットワークエラーが発生しました。接続を確認してください。';
  }

  if (message.includes('timeout') || message.includes('Timeout')) {
    return '処理がタイムアウトしました。もう一度お試しください。';
  }

  return '音声の文字起こしに失敗しました。キーボードで入力してください。';
};

/**
 * プラットフォーム固有の注意事項を取得
 */
export const getPlatformNotes = () => {
  return 'OpenAI Whisper APIを使用して音声を文字起こしします。録音完了後、自動的にテキスト化されます。';
};