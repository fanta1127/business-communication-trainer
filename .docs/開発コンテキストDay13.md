# 📄 開発コンテキスト - Business Communication Trainer (Day 13用)

**作成日**: 2025年10月26日
**バージョン**: v2.5（データ保存機能実装版）
**現在のステータス**: Day 12完了 ✅ + Firestoreデータモデル実装完了 ✅ → Day 13準備完了

---

## 📊 プロジェクト基本情報

| 項目 | 内容 |
|------|------|
| **リポジトリ** | https://github.com/fanta1127/business-communication-trainer/ |
| **現在のブランチ** | `day10-development-build` |
| **進捗** | Day 12/21 完了 (57.1%) |
| **次回** | Day 13 - データ保存機能実装 |
| **技術スタック** | React Native + Expo SDK 54 / Firebase / OpenAI API |

---

## 🎯 Day 13: データ保存機能実装

### **目標**
練習セッション完了時にFirestoreへ自動保存する機能を実装し、ユーザーが過去のセッションを振り返れるようにする。

### **実装内容**
1. **FeedbackScreen実装**: フィードバック表示と保存機能
2. **SessionContextへの統合**: Firestore保存機能の追加
3. **エラーハンドリング**: ネットワークエラー・権限エラーへの対応
4. **テスト**: 保存機能の動作確認

---

## 🎉 Week 2進捗状況

```
Week 1: 基盤構築 (100%完了!) ✅
├─ Day 1-4: 環境/認証/画面 ✅
├─ Day 5: 場面データ/SessionContext ✅
├─ Day 6: 音声録音機能 ✅
├─ Day 7: 練習画面の完成 ✅
└─ Day 8: OpenAI API（質問生成）✅

Week 2: AI統合 + データ管理 (85.7%完了)
├─ Day 9: ゲストモード廃止 + フィードバックAPI ✅
├─ Day 10: Android Development Build ✅
├─ Day 10.5: iOS実機テスト環境構築 ✅
├─ Day 11: 音声文字起こし機能（Whisper API）✅
├─ Day 12: Firestoreデータモデル ✅
├─ Day 13: データ保存機能 ⏳ ← 次回
└─ Day 14: 履歴機能 ⏳

全体進捗: 12/21日 (57.1%)
```

---

## 🎊 Day 12の主要成果（完了）

### ✅ Firestoreデータモデル実装完全成功

**達成内容**:
- ✅ firestoreService.js作成（全8関数実装）
- ✅ Firestoreセキュリティルール設定
- ✅ Firestoreインデックス設定
- ✅ Firebase デプロイ成功
- ✅ テスト完了（保存・取得・削除・セキュリティ）

**GitHubコミット**:
```
コミットID: 4fc460a
メッセージ: [feat] Day 12: Firestoreデータモデル実装
```

**利用可能な関数**:
```javascript
// src/services/firestoreService.js
import {
  saveSession,           // セッション保存
  getUserSessions,       // セッション一覧取得
  getSession,            // 特定セッション取得
  deleteSession,         // セッション削除
  getSessionCount,       // セッション数取得
  createUserProfile,     // ユーザープロファイル作成
  getFirestoreErrorMessage // エラーメッセージ変換
} from '../services/firestoreService';
```

---

## 📂 現在のプロジェクト構造（Day 12完了時点）

```
BusinessTrainer/
├── src/
│   ├── screens/
│   │   ├── PracticeScreen.js ✅ (質問生成・回答入力完了)
│   │   └── FeedbackScreen.js ⏳ Day 13実装予定 ← 次回
│   ├── contexts/
│   │   └── SessionContext.js ✅ (Day 13で拡張予定)
│   └── services/
│       └── firestoreService.js ✅ (Day 12で実装完了)
```

---

## 📋 Day 13実装タスク

### **タスク1: FeedbackScreen実装（2-3時間）**

#### **1-1. FeedbackScreen基本UI作成**

**ファイル**: `src/screens/FeedbackScreen.js`

