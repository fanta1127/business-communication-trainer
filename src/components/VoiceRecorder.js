// src/components/VoiceRecorder.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';

/**
 * VoiceRecorderコンポーネント
 * 音声録音機能を提供（expo-av使用）
 * 
 * Props:
 * - onRecordingComplete: (audioUri, duration) => void - 録音完了時のコールバック
 * - disabled: boolean - ボタンの無効化
 */
export default function VoiceRecorder({ onRecordingComplete, disabled = false }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // アニメーション用の値
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef(null);

  // 録音中のパルスアニメーション
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
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
      ).start();

      // 録音時間のカウント
      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isRecording]);

  /**
   * 録音を開始
   */
  const startRecording = async () => {
    try {
      // マイク権限の確認
      if (permissionResponse.status !== 'granted') {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert(
            '権限が必要です',
            'マイクへのアクセス権限が必要です。設定から権限を有効にしてください。'
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

      // 録音開始
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      console.log('録音を開始しました');
    } catch (err) {
      console.error('録音開始エラー:', err);
      Alert.alert('エラー', '録音を開始できませんでした。もう一度お試しください。');
    }
  };

  /**
   * 録音を停止
   */
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      // オーディオモードをリセット
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      const duration = recordingDuration;
      
      setRecording(null);
      setRecordingDuration(0);

      console.log('録音完了:', { uri, duration });

      // 録音完了コールバック
      if (onRecordingComplete && uri) {
        onRecordingComplete(uri, duration);
      }

      Alert.alert(
        '録音完了',
        `${duration}秒の音声が録音されました。\n\n現在、音声からテキストへの自動変換機能は開発中です。テキストエリアに回答を入力してください。`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('録音停止エラー:', err);
      Alert.alert('エラー', '録音の保存に失敗しました。');
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  /**
   * 録音のキャンセル
   */
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
      console.log('録音をキャンセルしました');
    } catch (err) {
      console.error('録音キャンセルエラー:', err);
      setIsRecording(false);
      setRecordingDuration(0);
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
          <Text style={styles.recordButtonHint}>タップして録音開始</Text>
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
        <Text style={styles.noticeIcon}>ℹ️</Text>
        <Text style={styles.noticeText}>
          音声認識機能は開発中です。録音後、テキストで入力してください。
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