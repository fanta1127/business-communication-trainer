// src/components/VoiceRecorder.js
// Day 11: Whisper API統合版

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
import Toast from 'react-native-toast-message';
import {
  transcribeAudioWithWhisper,
  isSpeechRecognitionAvailable,
  getSpeechErrorMessage,
} from '../services/speechService';

export default function VoiceRecorder({ onRecordingComplete, disabled = false }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimLoopRef = useRef(null);
  const durationInterval = useRef(null);
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);
  const recordingRef = useRef(null);
  const isTranscribingRef = useRef(false);
  const didCompleteRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    isTranscribingRef.current = isTranscribing;
  }, [isTranscribing]);

  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
          }
        } catch (err) {
          // クリーンアップ時のエラーは無視
        }

        try {
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        } catch (err) {
          // クリーンアップ時のエラーは無視
        }
      })();
    };
  }, []);

  useEffect(() => {
    checkSpeechAvailability();
  }, []);

  const checkSpeechAvailability = async () => {
    const available = await isSpeechRecognitionAvailable();
    setSpeechAvailable(available);
  };

  // 録音関連のステートを初期化するヘルパー関数
  const resetRecordingState = () => {
    setIsRecording(false);
    setRecordingDuration(0);
    setIsTranscribing(false);
  };

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

  const startRecording = async () => {
    if (isStartingRef.current || isRecording) {
      return;
    }
    isStartingRef.current = true;

    try {
      if (!permissionResponse || permissionResponse.status !== 'granted') {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert(
            '権限が必要です',
            'マイクへのアクセス権限が必要です。設定から権限を有効にしてください。'
          );
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      console.log('[VoiceRecorder] 録音開始');

    } catch (err) {
      console.error('[VoiceRecorder] 録音開始エラー:', err);
      Alert.alert('エラー', '録音を開始できませんでした。もう一度お試しください。');
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    if (didCompleteRef.current) {
      return;
    }

    try {
      setIsRecording(false);

      // 録音を停止
      await recording.stopAndUnloadAsync();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      const duration = recordingDuration;

      setRecording(null);
      setRecordingDuration(0);

      console.log('[VoiceRecorder] 録音完了:', { uri, duration });

      // 文字起こし開始
      if (uri && speechAvailable) {
        setIsTranscribing(true);

        try {
          console.log('[VoiceRecorder] 文字起こし開始...');
          
          const text = await transcribeAudioWithWhisper(uri);

          console.log('[VoiceRecorder] 文字起こし完了:', text);

          // テキストを親コンポーネントに渡す
          if (onRecordingComplete) {
            didCompleteRef.current = true;
            onRecordingComplete(text, duration);
          }

        } catch (transcribeError) {
          console.error('[VoiceRecorder] 文字起こしエラー:', transcribeError);

          // エラー時のアラート
          Alert.alert(
            '文字起こしエラー',
            getSpeechErrorMessage(transcribeError),
            [
              {
                text: 'キーボードで入力',
                onPress: () => {
                  if (onRecordingComplete) {
                    didCompleteRef.current = true;
                    onRecordingComplete('', duration);
                  }
                }
              }
            ]
          );
        } finally {
          setIsTranscribing(false);
        }
      } else {
        // 音声認識が利用できない場合
        Toast.show({
          type: 'info',
          text1: '録音完了 🎤',
          text2: '文字起こし機能が利用できません。手動で入力してください。',
          position: 'top',
          visibilityTime: 4000,
        });

        if (onRecordingComplete) {
          didCompleteRef.current = true;
          onRecordingComplete('', duration);
        }
      }

    } catch (err) {
      console.error('[VoiceRecorder] 録音停止エラー:', err);
      Alert.alert('エラー', '録音の保存に失敗しました。');
      resetRecordingState();
    } finally {
      setTimeout(() => {
        if (isMountedRef.current) {
          didCompleteRef.current = false;
        }
      }, 300);
      if (isMountedRef.current) {
        setIsTranscribing(false);
      }
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setRecording(null);
      setRecordingDuration(0);

      console.log('[VoiceRecorder] 録音キャンセル');

    } catch (err) {
      console.error('[VoiceRecorder] 録音キャンセルエラー:', err);
      resetRecordingState();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* 文字起こし中の表示 */}
      {isTranscribing && (
        <View style={styles.transcribingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.transcribingTitle}>文字起こし中...</Text>
          <Text style={styles.transcribingText}>
            AIがあなたの音声をテキストに変換しています
          </Text>
          <Text style={styles.transcribingHint}>
            30秒ほどお待ちください
          </Text>
        </View>
      )}

      {/* 録音ボタン/録音中UI（文字起こし中は非表示） */}
      {!isTranscribing && (
        <>
          {!isRecording ? (
            <TouchableOpacity
              style={[styles.recordButton, disabled && styles.recordButtonDisabled]}
              onPress={startRecording}
              disabled={disabled}
            >
              <Text style={styles.recordButtonIcon}>🎤</Text>
              <Text style={styles.recordButtonText}>音声で回答する</Text>
              <Text style={styles.recordButtonHint}>
                {speechAvailable 
                  ? 'タップして録音＋自動文字起こし' 
                  : 'タップして録音開始（文字起こし不可）'}
              </Text>
            </TouchableOpacity>
          ) : (
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

          <View style={styles.notice}>
            <Text style={styles.noticeIcon}>
              {speechAvailable ? '✅' : 'ℹ️'}
            </Text>
            <Text style={styles.noticeText}>
              {speechAvailable 
                ? '録音停止後、OpenAI Whisper APIで自動的に音声を文字起こしします。完了後、テキストを編集できます。'
                : '音声認識が利用できません。録音後、テキストで入力してください。'}
            </Text>
          </View>
        </>
      )}
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
  transcribingContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginBottom: 16,
  },
  transcribingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 16,
    marginBottom: 8,
  },
  transcribingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  transcribingHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
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