**実装内容**:
```javascript
// src/screens/FeedbackScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function FeedbackScreen() {
  const { currentSession, resetSession } = useSession();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // フィードバックデータを取得
  const feedback = currentSession.feedback;

  // 自動保存（オプション）
  useEffect(() => {
    // Day 13で実装
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>お疲れ様でした！</Text>
        <Text style={styles.subtitle}>
          {currentSession.sceneName}の練習を完了しました
        </Text>
      </View>

      {/* サマリー */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryText}>{feedback.summary}</Text>
      </View>

      {/* 良かった点 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ 良かった点</Text>
        {feedback.goodPoints.map((point, index) => (
          <View key={index} style={styles.pointCard}>
            <Text style={styles.pointAspect}>{point.aspect}</Text>
            {point.quote && (
              <View style={styles.quoteContainer}>
                <Text style={styles.quote}>"{point.quote}"</Text>
              </View>
            )}
            <Text style={styles.pointComment}>{point.comment}</Text>
          </View>
        ))}
      </View>

      {/* 改善点 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 改善のヒント</Text>
        {feedback.improvementPoints.map((point, index) => (
          <View key={index} style={styles.pointCard}>
            <Text style={styles.pointAspect}>{point.aspect}</Text>

            <View style={styles.comparisonContainer}>
              <View style={styles.beforeContainer}>
                <Text style={styles.beforeLabel}>改善前:</Text>
                <Text style={styles.beforeText}>{point.original}</Text>
              </View>

              <View style={styles.afterContainer}>
                <Text style={styles.afterLabel}>改善後:</Text>
                <Text style={styles.afterText}>{point.improved}</Text>
              </View>
            </View>

            <Text style={styles.pointReason}>{point.reason}</Text>
          </View>
        ))}
      </View>

      {/* 励まし */}
      <View style={styles.encouragementSection}>
        <Text style={styles.encouragementText}>{feedback.encouragement}</Text>
      </View>

      {/* アクションボタン */}
      <View style={styles.actionsContainer}>
        {/* 保存ボタン（Day 13で実装） */}

        {/* 再練習ボタン */}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            resetSession();
            navigation.navigate('SceneSelection');
          }}
        >
          <Text style={styles.retryButtonText}>もう一度練習</Text>
        </TouchableOpacity>

        {/* ホームに戻る */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            resetSession();
            navigation.navigate('Home');
          }}
        >
          <Text style={styles.homeButtonText}>ホームに戻る</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  summarySection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pointCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  pointAspect: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  quoteContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  quote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  pointComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  comparisonContainer: {
    marginVertical: 8,
  },
  beforeContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  beforeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 4,
  },
  beforeText: {
    fontSize: 14,
    color: '#333',
  },
  afterContainer: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
  },
  afterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  afterText: {
    fontSize: 14,
    color: '#333',
  },
  pointReason: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
  encouragementSection: {
    backgroundColor: '#fff3e0',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  encouragementText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  homeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

#### **1-2. SessionContextに保存機能を追加**

**ファイル**: `src/contexts/SessionContext.js`

**追加する機能**:
```javascript
// src/contexts/SessionContext.js
import { saveSession } from '../services/firestoreService';
import { useAuth } from './AuthContext';

// SessionContextに追加
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState(null);

// セッションをFirestoreに保存
const saveSessionToFirestore = async () => {
  try {
    setSaving(true);
    setSaveError(null);

    console.log('[Session] Saving session to Firestore...');

    // ユーザーIDを取得
    const userId = user.uid;

    // セッションデータを準備
    const sessionData = {
      sceneId: currentSession.sceneId,
      sceneName: currentSession.sceneName,
      qaList: currentSession.qaList,
      feedback: currentSession.feedback,
      duration: currentSession.duration || 0,
    };

    // Firestoreに保存
    const sessionId = await saveSession(userId, sessionData);

    console.log('[Session] Session saved:', sessionId);

    return sessionId;

  } catch (error) {
    console.error('[Session] Save error:', error);
    setSaveError(error.message);
    throw error;
  } finally {
    setSaving(false);
  }
};

