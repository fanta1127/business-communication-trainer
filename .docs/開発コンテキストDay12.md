# 📄 開発コンテキスト - Business Communication Trainer (Day 12用)

**作成日**: 2025年10月26日
**バージョン**: v2.3（AI機能完全統合版）
**現在のステータス**: Day 11完了 ✅ + Whisper API統合完了 ✅ → Day 12準備完了

---

## 📊 プロジェクト基本情報

| 項目 | 内容 |
|------|------|
| **リポジトリ** | https://github.com/fanta1127/business-communication-trainer/ |
| **現在のブランチ** | `day10-development-build` |
| **進捗** | Day 11/21 完了 (60.5%) |
| **次回** | Day 12 - Firestoreデータモデル実装 |
| **技術スタック** | React Native + Expo SDK 54 / Firebase / OpenAI API |

---

## 🎯 Day 12: Firestoreデータモデル実装

### **目標**
練習セッションのデータをFirestoreに保存・取得・削除する機能を実装し、データ永続化の基盤を構築する。

### **実装内容**
1. **firestoreService.js作成**: セッション操作の全関数を実装
2. **Firestoreセキュリティルール設定**: ユーザー認証とデータアクセス制御
3. **テスト**: 保存・取得・削除の動作確認

---

## 🎉 Week 2進捗状況

```
Week 1: 基盤構築 (100%完了!) ✅
├─ Day 1-4: 環境/認証/画面 ✅
├─ Day 5: 場面データ/SessionContext ✅
├─ Day 6: 音声録音機能 ✅
├─ Day 7: 練習画面の完成 ✅
└─ Day 8: OpenAI API（質問生成）✅

Week 2: AI統合 + データ管理 (78.6%完了)
├─ Day 9: ゲストモード廃止 + フィードバックAPI ✅
├─ Day 10: Android Development Build ✅
├─ Day 10.5: iOS実機テスト環境構築 ✅
├─ Day 11: 音声文字起こし機能（Whisper API）✅ ← 完了！
├─ Day 12: Firestoreデータモデル ⏳ ← 次回
├─ Day 13: データ保存機能 ⏳
└─ Day 14: 履歴機能 ⏳

全体進捗: 11/21日 (60.5%)
```

---

## 🎊 Day 11の主要成果（完了）

### ✅ OpenAI Whisper API統合完全成功

**達成内容**:
- ✅ transcribeAudio Cloud Function実装（functions/index.js:430-569）
- ✅ speechService.js完全実装（expo-file-system最新API対応）
- ✅ VoiceRecorder.js完全更新（Whisper統合）
- ✅ Zodスキーマ検証実装（WhisperResponseSchema）
- ✅ Base64変換実装（ArrayBuffer → Base64）
- ✅ エラーハンドリング完全実装
- ✅ 文字起こし中UI実装
- ✅ キーボードフォールバック実装

**テスト結果**:
```
Android実機: ✅ 文字起こし成功
iOS実機: ✅ 文字起こし成功
質問生成連携: ✅ 動作確認
フィードバック生成: ✅ 動作確認
エンドツーエンド: ✅ 全機能動作
```

**ユーザー確認**:
> "デプロイ完了、うまく文字起こしと質問生成ができました。"

**主要実装**:
```javascript
// functions/index.js
exports.transcribeAudio = functions
  .region(CONFIG.FIREBASE.REGION)
  .runWith({ timeoutSeconds: 60, memory: '512MB' })
  .https.onCall(async (data, context) => {
    // ✅ 認証チェック
    // ✅ Base64 → Buffer変換
    // ✅ ファイルサイズ検証（25MB制限）
    // ✅ FormData作成
    // ✅ Whisper API呼び出し
    // ✅ Zod検証
    // ✅ エラーハンドリング
  });

// src/services/speechService.js
export const transcribeAudioWithWhisper = async (audioUri) => {
  // ✅ expo-file-system File API使用
  // ✅ ArrayBuffer → Base64変換
  // ✅ Cloud Function呼び出し
  // ✅ エラーメッセージ処理
};
```

**追加パッケージ**:
- `form-data: ^4.0.4` (functions)
- `zod: ^3.24.1` (functions)

---

## 📂 現在のプロジェクト構造（Day 11完了時点）

