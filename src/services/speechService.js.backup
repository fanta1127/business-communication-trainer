// src/services/speechService.js

/**
 * 音声認識サービス
 * @react-native-voice/voice を使用した音声→テキスト変換
 * 
 * Primary: デバイスのネイティブ音声認識
 * Fallback: キーボード入力
 */

import Voice from '@react-native-voice/voice';
import { Platform } from 'react-native';

/**
 * 音声認識の初期化
 * アプリ起動時に一度だけ呼び出す
 */
export const initializeSpeechRecognition = () => {
  console.log('[Speech] 音声認識サービスを初期化');
  
  // イベントリスナーをクリア（重複登録防止）
  Voice.destroy().then(Voice.removeAllListeners);
};

/**
 * 音声認識が利用可能かチェック
 * @returns {Promise<boolean>}
 */
export const isSpeechRecognitionAvailable = async () => {
  try {
    const isAvailable = await Voice.isAvailable();
    console.log('[Speech] 利用可能性:', isAvailable);
    return isAvailable === 1 || isAvailable === true;
  } catch (error) {
    console.error('[Speech] 利用可能性チェックエラー:', error);
    return false;
  }
};

/**
 * 音声ファイルから文字起こし
 * ⚠️ @react-native-voice/voice はリアルタイム認識のみサポート
 * このため、録音済みファイルからの変換は現時点では未対応
 * 
 * 代替案: 録音中にリアルタイム認識を並行実行
 * @param {string} audioUri - 録音ファイルのURI
 * @returns {Promise<string>} 文字起こしテキスト
 */
export const transcribeAudioFile = async (audioUri) => {
  console.log('[Speech] 録音ファイルからの文字起こしは未サポート:', audioUri);
  throw new Error('FILE_TRANSCRIPTION_NOT_SUPPORTED');
};

/**
 * リアルタイム音声認識を開始
 * VoiceRecorderコンポーネント内で録音と並行して実行
 * @param {Function} onResult - 認識結果のコールバック (text) => void
 * @param {Function} onError - エラーコールバック (error) => void
 * @returns {Promise<void>}
 */
export const startRealtimeRecognition = async (onResult, onError) => {
  try {
    console.log('[Speech] リアルタイム音声認識開始');
    
    // イベントハンドラーを設定
    Voice.onSpeechStart = () => {
      console.log('[Speech] 音声検出開始');
    };
    
    Voice.onSpeechEnd = () => {
      console.log('[Speech] 音声検出終了');
    };
    
    Voice.onSpeechResults = (event) => {
      console.log('[Speech] 認識結果:', event.value);
      if (event.value && event.value.length > 0) {
        const text = event.value[0];
        if (onResult) {
          onResult(text);
        }
      }
    };
    
    Voice.onSpeechPartialResults = (event) => {
      console.log('[Speech] 部分的な認識結果:', event.value);
      // 部分結果も利用可能（オプション）
    };
    
    Voice.onSpeechError = (event) => {
      console.error('[Speech] 音声認識エラー:', event.error);
      if (onError) {
        onError(event.error);
      }
    };
    
    // 音声認識開始（日本語）
    await Voice.start('ja-JP');
    console.log('[Speech] 音声認識を開始しました');
    
  } catch (error) {
    console.error('[Speech] リアルタイム認識開始エラー:', error);
    throw error;
  }
};

/**
 * リアルタイム音声認識を停止
 * @returns {Promise<void>}
 */
export const stopRealtimeRecognition = async () => {
  try {
    console.log('[Speech] リアルタイム音声認識停止');
    await Voice.stop();
    console.log('[Speech] 音声認識を停止しました');
  } catch (error) {
    console.error('[Speech] 音声認識停止エラー:', error);
    throw error;
  }
};

/**
 * リアルタイム音声認識をキャンセル
 * @returns {Promise<void>}
 */
export const cancelRealtimeRecognition = async () => {
  try {
    console.log('[Speech] リアルタイム音声認識キャンセル');
    await Voice.cancel();
    console.log('[Speech] 音声認識をキャンセルしました');
  } catch (error) {
    console.error('[Speech] 音声認識キャンセルエラー:', error);
    throw error;
  }
};

/**
 * 音声認識リソースをクリーンアップ
 * @returns {Promise<void>}
 */
export const cleanupSpeechRecognition = async () => {
  try {
    console.log('[Speech] 音声認識リソースをクリーンアップ');
    await Voice.destroy();
    Voice.removeAllListeners();
  } catch (error) {
    console.error('[Speech] クリーンアップエラー:', error);
  }
};

/**
 * エラーメッセージを取得
 * @param {Error|string} error 
 * @returns {string}
 */
export const getSpeechErrorMessage = (error) => {
  if (!error) return '不明なエラーが発生しました';
  
  const errorStr = typeof error === 'string' ? error : error.message || '';
  
  // エラーコードに応じたメッセージ
  if (errorStr.includes('permission') || errorStr.includes('Permission')) {
    return 'マイクと音声認識の使用許可が必要です。設定から許可してください。';
  }
  
  if (errorStr.includes('network') || errorStr.includes('Network')) {
    return 'ネットワークエラーが発生しました。';
  }
  
  if (errorStr.includes('recognizer') || errorStr.includes('not available')) {
    return '音声認識サービスが利用できません。';
  }
  
  if (errorStr.includes('busy')) {
    return '音声認識サービスが使用中です。もう一度お試しください。';
  }
  
  if (errorStr.includes('timeout') || errorStr.includes('Timeout')) {
    return '音声認識がタイムアウトしました。もう一度お試しください。';
  }
  
  if (errorStr.includes('FILE_TRANSCRIPTION_NOT_SUPPORTED')) {
    return '録音ファイルからの文字起こしは現在サポートされていません。';
  }
  
  return '音声認識に失敗しました。キーボードで入力してください。';
};

/**
 * プラットフォーム固有の注意事項を取得
 * @returns {string}
 */
export const getPlatformNotes = () => {
  if (Platform.OS === 'ios') {
    return 'iOS音声認識を使用します。初回使用時に権限の許可が必要です。';
  } else if (Platform.OS === 'android') {
    return 'Google音声認識を使用します。初回使用時に権限の許可が必要です。';
  }
  return '音声認識機能を使用します。';
};