// Context Providerに追加
<SessionContext.Provider value={{
  // 既存の値
  currentSession,
  setCurrentSession,
  resetSession,
  // 新規追加
  saveSessionToFirestore,
  saving,
  saveError,
}}>
```

---

#### **1-3. FeedbackScreenに保存ボタンを追加**

**保存ボタンの実装**:
```javascript
// FeedbackScreen.js のアクションボタンセクション
import { useSession } from '../contexts/SessionContext';

const { saveSessionToFirestore, saving, saveError } = useSession();

const handleSave = async () => {
  try {
    const sessionId = await saveSessionToFirestore();

    Alert.alert(
      '保存完了',
      'セッションを保存しました。\n履歴から確認できます。',
      [
        {
          text: '履歴を見る',
          onPress: () => navigation.navigate('History'),
        },
        {
          text: 'OK',
          style: 'cancel',
        }
      ]
    );
  } catch (error) {
    Alert.alert(
      '保存エラー',
      'セッションの保存に失敗しました。\n\n' + error.message,
      [{ text: 'OK' }]
    );
  }
};

// JSX内
<TouchableOpacity
  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
  onPress={handleSave}
  disabled={saving}
>
  {saving ? (
    <ActivityIndicator size="small" color="#fff" />
  ) : (
    <Text style={styles.saveButtonText}>📁 履歴に保存</Text>
  )}
</TouchableOpacity>

// スタイル追加
saveButton: {
  backgroundColor: '#4CAF50',
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginBottom: 12,
  flexDirection: 'row',
  justifyContent: 'center',
},
saveButtonDisabled: {
  backgroundColor: '#9E9E9E',
},
saveButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
```

---

### **タスク2: エラーハンドリング（1時間）**

#### **2-1. ネットワークエラー対応**

```javascript
// SessionContext.js
const saveSessionToFirestore = async () => {
  try {
    setSaving(true);
    setSaveError(null);

    // ネットワーク確認（オプション）
    // const netInfo = await NetInfo.fetch();
    // if (!netInfo.isConnected) {
    //   throw new Error('インターネット接続がありません');
    // }

    const userId = user.uid;
    const sessionData = { ... };

    const sessionId = await saveSession(userId, sessionData);

    return sessionId;

  } catch (error) {
    console.error('[Session] Save error:', error);

    // エラーメッセージの分類
    let userMessage = error.message;

    if (error.message.includes('network') || error.message.includes('Network')) {
      userMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    } else if (error.message.includes('permission')) {
      userMessage = 'データへのアクセス権限がありません。ログインしてください。';
    }

    setSaveError(userMessage);
    throw new Error(userMessage);
  } finally {
    setSaving(false);
  }
};
```

---

#### **2-2. 保存エラー時のリトライ機能**

```javascript
// FeedbackScreen.js
const handleSaveWithRetry = async (retryCount = 0) => {
  const MAX_RETRIES = 2;

  try {
    const sessionId = await saveSessionToFirestore();

    Alert.alert(
      '保存完了',
      'セッションを保存しました。',
      [
        {
          text: '履歴を見る',
          onPress: () => navigation.navigate('History'),
        },
        { text: 'OK', style: 'cancel' }
      ]
    );
  } catch (error) {
    console.error('[Feedback] Save error:', error);

    if (retryCount < MAX_RETRIES) {
      // リトライを提案
      Alert.alert(
        '保存エラー',
        `セッションの保存に失敗しました。\n\n${error.message}\n\nもう一度試しますか？`,
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
          {
            text: 'リトライ',
            onPress: () => handleSaveWithRetry(retryCount + 1),
          }
        ]
      );
    } else {
      // 最大リトライ回数に達した
      Alert.alert(
        '保存エラー',
        `セッションの保存に失敗しました。\n\n${error.message}\n\n後で履歴画面から再度保存できます。`,
        [{ text: 'OK' }]
      );
    }
  }
};
```

---

### **タスク3: セッション時間の記録（30分）**

#### **3-1. SessionContextに時間計測機能を追加**

```javascript
// SessionContext.js
const [sessionStartTime, setSessionStartTime] = useState(null);

// セッション開始時
const startSession = (sceneId, sceneName) => {
  setSessionStartTime(Date.now());
  setCurrentSession({
    sceneId,
    sceneName,
    qaList: [],
    feedback: null,
  });
};

