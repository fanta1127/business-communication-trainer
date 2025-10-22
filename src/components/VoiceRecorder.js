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

export default function VoiceRecorder({ onRecordingComplete, disabled = false }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [transcribedText, setTranscribedText] = useState('');
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
        await stopSpeechRecognitionSafely(true);

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

  // 音声認識を安全に停止するヘルパー関数
  const stopSpeechRecognitionSafely = async (useCancel = false) => {
    if (!isTranscribing && !isTranscribingRef.current) return;

    try {
      if (useCancel) {
        await cancelRealtimeRecognition();
      } else {
        await stopRealtimeRecognition();
      }
    } catch (error) {
      // エラーは無視して続行
    }

    setIsTranscribing(false);
  };

  // 録音関連のステートを初期化するヘルパー関数
  const resetRecordingState = () => {
    setIsRecording(false);
    setRecordingDuration(0);
    setIsTranscribing(false);
    setTranscribedText('');
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
            'マイクと音声認識へのアクセス権限が必要です。設定から権限を有効にしてください。'
          );
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const canUseSpeech = await isSpeechRecognitionAvailable().catch(() => false);
      setSpeechAvailable(canUseSpeech);

      if (canUseSpeech) {
        setTranscribedText('');
        setIsTranscribing(true);
        
        try {
          await startRealtimeRecognition(
            (text) => {
              if (isMountedRef.current) {
                setTranscribedText(text);
              }
            },
            (error) => {
              if (isMountedRef.current) {
                setIsTranscribing(false);
              }
            }
          );
        } catch (speechError) {
          console.warn('[VoiceRecorder] 音声認識開始失敗:', speechError);
          setIsTranscribing(false);
          Alert.alert(
            '音声認識エラー',
            getSpeechErrorMessage?.(speechError) ?? '音声認識を開始できませんでした。録音は続行します。'
          );
        }
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

    } catch (err) {
      console.error('[VoiceRecorder] 録音開始エラー:', err);
      Alert.alert('エラー', '録音を開始できませんでした。もう一度お試しください。');
      setIsTranscribing(false);
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

      await stopSpeechRecognitionSafely(false);

      await recording.stopAndUnloadAsync();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const duration = recordingDuration;

      setRecording(null);
      setRecordingDuration(0);

      if (onRecordingComplete) {
        didCompleteRef.current = true;
        onRecordingComplete(transcribedText, duration);
      }

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

      setTranscribedText('');

    } catch (err) {
      console.error('[VoiceRecorder] 録音停止エラー:', err);
      Alert.alert('エラー', '録音の保存に失敗しました。');
      resetRecordingState();
    } finally {
      setTimeout(() => {
        didCompleteRef.current = false;
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

      await stopSpeechRecognitionSafely(true);

      await recording.stopAndUnloadAsync();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setRecording(null);
      setRecordingDuration(0);
      setTranscribedText('');

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
              ? 'タップして録音＋文字起こし開始' 
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
            
            {isTranscribing && (
              <View style={styles.transcribingStatus}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.transcribingText}>音声認識中</Text>
              </View>
            )}
            
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