// src/components/VoiceRecorder.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import {
  startRealtimeRecognition,
  stopRealtimeRecognition,
  cancelRealtimeRecognition,
  isSpeechRecognitionAvailable,
  getSpeechErrorMessage,
} from '../services/speechService';

/**
 * VoiceRecorderコンポーネント
 * 音声録音 + リアルタイム文字起こし機能を提供
 * 
 * Props:
 * - onRecordingComplete: (transcribedText, duration) => void - 録音完了時のコールバック
 * - disabled: boolean - ボタンの無効化
 */
export default function VoiceRecorder({ onRecordingComplete, disabled = false }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  
  // 文字起こし関連のステート
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(true);

  // アニメーション用の値
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimLoopRef = useRef(null);
  const durationInterval = useRef(null);
  
  // 多重起動ガード
  const isStartingRef = useRef(false);
  
  // 🔧 改善1: アンマウント時のクリーンアップ用Ref
  const isMountedRef = useRef(true);
  const recordingRef = useRef(null);
  const isTranscribingRef = useRef(false);
  
  // 🔧 改善3: 二重コールバック防止
  const didCompleteRef = useRef(false);

  // 🔧 改善1: マウント状態を追跡
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 🔧 改善1: 録音状態をRefに同期
  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  // 🔧 改善1: 文字起こし状態をRefに同期
  useEffect(() => {
    isTranscribingRef.current = isTranscribing;
  }, [isTranscribing]);

  // 🔧 改善1: アンマウント時の総クリーンアップ
  useEffect(() => {
    return () => {
      (async () => {
        try {
          // 音声認識をキャンセル
          if (isTranscribingRef.current) {
            await cancelRealtimeRecognition();
          }
        } catch (err) {
          console.warn('[VoiceRecorder] クリーンアップ: 音声認識停止エラー', err);
        }

        try {
          // 録音を停止
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
          }
        } catch (err) {
          console.warn('[VoiceRecorder] クリーンアップ: 録音停止エラー', err);
        }

        try {
          // オーディオモードをリセット
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        } catch (err) {
          console.warn('[VoiceRecorder] クリーンアップ: オーディオモードリセットエラー', err);
        }
      })();
    };
  }, []);

  // 音声認識の利用可能性チェック
  useEffect(() => {
    checkSpeechAvailability();
  }, []);

  const checkSpeechAvailability = async () => {
    const available = await isSpeechRecognitionAvailable();
    setSpeechAvailable(available);
    if (!available) {
      console.warn('[VoiceRecorder] 音声認識が利用できません');
    }
  };

  // 録音中のパルスアニメーション
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimLoopRef.current = loop;
      loop.start();

      // 録音時間のカウント
      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (pulseAnimLoopRef.current) {
        pulseAnimLoopRef.current.stop();
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (pulseAnimLoopRef.current) {
        pulseAnimLoopRef.current.stop();
      }
    };
  }, [isRecording]);

  /**
   * 録音と音声認識を開始
   */
  const startRecording = async () => {
    // 多重起動防止
    if (isStartingRef.current || isRecording) {
      console.warn('[VoiceRecorder] 録音開始の多重実行を防止');
      return;
    }
    isStartingRef.current = true;

    try {
      // 権限チェック
      if (!permissionResponse || permissionResponse.status !== 'granted') {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert(
            '権限が必要です',
            'マイクと音声認識へのアクセス権限が必要です。設定から権限を有効にしてください。'
          );
          return;
        }
      }

      // オーディオモードの設定
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      // 🔧 改善4: 開始直前に音声認識の可用性を再チェック
      const canUseSpeech = await isSpeechRecognitionAvailable().catch(() => false);
      setSpeechAvailable(canUseSpeech);

      // 音声認識を開始（リアルタイム）
      if (canUseSpeech) {
        setTranscribedText(''); // リセット
        setIsTranscribing(true);
        
        try {
          await startRealtimeRecognition(
            // 🔧 改善2: 認識結果のコールバック（アンマウント後のsetState回避）
            (text) => {
              console.log('[VoiceRecorder] 認識テキスト:', text);
              if (isMountedRef.current) {
                setTranscribedText(text);
              }
            },
            // 🔧 改善2: エラーコールバック（アンマウント後のsetState回避）
            (error) => {
              console.error('[VoiceRecorder] 音声認識エラー:', error);
              if (isMountedRef.current) {
                setIsTranscribing(false);
              }
            }
          );
        } catch (speechError) {
          console.warn('[VoiceRecorder] 音声認識開始失敗:', speechError);
          setIsTranscribing(false);
          // 🔧 改善5: STTエラーをユーザー向けに整形
          Alert.alert(
            '音声認識エラー',
            getSpeechErrorMessage?.(speechError) ?? '音声認識を開始できませんでした。録音は続行します。'
          );
          // 録音は続行
        }
      }

      // 録音開始
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      console.log('[VoiceRecorder] 録音と音声認識を開始しました');
      
    } catch (err) {
      console.error('[VoiceRecorder] 録音開始エラー:', err);
      Alert.alert('エラー', '録音を開始できませんでした。もう一度お試しください。');
      setIsTranscribing(false);
    } finally {
      isStartingRef.current = false;
    }
  };

  /**
   * 録音と音声認識を停止
   * 🔧 改善3: 二重コールバック防止
   */
  const stopRecording = async () => {
    if (!recording) return;
    
    // 🔧 改善3: 二重コールバック防止
    if (didCompleteRef.current) {
      console.warn('[VoiceRecorder] 録音完了の二重実行を防止');
      return;
    }

    try {
      setIsRecording(false);
      
      // 音声認識を停止
      if (isTranscribing) {
        try {
          await stopRealtimeRecognition();
        } catch (speechError) {
          console.warn('[VoiceRecorder] 音声認識停止エラー:', speechError);
        }
        setIsTranscribing(false);
      }
      
      // 録音を停止
      await recording.stopAndUnloadAsync();
      
      // オーディオモードをリセット
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      const duration = recordingDuration;
      
      setRecording(null);
      setRecordingDuration(0);

      console.log('[VoiceRecorder] 録音完了:', { uri, duration, transcribedText });

      // 🔧 改善3: 録音完了コールバック（一度だけ実行）
      if (onRecordingComplete) {
        didCompleteRef.current = true;
        onRecordingComplete(transcribedText, duration);
      }

      // 文字起こし結果に応じたメッセージ
      if (transcribedText && transcribedText.trim().length > 0) {
        Alert.alert(
          '録音完了',
          `${duration}秒の音声が録音され、文字起こしが完了しました。\n\nテキストを確認・編集してから次へ進んでください。`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '録音完了',
          `${duration}秒の音声が録音されました。\n\n文字起こしに失敗したため、テキストエリアに回答を入力してください。`,
          [{ text: 'OK' }]
        );
      }
      
      // リセット
      setTranscribedText('');
      
    } catch (err) {
      console.error('[VoiceRecorder] 録音停止エラー:', err);
      Alert.alert('エラー', '録音の保存に失敗しました。');
      setIsRecording(false);
      setRecordingDuration(0);
      setIsTranscribing(false);
      setTranscribedText('');
    } finally {
      // 🔧 改善3: 少し遅らせて再度停止可能に戻す（連打対策）
      setTimeout(() => {
        didCompleteRef.current = false;
      }, 300);
      // 失敗してもUIを正常化
      if (isMountedRef.current) {
        setIsTranscribing(false);
      }
    }
  };

  /**
   * 録音と音声認識をキャンセル
   */
  const cancelRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      
      // 音声認識をキャンセル
      if (isTranscribing) {
        try {
          await cancelRealtimeRecognition();
        } catch (speechError) {
          console.warn('[VoiceRecorder] 音声認識キャンセルエラー:', speechError);
        }
        setIsTranscribing(false);
      }
      
      await recording.stopAndUnloadAsync();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setRecording(null);
      setRecordingDuration(0);
      setTranscribedText('');
      console.log('[VoiceRecorder] 録音をキャンセルしました');
      
    } catch (err) {
      console.error('[VoiceRecorder] 録音キャンセルエラー:', err);
      setIsRecording(false);
      setRecordingDuration(0);
      setIsTranscribing(false);
      setTranscribedText('');
    }
  };

  /**
   * 時間を MM:SS 形式でフォーマット
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {!isRecording ? (
        // 録音開始ボタン
        <TouchableOpacity
          style={[styles.recordButton, disabled && styles.recordButtonDisabled]}
          onPress={startRecording}
          disabled={disabled}
        >
          <Text style={styles.recordButtonIcon}>🎤</Text>
          <Text style={styles.recordButtonText}>音声で回答する</Text>
          <Text style={styles.recordButtonHint}>
            {speechAvailable 
              ? 'タップして録音＋文字起こし開始' 
              : 'タップして録音開始（文字起こし不可）'}
          </Text>
        </TouchableOpacity>
      ) : (
        // 録音中UI
        <View style={styles.recordingContainer}>
          <Animated.View
            style={[
              styles.recordingIndicator,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.recordingDot} />
          </Animated.View>

          <View style={styles.recordingInfo}>
            <Text style={styles.recordingText}>録音中...</Text>
            <Text style={styles.recordingDuration}>
              {formatDuration(recordingDuration)}
            </Text>
            
            {/* 文字起こし状態表示 */}
            {isTranscribing && (
              <View style={styles.transcribingStatus}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.transcribingText}>音声認識中</Text>
              </View>
            )}
            
            {/* 認識中のテキストをリアルタイム表示 */}
            {transcribedText && transcribedText.trim().length > 0 && (
              <View style={styles.liveTextContainer}>
                <Text style={styles.liveTextLabel}>認識中:</Text>
                <Text style={styles.liveText} numberOfLines={2}>
                  {transcribedText}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.recordingActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={cancelRecording}
            >
              <Text style={styles.actionButtonText}>✕</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={stopRecording}
            >
              <Text style={styles.actionButtonText}>⬛</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 音声認識の案内 */}
      <View style={styles.notice}>
        <Text style={styles.noticeIcon}>
          {speechAvailable ? '✅' : 'ℹ️'}
        </Text>
        <Text style={styles.noticeText}>
          {speechAvailable 
            ? '録音中にリアルタイムで音声を文字起こしします。完了後、テキストを編集できます。'
            : '音声認識が利用できません。録音後、テキストで入力してください。'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  recordButtonDisabled: {
    borderColor: '#e0e0e0',
    opacity: 0.5,
  },
  recordButtonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  recordButtonHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  recordingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  recordingIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5252',
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5252',
    marginBottom: 8,
  },
  recordingDuration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  transcribingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  transcribingText: {
    fontSize: 14,
    color: '#2196F3',
  },
  liveTextContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    width: '100%',
  },
  liveTextLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  liveText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  stopButton: {
    backgroundColor: '#FF5252',
  },
  actionButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  notice: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
});