// セッション保存時に経過時間を計算
const saveSessionToFirestore = async () => {
  try {
    // ...

    // セッション時間を計算（秒単位）
    const duration = sessionStartTime
      ? Math.floor((Date.now() - sessionStartTime) / 1000)
      : 0;

    const sessionData = {
      sceneId: currentSession.sceneId,
      sceneName: currentSession.sceneName,
      qaList: currentSession.qaList,
      feedback: currentSession.feedback,
      duration, // 追加
    };

    // ...
  } catch (error) {
    // ...
  }
};
```

---

## 🧪 テスト項目

### **基本動作テスト**
- [ ] FeedbackScreenが正しく表示される
- [ ] フィードバック内容（サマリー・良かった点・改善点・励まし）が表示される
- [ ] 「履歴に保存」ボタンをタップしてセッションが保存される
- [ ] 保存成功時にアラートが表示される
- [ ] 保存成功後、Firebase Consoleでデータが確認できる
- [ ] 「もう一度練習」ボタンでSceneSelectionに遷移する
- [ ] 「ホームに戻る」ボタンでHomeに遷移する

### **エラーハンドリングテスト**
- [ ] ネットワークエラー時に適切なエラーメッセージが表示される
- [ ] 保存失敗時にリトライの選択肢が表示される
- [ ] 最大リトライ回数に達した場合の処理が正しい

### **データ整合性テスト**
- [ ] 保存されたセッションに全フィールドが含まれている
- [ ] セッション時間（duration）が正しく記録される
- [ ] userIdが正しく保存される
- [ ] createdAt/updatedAtが正しく設定される

### **UI/UXテスト**
- [ ] ローディング中は保存ボタンが無効化される
- [ ] ローディングインジケーターが表示される
- [ ] スクロールが正常に動作する
- [ ] ボタンが見やすく配置されている

---

## ⏱️ 所要時間

| タスク | 時間 |
|--------|------|
| **FeedbackScreen UI実装** | 2時間 |
| **SessionContext保存機能追加** | 1時間 |
| **保存ボタン実装** | 1時間 |
| **エラーハンドリング** | 1時間 |
| **テスト（保存・エラー処理）** | 1時間 |
| **デバッグ** | 0.5時間 |
| **合計** | 約6.5時間 |

---

## 🔧 Day 13完了基準

### ✅ 実装チェックリスト

#### **FeedbackScreen実装**
- [ ] FeedbackScreen.js作成
- [ ] フィードバック表示UI実装
- [ ] 保存ボタン実装
- [ ] ローディング表示実装
- [ ] エラー表示実装

#### **SessionContext拡張**
- [ ] saveSessionToFirestore() 実装
- [ ] セッション時間計測機能追加
- [ ] 保存状態管理（saving, saveError）

#### **エラーハンドリング**
- [ ] ネットワークエラー対応
- [ ] 権限エラー対応
- [ ] リトライ機能実装

#### **テスト**
- [ ] セッション保存テスト成功
- [ ] Firebase Consoleでデータ確認
- [ ] エラーハンドリング動作確認
- [ ] UI/UX動作確認

---

## 📝 重要な技術パターン

### **SessionContextでのFirestore統合**

```javascript
// SessionContext.js
import { saveSession } from '../services/firestoreService';
import { useAuth } from './AuthContext';

const SessionProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const saveSessionToFirestore = async () => {
    const sessionId = await saveSession(user.uid, currentSession);
    return sessionId;
  };

  return (
    <SessionContext.Provider value={{
      currentSession,
      setCurrentSession,
      saveSessionToFirestore,
      saving,
      saveError,
    }}>
      {children}
    </SessionContext.Provider>
  );
};
```

### **FeedbackScreenでの保存処理**

```javascript
// FeedbackScreen.js
const { saveSessionToFirestore, saving } = useSession();