```
BusinessTrainer/
├── app.json ✅
├── eas.json ✅
├── package.json ✅ (Expo SDK 54)
├── .env ✅ (Firebase設定)
├── .gitignore ✅
├── assets/ ✅
├── src/
│   ├── components/
│   │   └── VoiceRecorder.js ✅ (Whisper API統合完了)
│   ├── screens/
│   │   ├── HomeScreen.js ✅
│   │   ├── SceneSelectionScreen.js ✅
│   │   ├── PracticeScreen.js ✅
│   │   ├── FeedbackScreen.js ⏳ Day 13実装予定
│   │   ├── HistoryScreen.js ⏳ Day 14実装予定
│   │   ├── SessionDetailScreen.js ⏳ Day 14実装予定
│   │   ├── LoginScreen.js ✅
│   │   ├── SignupScreen.js ✅
│   │   └── ProfileScreen.js ✅
│   ├── contexts/
│   │   ├── AuthContext.js ✅
│   │   └── SessionContext.js ✅
│   ├── services/
│   │   ├── authService.js ✅
│   │   ├── firebaseConfig.js ✅
│   │   ├── openaiService.js ✅ (generateQuestions, generateFeedback)
│   │   ├── speechService.js ✅ (Whisper API統合完了)
│   │   └── firestoreService.js ⏳ Day 12実装予定 ← 次回
│   ├── constants/
│   │   ├── appConfig.js ✅
│   │   ├── scenes.js ✅
│   │   ├── defaultQuestions.js ✅
│   │   └── defaultFeedback.js ✅
│   └── navigation/
│       └── AppNavigator.js ✅
├── functions/
│   ├── index.js ✅ (generateQuestions, generateFeedback, transcribeAudio)
│   ├── config.js ✅
│   └── package.json ✅ (form-data, zod追加済み)
└── ios/ (gitignore対象、Xcode管理)
    ├── BusinessTrainer.xcworkspace ✅
    └── BusinessTrainer.xcodeproj ✅
```

---

## 📋 Day 12実装タスク

### **午前（2-3時間）: firestoreService.js実装**

#### **1. firestoreService.js作成**

**ファイル**: `src/services/firestoreService.js`

