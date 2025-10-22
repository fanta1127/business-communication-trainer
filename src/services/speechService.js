// src/services/speechService.js
// Day 10版: 録音のみ、文字起こしは未実装

/**
 * 音声認識サービス（スタブ版）
 * Day 11でWhisper APIまたはexpo-speech-recognitionを実装予定
 */

/**
 * 音声認識の初期化
 * 現在は何もしない
 */
export const initializeSpeechRecognition = () => {
    console.log('[Speech] 音声認識は未実装（Day 11実装予定）');
  };
  
  /**
   * 音声認識が利用可能かチェック
   * 現在は常にfalseを返す
   */
  export const isSpeechRecognitionAvailable = async () => {
    console.log('[Speech] 音声認識は未実装');
    return false;
  };
  
  /**
   * 音声ファイルから文字起こし
   * Day 11で実装予定
   */
  export const transcribeAudioFile = async (audioUri) => {
    console.log('[Speech] 文字起こしは未実装（Day 11実装予定）:', audioUri);
    throw new Error('音声認識機能は現在開発中です。キーボードで入力してください。');
  };
  
  /**
   * リアルタイム音声認識を開始
   * Day 11で実装予定
   */
  export const startRealtimeRecognition = async (onResult, onError) => {
    console.log('[Speech] リアルタイム音声認識は未実装');
    throw new Error('音声認識機能は現在開発中です。');
  };
  
  /**
   * リアルタイム音声認識を停止
   */
  export const stopRealtimeRecognition = async () => {
    console.log('[Speech] 停止（未実装）');
  };
  
  /**
   * リアルタイム音声認識をキャンセル
   */
  export const cancelRealtimeRecognition = async () => {
    console.log('[Speech] キャンセル（未実装）');
  };
  
  /**
   * 音声認識リソースをクリーンアップ
   */
  export const cleanupSpeechRecognition = async () => {
    console.log('[Speech] クリーンアップ（未実装）');
  };
  
  /**
   * エラーメッセージを取得
   */
  export const getSpeechErrorMessage = (error) => {
    return '音声認識機能は現在開発中です。キーボードで入力してください。';
  };
  
  /**
   * プラットフォーム固有の注意事項を取得
   */
  export const getPlatformNotes = () => {
    return '音声認識機能はDay 11で実装予定です。現在はキーボード入力をご使用ください。';
  };