const handleSave = async () => {
  try {
    const sessionId = await saveSessionToFirestore();
    Alert.alert('保存完了', 'セッションを保存しました。');
  } catch (error) {
    Alert.alert('保存エラー', error.message);
  }
};
```

---

## 🚀 次回（Day 14）予定

### **Day 14: 履歴機能**
- HistoryScreen実装（セッション一覧表示）
- SessionDetailScreen実装（詳細表示）
- Pull to Refresh
- 削除機能
- 削除確認ダイアログ
- 日付フォーマット処理

---

## 🎓 これまでの学習成果

### **Week 1-2で習得した技術**

1. **React Native + Expo開発**
   - コンポーネント設計 ✅
   - Navigation ✅
   - Context API ✅
   - Hooks（useState, useEffect, useRef）✅

2. **Firebase統合**
   - Authentication ✅
   - Cloud Functions ✅ (generateQuestions, generateFeedback, transcribeAudio)
   - Firestore ✅ (Day 12完了、Day 13で実用化)

3. **OpenAI API活用**
   - gpt-4o-mini（質問生成・フィードバック生成）✅
   - Whisper API（音声文字起こし）✅

4. **ネイティブ機能**
   - 音声録音（expo-av）✅
   - ファイルシステム（expo-file-system）✅
   - 権限管理 ✅

5. **開発プロセス**
   - Git/GitHub ✅
   - EAS Build ✅
   - Development Build ✅
   - デバッグ・トラブルシューティング ✅

6. **データ管理**
   - Firestore CRUD操作 ✅ (Day 12)
   - セキュリティルール ✅ (Day 12)
   - データバリデーション ✅

---

## 📞 開発サポート情報

### **リポジトリ**
- GitHub: https://github.com/fanta1127/business-communication-trainer/
- ブランチ: `day10-development-build`
- 最新コミット: `4fc460a`

### **ドキュメント**
- Expo: https://docs.expo.dev/
- Firebase: https://firebase.google.com/docs
- Firestore: https://firebase.google.com/docs/firestore
- React Navigation: https://reactnavigation.org/docs/getting-started

### **ビルド情報**
- EAS Project ID: `d8957a17-7f57-454d-b344-0c7202fd1168`
- Android Build ID: `c9c92a50-6a10-4ef9-8c27-21b37614c7d2`
- iOS: Xcode Local Build（無料Personal Team）

### **デバイス情報**
- Android: 実機テスト成功 ✅
- iOS: 実機テスト成功 ✅
- Bundle ID: `com.fanta1127.businesstrainer`

---

## 🎯 Day 13開始準備チェックリスト

### **環境確認**

```bash
# プロジェクトに移動
cd ~/Desktop/Coding_Practice/Expo-app/BusinessTrainer

# ブランチ確認
git branch
# day10-development-build

# 最新コードを確認
git status
git log --oneline -5
```

### **前提条件確認**

Day 13を開始する前に、以下が完了していることを確認:
- ✅ Day 12完了（firestoreService.js実装済み）
- ✅ Firestoreルール・インデックスデプロイ済み
- ✅ Firebase Console でデータベース確認済み
- ✅ SessionContext実装済み
- ✅ PracticeScreen実装済み（質問生成・回答入力）

---

## ✨ Week 2の目標（Day 13実施時点）

### **完了項目** ✅
- [x] Day 9: ゲストモード廃止 + フィードバックAPI
- [x] Day 10: Android Development Build
- [x] Day 10.5: iOS実機テスト環境構築
- [x] Day 11: 音声文字起こし機能（Whisper API）
- [x] Day 12: Firestoreデータモデル

### **今週の残りタスク** ⏳
- [ ] Day 13: データ保存機能 ← 次回
- [ ] Day 14: 履歴機能

### **Week 2終了時の目標**
```
✅ AI機能完全統合（質問生成・フィードバック・文字起こし）
✅ Android/iOS両対応
✅ Firestoreデータモデル構築
⏳ データ保存・履歴機能
⏳ エンドツーエンドで動作
```

---

## 🚀 Day 13: データ保存機能実装へ！

**練習セッション完了後、Firestoreに自動保存する機能を実装します！**

ユーザーが過去のセッションを振り返り、成長を追跡できるようになります。

**データ保存機能を実現しましょう！** 🎯

---

**最終更新**: Day 12完了（2025年10月26日）
**次回作業**: Day 13 - データ保存機能実装
**Week 2目標**: データ管理完全実装へ