**実装内容**:
```javascript
// src/services/firestoreService.js
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { app } from './firebaseConfig';

const db = getFirestore(app);

/**
 * セッションをFirestoreに保存
 * @param {string} userId - ユーザーID
 * @param {object} sessionData - セッションデータ
 * @returns {Promise<string>} セッションID
 */
export const saveSession = async (userId, sessionData) => {
  try {
    console.log('[Firestore] Saving session for user:', userId);

    // セッションデータを準備
    const sessionToSave = {
      userId,
      sceneId: sessionData.sceneId,
      sceneName: sessionData.sceneName,
      qaList: sessionData.qaList,
      totalQuestions: sessionData.qaList.length,
      feedback: sessionData.feedback || null,
      duration: sessionData.duration || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Firestoreに保存
    const docRef = await addDoc(collection(db, 'sessions'), sessionToSave);

    console.log('[Firestore] Session saved:', docRef.id);

    return docRef.id;

  } catch (error) {
    console.error('[Firestore] Save session error:', error);
    throw new Error('セッションの保存に失敗しました: ' + error.message);
  }
};

/**
 * ユーザーのセッション一覧を取得
 * @param {string} userId - ユーザーID
 * @param {number} limitCount - 取得件数（デフォルト: 10）
 * @returns {Promise<Array>} セッション一覧
 */
export const getUserSessions = async (userId, limitCount = 10) => {
  try {
    console.log('[Firestore] Fetching sessions for user:', userId);

    // クエリを作成
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // データ取得
    const querySnapshot = await getDocs(q);

    // セッション一覧を整形
    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({
        sessionId: doc.id,
        ...doc.data(),
      });
    });

    console.log('[Firestore] Fetched sessions:', sessions.length);

    return sessions;

  } catch (error) {
    console.error('[Firestore] Get sessions error:', error);
    throw new Error('セッション一覧の取得に失敗しました: ' + error.message);
  }
};

/**
 * 特定のセッションを取得
 * @param {string} sessionId - セッションID
 * @returns {Promise<object>} セッションデータ
 */
export const getSession = async (sessionId) => {
  try {
    console.log('[Firestore] Fetching session:', sessionId);

    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('セッションが見つかりません');
    }

    const session = {
      sessionId: docSnap.id,
      ...docSnap.data(),
    };

    console.log('[Firestore] Session fetched:', sessionId);

    return session;

  } catch (error) {
    console.error('[Firestore] Get session error:', error);
    throw new Error('セッションの取得に失敗しました: ' + error.message);
  }
};

/**
 * セッションを削除
 * @param {string} sessionId - セッションID
 * @param {string} userId - ユーザーID（所有者確認用）
 * @returns {Promise<void>}
 */
export const deleteSession = async (sessionId, userId) => {
  try {
    console.log('[Firestore] Deleting session:', sessionId);

    // セッションを取得して所有者確認
    const session = await getSession(sessionId);

    if (session.userId !== userId) {
      throw new Error('このセッションを削除する権限がありません');
    }

    // 削除実行
    await deleteDoc(doc(db, 'sessions', sessionId));

    console.log('[Firestore] Session deleted:', sessionId);

  } catch (error) {
    console.error('[Firestore] Delete session error:', error);
    throw new Error('セッションの削除に失敗しました: ' + error.message);
  }
};

/**
 * セッション数を取得
 * @param {string} userId - ユーザーID
 * @returns {Promise<number>} セッション数
 */
export const getSessionCount = async (userId) => {
  try {
    console.log('[Firestore] Counting sessions for user:', userId);

    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    const count = querySnapshot.size;

    console.log('[Firestore] Session count:', count);

    return count;

  } catch (error) {
    console.error('[Firestore] Count sessions error:', error);
    throw new Error('セッション数の取得に失敗しました: ' + error.message);
  }
};

/**
 * ユーザープロファイルを作成
 * @param {string} userId - ユーザーID
 * @param {object} userData - ユーザーデータ
 * @returns {Promise<void>}
 */
export const createUserProfile = async (userId, userData) => {
  try {
    console.log('[Firestore] Creating user profile:', userId);

    const userProfile = {
      userId,
      email: userData.email,
      displayName: userData.displayName || '',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      settings: {
        autoSave: true,
        notifications: false,
      },
    };

    // setDocではなくaddDocを使う場合
    await addDoc(collection(db, 'users'), userProfile);

    console.log('[Firestore] User profile created:', userId);

  } catch (error) {
    console.error('[Firestore] Create user profile error:', error);
    throw new Error('ユーザープロファイルの作成に失敗しました: ' + error.message);
  }
};

/**
 * エラーメッセージを取得
 * @param {Error} error - エラーオブジェクト
 * @returns {string} ユーザー向けエラーメッセージ
 */
export const getFirestoreErrorMessage = (error) => {
  if (!error) return '不明なエラーが発生しました';

  const message = error.message || '';
  const code = error.code || '';

  if (code === 'permission-denied') {
    return 'データへのアクセス権限がありません。ログインしてください。';
  }

  if (code === 'not-found') {
    return 'データが見つかりません。';
  }

  if (code === 'already-exists') {
    return 'データが既に存在します。';
  }

  if (message.includes('network') || message.includes('Network')) {
    return 'ネットワークエラーが発生しました。接続を確認してください。';
  }

  if (message.includes('offline') || message.includes('Offline')) {
    return 'オフラインです。インターネット接続を確認してください。';
  }

  return 'データ操作に失敗しました。もう一度お試しください。';
};
```

---

### **午後（2-3時間）: Firestoreセキュリティルール設定**

#### **1. Firestoreセキュリティルールの設定**

**ファイル**: `firestore.rules`（プロジェクトルートに作成）

