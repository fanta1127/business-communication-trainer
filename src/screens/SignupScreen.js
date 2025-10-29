// src/screens/SignupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { signUp } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
  const { refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // メールアドレスのバリデーション
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // パスワードのバリデーション
  const validatePassword = (password) => {
    // 6文字以上
    if (password.length < 6) {
      return { valid: false, message: 'パスワードは6文字以上で設定してください' };
    }
    // 英数字を含む（より強固にする場合）
    // const hasNumber = /\d/.test(password);
    // const hasLetter = /[a-zA-Z]/.test(password);
    // if (!hasNumber || !hasLetter) {
    //   return { valid: false, message: 'パスワードは英字と数字を含めてください' };
    // }
    return { valid: true };
  };

  // サインアップ処理
  const handleSignup = async () => {
    // バリデーション
    if (!displayName.trim()) {
      Alert.alert('エラー', '名前を入力してください');
      return;
    }

    if (!email.trim()) {
      Alert.alert('エラー', 'メールアドレスを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください');
      return;
    }

    if (!password) {
      Alert.alert('エラー', 'パスワードを入力してください');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      Alert.alert('エラー', passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }

    setLoading(true);

    try {
      await signUp(email.trim(), password, displayName.trim());

      // AuthContextの状態を手動で更新（updateProfile/reload後の情報を反映）
      refreshUser();

      // 成功時は自動的にAuthContextが更新され、ナビゲーションが切り替わる
    } catch (error) {
      Alert.alert('登録失敗', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          {/* タイトル */}
          <Text style={styles.title}>新規登録</Text>
          <Text style={styles.subtitle}>アカウントを作成して練習を記録しましょう</Text>

          {/* 名前入力 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>名前</Text>
            <TextInput
              style={styles.input}
              placeholder="山田太郎"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* メールアドレス入力 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* パスワード入力 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>パスワード</Text>
            <TextInput
              style={styles.input}
              placeholder="6文字以上"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
              textContentType="none"
              autoComplete="off"
            />
          </View>

          {/* パスワード確認入力 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>パスワード（確認）</Text>
            <TextInput
              style={styles.input}
              placeholder="もう一度入力してください"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
              textContentType="none"
              autoComplete="off"
            />
          </View>

          {/* 登録ボタン */}
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.disabledButton]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>登録</Text>
            )}
          </TouchableOpacity>

          {/* ログインリンク */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.loginLinkText}>
              既にアカウントをお持ちの方は
              <Text style={styles.loginLinkTextBold}> ログイン</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkTextBold: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});