**実装内容**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ヘルパー関数
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 認証済みかチェック
    function isAuthenticated() {
      return request.auth != null;
    }

    // 所有者かチェック
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // users コレクション
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    match /users/{userId} {
      // 自分のプロファイルのみ読み書き可能
      allow read, write: if isOwner(userId);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // sessions コレクション
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    match /sessions/{sessionId} {
      // 読み取り: 認証済みかつ自分のセッション
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;

      // 作成: 認証済みかつuserIdが自分のID
      allow create: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.keys().hasAll([
                        'userId', 'sceneId', 'sceneName', 'qaList',
                        'totalQuestions', 'createdAt', 'updatedAt'
                      ]);

      // 更新: 認証済みかつ自分のセッション
      allow update: if isAuthenticated() &&
                      resource.data.userId == request.auth.uid;

      // 削除: 認証済みかつ自分のセッション
      allow delete: if isAuthenticated() &&
                      resource.data.userId == request.auth.uid;
    }
  }
}
```

#### **2. Firestoreインデックスの設定**

**ファイル**: `firestore.indexes.json`（プロジェクトルートに作成）

**実装内容**:
```json
{
  "indexes": [
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

#### **3. デプロイ**

```bash
# Firestoreルールとインデックスをデプロイ
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 🧪 テスト項目

### **基本動作テスト**
- [ ] セッション保存が成功する
- [ ] 保存したセッションを取得できる
- [ ] セッション一覧を取得できる（最新順）
- [ ] セッションを削除できる
- [ ] セッション数をカウントできる

### **セキュリティテスト**
- [ ] 他人のセッションを読み取れない
- [ ] 他人のセッションを削除できない
- [ ] 未認証状態でセッションを作成できない
- [ ] 未認証状態でセッションを読み取れない

### **データ整合性テスト**
- [ ] 必須フィールドが全て保存される
- [ ] serverTimestamp()が正しく動作する
- [ ] qaListの配列データが正しく保存される
- [ ] feedbackオブジェクトが正しく保存される

### **エラーハンドリングテスト**
- [ ] ネットワークエラー時の動作
- [ ] 権限エラー時の動作
- [ ] 存在しないセッションIDでのエラー
- [ ] 不正なuserIdでのエラー

---

## ⏱️ 所要時間

| タスク | 時間 |
|--------|------|
| **firestoreService.js実装** | 2時間 |
| **Firestoreルール設定** | 1時間 |
| **インデックス設定** | 0.5時間 |
| **テスト（保存・取得・削除）** | 1.5時間 |
| **デバッグ** | 0.5時間 |
| **合計** | 約5.5時間 |

---

## 🔧 Day 12完了基準

### ✅ 実装チェックリスト

#### **サービス実装**
- [ ] firestoreService.js作成
- [ ] saveSession() 実装
- [ ] getUserSessions() 実装
- [ ] getSession() 実装
- [ ] deleteSession() 実装
- [ ] getSessionCount() 実装
- [ ] createUserProfile() 実装（オプション）
- [ ] エラーメッセージ関数実装

#### **Firestore設定**
- [ ] firestore.rules作成
- [ ] firestore.indexes.json作成
- [ ] Firestoreルールデプロイ成功
- [ ] Firestoreインデックスデプロイ成功

#### **テスト**
- [ ] セッション保存テスト成功
- [ ] セッション取得テスト成功
- [ ] セッション一覧取得テスト成功
- [ ] セッション削除テスト成功
- [ ] セキュリティルール動作確認
- [ ] エラーハンドリング動作確認

---

## 📝 重要な技術パターン

### **Firestoreデータ構造**

```javascript
// sessionsコレクション
{
  sessionId: "auto-generated-id",
  userId: "firebaseAuthUid",
  sceneId: "weekly-report",
  sceneName: "週次報告会議",
  qaList: [
    {
      questionId: "q1",
      questionText: "質問内容",
      answerText: "回答内容",
      answerDuration: 45,
      isFixedQuestion: true
    }
    // ... AI質問3問
  ],
  totalQuestions: 4,
  feedback: {
    summary: "総評",
    goodPoints: [...],
    improvementPoints: [...],
    encouragement: "励ましの言葉"
  },
  duration: 480,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### **Firestoreクエリパターン**

```javascript
// ユーザーのセッション一覧（最新順、10件）
const q = query(
  collection(db, 'sessions'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(10)
);
```

### **serverTimestamp()の使用**

```javascript
// 作成時
createdAt: serverTimestamp()

// 取得時（Timestampオブジェクト）
const timestamp = session.createdAt;
const date = timestamp.toDate(); // JavaScript Dateに変換
```

---

## 🚀 次回（Day 13-14）予定

### **Day 13: データ保存機能**
- FeedbackScreenでのセッション自動保存
- 保存成功/失敗の通知
- ローディング表示
- エラーハンドリング
- オフライン対応（基本）

### **Day 14: 履歴機能**
- HistoryScreen実装（セッション一覧表示）
- SessionDetailScreen実装（詳細表示）
- Pull to Refresh
- 削除機能
- 削除確認ダイアログ

---

## 🎓 これまでの学習成果

### **Week 1-2で習得した技術**

1. **React Native + Expo開発**
   - コンポーネント設計
   - Navigation
   - Context API
   - Hooks（useState, useEffect, useRef）

2. **Firebase統合**
   - Authentication ✅
   - Cloud Functions ✅ (generateQuestions, generateFeedback, transcribeAudio)
   - Firestore ⏳ (Day 12実装中)

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

6. **iOS/Android開発**
   - Xcodeビルド設定 ✅
   - サンドボックス設定 ✅
   - Personal Team署名 ✅
   - クロスプラットフォーム対応 ✅

7. **データバリデーション**
   - Zod スキーマ検証 ✅
   - エラーハンドリング ✅

---

## 📞 開発サポート情報

### **リポジトリ**
- GitHub: https://github.com/fanta1127/business-communication-trainer/
- ブランチ: `day10-development-build`

### **ドキュメント**
- Expo: https://docs.expo.dev/
- Firebase: https://firebase.google.com/docs
- Firestore: https://firebase.google.com/docs/firestore
- OpenAI Whisper: https://platform.openai.com/docs/guides/speech-to-text

### **ビルド情報**
- EAS Project ID: `d8957a17-7f57-454d-b344-0c7202fd1168`
- Android Build ID: `c9c92a50-6a10-4ef9-8c27-21b37614c7d2`
- iOS: Xcode Local Build（無料Personal Team）

### **デバイス情報**
- Android: 実機テスト成功 ✅
- iOS: 実機テスト成功 ✅
- Bundle ID: `com.fanta1127.businesstrainer`

---

## 🎯 Day 12開始準備チェックリスト

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

### **Firebase CLI確認**

```bash
# Firebase CLIインストール確認
firebase --version

# ログイン確認
firebase login

# プロジェクト確認
firebase projects:list

# 現在のプロジェクト確認
firebase use
```

### **Firestore初期化確認**

Firebase Consoleで以下を確認:
1. Firestoreデータベースが作成されているか
2. リージョン設定（asia-northeast1推奨）
3. セキュリティルールの初期状態

---

## ✨ Week 2の目標（再確認）

### **完了項目** ✅
- [x] Day 9: ゲストモード廃止 + フィードバックAPI
- [x] Day 10: Android Development Build
- [x] Day 10.5: iOS実機テスト環境構築
- [x] Day 11: 音声文字起こし機能（Whisper API）

### **今週の残りタスク** ⏳
- [ ] Day 12: Firestoreデータモデル
- [ ] Day 13: データ保存機能
- [ ] Day 14: 履歴機能

### **Week 2終了時の目標**
```
✅ AI機能完全統合（質問生成・フィードバック・文字起こし）
✅ Android/iOS両対応
⏳ データ保存・履歴機能
⏳ エンドツーエンドで動作
```

---

## 🎊 Day 12準備完了の確認

### **達成したこと（Day 11まで）**

```
✅ OpenAI Whisper API統合完全成功
✅ transcribeAudio Cloud Function実装
✅ speechService.js完全実装（expo-file-system最新API対応）
✅ VoiceRecorder.js Whisper統合完了
✅ Zod検証実装（WhisperResponseSchema）
✅ エラーハンドリング完全実装
✅ Android/iOS実機テスト成功
✅ AI機能（質問生成・フィードバック・文字起こし）完全動作
✅ Week 2 AI統合フェーズ完了（78.6%）
```

---

## 🚀 Day 12: Firestoreデータモデル実装へ！

**練習セッションの永続化を実現します！**

Firestoreにセッションデータを保存・取得・削除する機能を実装し、次のDay 13-14で履歴機能を完成させます。

**データ管理の基盤を構築しましょう！** 🎯

---

**最終更新**: Day 11完了 + Whisper API統合完了（2025年10月26日）
**次回作業**: Day 12 - Firestoreデータモデル実装
**Week 2目標**: AI機能の完全統合 ✅ → データ管理実装へ
