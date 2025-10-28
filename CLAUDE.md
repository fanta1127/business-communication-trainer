# Business Communication Trainer - 開発ガイド (CLAUDE.md)

**最終更新**: 2025年10月28日 (Day 15完了 / Day 16スキップ決定)
**プロジェクト名**: Business Communication Trainer
**リポジトリ**: https://github.com/fanta1127/business-communication-trainer/
**ブランチ**: `week3-development`

---

## ⚠️ AI開発ルール（重要）

### **絶対遵守事項**

1. **コード変更前の許可取得（最重要）**
   - ❌ **勝手にコードを実装・変更してはいけない**
   - ✅ **必ずユーザーに実装内容を提示し、許可を得てから実装する**

2. **実装前の確認プロセス**
   ```
   1. 実装内容の提案（何を実装するか）
   2. ユーザーの許可待ち
   3. 許可取得後に実装開始
   4. 実装完了報告
   ```

3. **許可が必要な操作**
   - ファイルの新規作成
   - 既存ファイルの編集
   - パッケージのインストール
   - Git操作（commit, push）
   - 設定ファイルの変更

4. **許可不要な操作**
   - ファイルの読み取り
   - コードの分析・確認
   - 実装方針の提案
   - ドキュメントの確認

### **正しい開発フロー**

```
ユーザー: 「Day 15に進みます」
      ↓
AI: 「Day 15の実装内容を確認しました。以下を実装します:
     1. statisticsService.js作成
     2. StatisticsCard.js作成
     3. ProfileScreen.js拡張

     実装してよろしいですか？」
      ↓
ユーザー: 「OK」または実装指示
      ↓
AI: 実装開始
```

### **違反例（絶対NG）**

```
❌ ユーザー: 「Day 15に進みます」
   AI: 即座に実装開始 → NG！

✅ ユーザー: 「Day 15に進みます」
   AI: 実装内容を提示し、許可を待つ → OK！
```

---

## 📍 現在の状況

### **進捗状況**
- ✅ **Day 1-8**: Week 1完了（基盤構築）
- ✅ **Day 9**: ゲストモード廃止 + フィードバックAPI統合
- ✅ **Day 10**: Android Development Build
- ✅ **Day 10.5**: iOS実機テスト環境構築
- ✅ **Day 11**: 音声文字起こし機能（Whisper API）
- ✅ **Day 12**: Firestoreデータモデル実装
- ✅ **Day 13**: データ保存機能実装
- ✅ **Day 14**: 履歴機能実装（Week 2完了！）
- ✅ **Day 15**: 統計・分析機能実装（Week 3開始！）
- ⏭️ **Day 16**: グラフ表示機能（**スキップ** - 冗長なため）
- ⏳ **Day 17**: UI/UX改善（次回予定）

### **最新コミット**
```bash
864f50f - [docs] 要件定義書更新 v5.0 - Day 15完了版
45fe893 - [fix] Day 15: バグ修正と機能改善
9ea5670 - [feat] Day 15: 統計・分析機能実装
```

### **全体進捗**: 15/20日 (75.0%) - Week 3開始！
**注**: Day 16（グラフ表示機能）はDay 15で既に簡易グラフ実装済みのため、冗長と判断しスキップ

---

## 🏗️ プロジェクト構造

```
BusinessTrainer/
├── src/
│   ├── contexts/          # Context API（グローバル状態管理）
│   │   ├── AuthContext.js        # 認証状態管理
│   │   └── SessionContext.js     # セッション管理 + Firestore保存
│   │
│   ├── screens/           # 画面コンポーネント
│   │   ├── LoginScreen.js        # ログイン画面
│   │   ├── SignupScreen.js       # 新規登録画面
│   │   ├── HomeScreen.js         # ホーム画面
│   │   ├── SceneSelectionScreen.js  # 場面選択画面
│   │   ├── PracticeScreen.js     # 練習画面（質問・回答）
│   │   ├── FeedbackScreen.js     # フィードバック表示 + 保存
│   │   ├── HistoryScreen.js      # 履歴一覧（Firestore統合、削除機能）
│   │   ├── SessionDetailScreen.js # セッション詳細（フィードバック詳細表示）
│   │   └── ProfileScreen.js      # プロフィール + 統計表示 ✅ Day 15拡張
│   │
│   ├── components/        # 再利用可能コンポーネント
│   │   ├── VoiceRecorder.js      # 音声録音 + 文字起こし
│   │   └── StatisticsCard.js     # 統計情報表示カード ✅ Day 15
│   │
│   ├── services/          # 外部サービス連携
│   │   ├── openaiService.js      # OpenAI API（質問生成・フィードバック）
│   │   ├── speechService.js      # Whisper API（音声文字起こし）
│   │   ├── firestoreService.js   # Firestore CRUD操作
│   │   └── statisticsService.js  # 統計データ取得・計算 ✅ Day 15
│   │
│   ├── constants/         # 定数
│   │   ├── appConfig.js          # アプリ設定（質問数、文字数制限）
│   │   └── scenes.js             # 練習場面データ
│   │
│   ├── navigation/        # ナビゲーション
│   │   └── AppNavigator.js       # メインナビゲーター
│   │
│   └── config/            # 設定ファイル
│       └── firebase.js           # Firebase設定
│
├── functions/             # Firebase Cloud Functions
│   ├── index.js                  # メイン関数
│   └── package.json
│
├── .docs/                 # ドキュメント
│   ├── 要件定義書.md
│   ├── 開発コンテキストDay11.md
│   ├── 開発コンテキストDay12.md
│   ├── 開発コンテキストDay13.md
│   ├── 開発コンテキストDay14.md
│   ├── 開発コンテキストDay15.md
│   └── 開発コンテキストDay16.md
│
├── .serena/               # Serena MCP設定
│   ├── project.yml               # プロジェクト設定
│   ├── cache/                    # 言語サーバーキャッシュ
│   └── memories/                 # プロジェクトメモリー
│
├── App.js                 # エントリーポイント
├── app.json               # Expo設定
├── package.json
├── firebase.json          # Firebase設定
├── firestore.rules        # Firestoreセキュリティルール
└── firestore.indexes.json # Firestoreインデックス
```

---

## ✅ 実装済み機能

### **1. 認証機能 (AuthContext.js)**

**ファイル**: `src/contexts/AuthContext.js`

**提供する値**:
```javascript
const {
  user,              // 現在のユーザー (Firebase User | null)
  loading,           // 認証状態チェック中フラグ
  login,             // ログイン関数
  signup,            // 新規登録関数
  logout             // ログアウト関数
} = useAuth();
```

**使用例**:
```javascript
// ログイン
await login('email@example.com', 'password');

// ユーザー情報取得
if (user) {
  console.log('UID:', user.uid);
  console.log('Email:', user.email);
}

// ログアウト
await logout();
```

**注意点**:
- ゲストモードは完全廃止（Day 9）
- 全機能がログイン必須

---

### **2. セッション管理 (SessionContext.js)**

**ファイル**: `src/contexts/SessionContext.js`

**提供する値**:
```javascript
const {
  currentSession,           // 現在のセッションデータ
  currentQuestionIndex,     // 現在の質問インデックス
  isSessionActive,          // セッション進行中フラグ
  startSession,             // セッション開始
  saveAnswer,               // 回答保存
  addAiQuestions,           // AI質問追加
  moveToNextQuestion,       // 次の質問へ移動
  saveFeedback,             // フィードバック保存
  saveSessionToFirestore,   // Firestore保存（Day 13追加）
  saving,                   // 保存中フラグ（Day 13追加）
  saveError,                // 保存エラー（Day 13追加）
  resetSession,             // セッションリセット
  getCurrentQuestion,       // 現在の質問取得
  isSessionComplete,        // セッション完了判定
  getProgress               // 進捗率取得
} = useSession();
```

**セッションデータ構造**:
```javascript
{
  sessionId: "session_1234567890_abc123",
  sceneId: "weekly-report",
  sceneName: "週次報告会議",
  timestamp: "2025-10-27T12:00:00.000Z",
  qaList: [
    {
      questionId: "q0",
      questionText: "今週の進捗を教えてください",
      answerText: "ECサイトの決済機能を実装中です...",
      answerDuration: 45,
      isFixedQuestion: true
    },
    // ... AI生成質問3問
  ],
  totalQuestions: 4,
  feedback: {
    summary: "全体的に...",
    goodPoints: [...],
    improvementPoints: [...],
    encouragement: "..."
  },
  duration: 180,        // 秒
  startTime: 1234567890 // Date.now()
}
```

**重要な実装パターン**:
```javascript
// ❌ 誤り: React Stateの非同期更新問題
saveAnswer(answer);
const hasNext = moveToNextQuestion();
if (!hasNext) {
  generateFeedback(currentSession.qaList); // まだ更新されていない可能性
}

// ✅ 正しい: 更新されたqaListを明示的に作成
const updatedQaList = [...currentSession.qaList];
updatedQaList[currentQuestionIndex] = {
  ...updatedQaList[currentQuestionIndex],
  answerText: answer,
  answerDuration: duration,
};
saveAnswer(answer, duration);
const hasNext = moveToNextQuestion();
if (!hasNext) {
  generateFeedback(updatedQaList); // 確実に更新されたデータ
}
```

**Firestore保存**:
```javascript
try {
  const sessionId = await saveSessionToFirestore();
  console.log('保存成功:', sessionId);
} catch (error) {
  console.error('保存失敗:', error.message);
  // リトライ処理
}
```

---

### **3. 音声録音・文字起こし (VoiceRecorder.js)**

**ファイル**: `src/components/VoiceRecorder.js`

**使用例**:
```javascript
<VoiceRecorder
  onRecordingComplete={(transcribedText, duration) => {
    console.log('文字起こし結果:', transcribedText);
    console.log('録音時間:', duration, '秒');
    setAnswer(transcribedText);
  }}
  disabled={isProcessing}
/>
```

**処理フロー**:
1. 録音開始 → expo-av で音声録音
2. 録音停止 → m4aファイル保存
3. Base64エンコード → Cloud Functions経由でWhisper API呼び出し
4. 文字起こし結果取得 → コールバック実行

**注意点**:
- `expo-av` は SDK 54で非推奨（将来 `expo-audio` に移行予定）
- Base64サイズ制限: 約500KB（約30秒の録音）
- タイムアウト: 30秒

---

### **4. AI質問生成 (openaiService.js)**

**ファイル**: `src/services/openaiService.js`

**関数**: `generateQuestions(sceneId, userAnswer)`

**使用例**:
```javascript
import { generateQuestions } from '../services/openaiService';

const result = await generateQuestions('weekly-report', '進捗報告の回答テキスト');

console.log(result.questions);
// ['追加質問1', '追加質問2', '追加質問3']

console.log(result.source);
// 'AI' または 'DEFAULT'（フォールバック）
```

**処理フロー**:
1. Cloud Functions呼び出し (`generateQuestions`)
2. gpt-4o-mini モデルで3問生成
3. タイムアウト時はデフォルト質問を返す

**重要**: 引数が1つ（`sceneId`のみ）ではなく、2つ（`sceneId`, `userAnswer`）必要

---

### **5. フィードバック生成 (openaiService.js)**

**ファイル**: `src/services/openaiService.js`

**関数**: `generateFeedback(sceneId, sceneName, qaList)`

**使用例**:
```javascript
import { generateFeedback } from '../services/openaiService';

const feedbackResult = await generateFeedback(
  'weekly-report',
  '週次報告会議',
  [
    { questionText: '質問1', answerText: '回答1' },
    { questionText: '質問2', answerText: '回答2' },
    // ...
  ]
);

console.log(feedbackResult.summary);
console.log(feedbackResult.goodPoints);
console.log(feedbackResult.improvementPoints);
console.log(feedbackResult.encouragement);
```

**重要**: 引数が3つ（`sceneId`, `sceneName`, `qaList`）必要
- Day 13でバグ修正: `sceneName`が抜けていた

**フィードバック構造**:
```javascript
{
  summary: "全体的に具体的な説明ができています...",
  goodPoints: [
    {
      aspect: "具体性",
      quote: "ECサイトの決済機能を実装中",
      comment: "プロジェクト名を明確に示していて良い"
    }
  ],
  improvementPoints: [
    {
      aspect: "論理構造",
      original: "遅延しています",
      improved: "予定より3日遅延していますが...",
      reason: "影響範囲まで伝えると安心感を与えられます"
    }
  ],
  encouragement: "素晴らしいスタートです！"
}
```

---

### **6. Firestore操作 (firestoreService.js)**

**ファイル**: `src/services/firestoreService.js`

**利用可能な関数**:
```javascript
import {
  saveSession,              // セッション保存
  getUserSessions,          // セッション一覧取得
  getSession,               // 特定セッション取得
  deleteSession,            // セッション削除
  getSessionCount,          // セッション数取得
  createUserProfile,        // ユーザープロファイル作成
  getFirestoreErrorMessage  // エラーメッセージ変換
} from '../services/firestoreService';
```

**使用例**:
```javascript
// セッション保存
const sessionId = await saveSession(userId, sessionData);

// セッション一覧取得（最新10件、createdAt降順）
const sessions = await getUserSessions(userId, 10);

// セッション削除
await deleteSession(userId, sessionId);
```

**Firestoreパス**:
```
/users/{userId}/sessions/{sessionId}
```

**セキュリティルール**:
- 自分のデータのみ読み書き可能
- 認証必須

---

### **7. 履歴機能 (HistoryScreen.js, SessionDetailScreen.js)**

**実装状況**: ✅ Day 14完了

#### **7.1 HistoryScreen - セッション一覧表示**

**ファイル**: `src/screens/HistoryScreen.js`

**主要機能**:
- ✅ Firestore統合（getUserSessions）
- ✅ Pull to Refresh（下にスワイプで更新）
- ✅ 日時フォーマット（相対表示: 今日、昨日、○日前、月/日）
- ✅ 削除機能（確認ダイアログ付き）
- ✅ エラーハンドリング（loading, error, retry）
- ✅ 空の状態表示

**使用例**:
```javascript
// セッション一覧取得
const fetchSessions = async () => {
  const fetchedSessions = await getUserSessions(user.uid);
  setSessions(fetchedSessions);
};

// Pull to Refresh
const onRefresh = useCallback(() => {
  setRefreshing(true);
  fetchSessions();
}, []);

// 削除
const handleDelete = async (sessionId) => {
  await deleteSession(sessionId, user.uid);
  setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
};
```

**日時フォーマット**:
- 今日: `今日 15:30`
- 昨日: `昨日 10:45`
- 一週間以内: `3日前`
- それ以前: `10/25`

#### **7.2 SessionDetailScreen - セッション詳細表示**

**ファイル**: `src/screens/SessionDetailScreen.js`

**主要機能**:
- ✅ 質問と回答の詳細表示（固定質問/AI質問区別）
- ✅ フィードバック詳細表示:
  - 総評
  - ✅ 良かった点（aspect, quote, comment）
  - 💡 改善のヒント（aspect, Before/After, reason）
  - 🌟 励ましメッセージ
- ✅ 削除機能（deleteSession呼び出し）
- ✅ エラーハンドリング

**データ構造対応**:
```javascript
// qaList
{
  questionText: "質問内容",
  answerText: "回答内容",
  isFixedQuestion: true,  // 固定質問の場合
  answerDuration: 45
}

// feedback.goodPoints
{
  aspect: "具体性",
  quote: "引用テキスト",
  comment: "コメント"
}

// feedback.improvementPoints
{
  aspect: "論理構造",
  original: "改善前",
  improved: "改善後",
  reason: "理由"
}
```

---

## 🎨 コーディングパターン

### **1. Context API使用パターン**

```javascript
// ❌ 誤り
import { SessionContext } from '../contexts/SessionContext';
const session = useContext(SessionContext);

// ✅ 正しい: カスタムフック使用
import { useSession } from '../contexts/SessionContext';
const { currentSession, saveAnswer } = useSession();
```

---

### **2. 非同期処理パターン**

```javascript
// ✅ 正しい: try-catch + ローディング状態管理
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);

    await someAsyncFunction();

    Alert.alert('成功', '処理が完了しました');
  } catch (error) {
    console.error('エラー:', error);
    setError(error.message);
    Alert.alert('エラー', error.message);
  } finally {
    setLoading(false);
  }
};
```

---

### **3. ナビゲーションパターン**

```javascript
// 画面遷移
navigation.navigate('ScreenName', { param: value });

// 戻るボタンを非表示
<Stack.Screen
  name="Feedback"
  component={FeedbackScreen}
  options={{ headerLeft: null }}
/>

// セッションリセット後にホームへ
resetSession();
navigation.navigate('Home');
```

---

### **4. エラーハンドリングパターン**

```javascript
// リトライ機能付きエラーハンドリング
const handleSave = async (retryCount = 0) => {
  const MAX_RETRIES = 2;

  try {
    await saveSessionToFirestore();
    Alert.alert('保存完了', 'セッションを保存しました');
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      Alert.alert(
        '保存エラー',
        `もう一度試しますか？`,
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'リトライ', onPress: () => handleSave(retryCount + 1) }
        ]
      );
    } else {
      Alert.alert('保存エラー', '保存に失敗しました');
    }
  }
};
```

---

## 🐛 トラブルシューティング

### **問題1: フィードバック生成エラー**

**症状**:
```
ERROR [OpenAI] qaListの形式が正しくありません
```

**原因**:
- `generateFeedback`の引数不足（`sceneName`が抜けている）
- React Stateの非同期更新により、`currentSession.qaList`がまだ更新されていない

**解決策**:
```javascript
// ✅ 修正後
const updatedQaList = [...currentSession.qaList];
updatedQaList[currentQuestionIndex] = {
  ...updatedQaList[currentQuestionIndex],
  answerText: answer.trim(),
  answerDuration: duration,
};

const feedbackResult = await generateFeedback(
  currentSession.sceneId,
  currentSession.sceneName,  // ✅ 追加
  updatedQaList              // ✅ 更新されたデータ使用
);
```

**修正コミット**: `c12c1c2` (Day 13)

---

### **問題2: Expo AV非推奨警告**

**症状**:
```
WARN [expo-av]: Expo AV has been deprecated and will be removed in SDK 54.
```

**原因**: `expo-av` が SDK 54で非推奨

**対応**:
- 現在は影響なし（SDK 51使用中）
- 将来的に `expo-audio` へ移行予定

---

### **問題3: Firebase Functions タイムアウト**

**症状**:
- AI質問生成が30秒でタイムアウト
- フィードバック生成が45秒でタイムアウト

**対応**:
- フォールバック機能実装済み
- デフォルト質問/フィードバックを返す
- ユーザーには「デフォルト使用」を通知

**設定ファイル**: `src/services/openaiService.js`
```javascript
const TIMEOUT_CONFIG = {
  QUESTION_MS: 30000,   // 30秒
  FEEDBACK_MS: 45000,   // 45秒
};
```

---

### **問題4: Android実機でのビルドエラー**

**症状**: Development Buildが失敗

**解決策**:
- `eas.json`で正しいビルド設定
- `google-services.json`を配置
- Gradleキャッシュクリア

**参考**: Day 10の開発コンテキスト

---

## 🔧 開発環境

### **必要なツール**
```bash
Node.js: v18以上
npm: v9以上
Expo CLI: 最新版
EAS CLI: 最新版（ビルド用）
Android Studio: Android開発用
Xcode: iOS開発用（Mac only）
```

### **環境構築手順**

```bash
# 1. リポジトリクローン
git clone https://github.com/fanta1127/business-communication-trainer.git
cd business-communication-trainer

# 2. 依存関係インストール
npm install

# 3. Firebase設定
# - src/config/firebase.js に設定追加
# - google-services.json を配置（Android）
# - GoogleService-Info.plist を配置（iOS）

# 4. Cloud Functions依存関係インストール
cd functions
npm install
cd ..

# 5. 開発サーバー起動
npx expo start

# 6. デバイスでテスト
# - Android: "a" キー押下
# - iOS: "i" キー押下
# - 実機: Expo Goアプリでスキャン
```

---

### **ブランチ戦略**

```
main (本番) ← Week 2完了状態
  └── week3-development (開発中) ← 現在ここ
```

**ブランチ命名規則**:
- `main`: 本番ブランチ（リリース可能な状態）
- `week<N>-development`: Week単位の開発ブランチ
- `feature/<feature-name>`: 機能別ブランチ（必要に応じて）

**コミットメッセージ規約**:
```
[feat] 新機能追加
[fix] バグ修正
[refactor] リファクタリング
[docs] ドキュメント更新
[setup] 環境構築
[test] テスト追加
```

---

### **Gitワークフロー（プルリクエスト & マージ）**

Week単位で開発を完了したら、mainブランチに統合します。

#### **手順1: 現在の状態確認**

```bash
# 作業ディレクトリがクリーンか確認
git status

# すべての変更がコミット・プッシュ済みか確認
git log origin/<branch-name>..HEAD --oneline
```

---

#### **手順2: GitHubでプルリクエスト作成**

1. **GitHubリポジトリを開く**
   ```
   https://github.com/fanta1127/business-communication-trainer
   ```

2. **プルリクエスト作成**
   - 黄色いバナーの **[Compare & pull request]** をクリック
   - または **Pull requests** タブ → **[New pull request]**

3. **プルリクエスト内容を記入**
   - **Title**: `[Week N完了] 機能概要 (Day X-Y)`
   - **Description**:
     - 実装完了機能のリスト
     - 主要な技術実装
     - テスト状況
     - 次のステップ

4. **[Create pull request]** をクリック

---

#### **手順3: マージの実行**

1. **変更内容の確認（オプション）**
   - **Files changed** タブで差分を確認

2. **マージ方法の選択**
   - **Create a merge commit** ← 推奨（履歴を保持）
   - Squash and merge（コミットを1つにまとめる）
   - Rebase and merge（履歴を一直線にする）

3. **マージの実行**
   - **[Merge pull request]** をクリック
   - **[Confirm merge]** をクリック

---

#### **手順4: ローカルのmainブランチを更新**

```bash
# mainブランチに切り替え
git checkout main

# リモートから最新状態を取得
git pull origin main

# マージ結果の確認
git log --oneline -5
```

---

#### **手順5: 新しい開発ブランチの作成**

```bash
# mainから新しいブランチを作成
git checkout -b week<N>-development

# リモートにプッシュ
git push -u origin week<N>-development

# ブランチ状態の確認
git branch -a
```

---

#### **手順6: 古いブランチの削除（オプション）**

```bash
# ローカルブランチを削除
git branch -d <old-branch-name>

# リモートブランチを削除
git push origin --delete <old-branch-name>

# 削除確認
git branch -a
```

---

#### **実施例: Week 2完了時（Day 14完了）**

```bash
# 1. プルリクエスト作成（GitHub上で実施）
# - Title: [Week 2完了] AI統合 + データ管理機能実装 (Day 9-14)
# - 13個のコミットを含む

# 2. マージ実行（GitHub上で実施）
# - Create a merge commit を選択
# - マージコミット: 41f1e13

# 3. ローカル更新
git checkout main
git pull origin main
# → 32ファイル変更、8,505行追加、3,641行削除

# 4. Week 3用ブランチ作成
git checkout -b week3-development
git push -u origin week3-development

# 5. 古いブランチ削除
git branch -d day10-development-build
git push origin --delete day10-development-build
```

**結果**:
- ✅ Week 2の成果がmainブランチに統合
- ✅ week3-developmentブランチで新しい開発を開始
- ✅ リポジトリがクリーンな状態に

---

## 🧪 テスト方法

### **手動テスト手順**

#### **1. 認証テスト**
```bash
1. アプリ起動
2. 新規登録 → メール認証
3. ログアウト
4. ログイン → 成功確認
```

#### **2. 練習セッションテスト**
```bash
1. ホーム画面 → 「練習を始める」
2. 場面選択（例: 週次報告会議）
3. 固定質問に音声で回答（または文字入力）
4. AI質問3問に回答
5. フィードバック画面表示確認
```

#### **3. データ保存テスト**
```bash
1. フィードバック画面で「履歴に保存」
2. 保存完了アラート確認
3. Firebase Console確認:
   - Firestore → users/{userId}/sessions
   - データ構造確認（qaList, feedback, duration）
```

---

### **Firebase Console確認**

1. **Firestore Database**:
   ```
   https://console.firebase.google.com/
   → プロジェクト選択
   → Firestore Database
   → users/{userId}/sessions
   ```

2. **Cloud Functions ログ**:
   ```
   → Functions
   → ログ確認
   → エラーチェック
   ```

3. **Authentication**:
   ```
   → Authentication
   → Users
   → 登録ユーザー確認
   ```

---

## 📊 重要な設計決定

### **1. ゲストモード廃止（Day 9）**

**理由**:
- データ整合性向上
- 実装簡素化
- セキュリティ向上

**影響**:
- 全機能がログイン必須
- SessionContextからゲスト関連コード削除
- AppNavigatorの条件分岐簡素化

---

### **2. AI質問数を3問固定（v4.0）**

**理由**:
- UX予測性向上
- プログレスバー正確化
- 実装簡素化

**設定**: `src/constants/appConfig.js`
```javascript
export const QUESTION_CONFIG = {
  TOTAL_COUNT: 4,  // 固定質問1 + AI質問3
  AI_COUNT: 3,
};
```

---

### **3. gpt-4o-mini採用**

**理由**:
- コスト最適化（gpt-4の約1/10）
- 速度向上
- 十分な品質

**モデル**: `gpt-4o-mini`
- 質問生成: 約3秒
- フィードバック生成: 約5-10秒

---

### **4. Cloud Functions経由でAPI呼び出し**

**理由**:
- APIキーの秘匿化
- セキュリティ強化
- レート制限管理

**実装**:
```javascript
// ❌ クライアント直接呼び出し（非推奨）
const response = await openai.chat.completions.create({...});

// ✅ Cloud Functions経由
const generateQuestionsFunc = httpsCallable(functions, 'generateQuestions');
const result = await generateQuestionsFunc({ sceneId, answer });
```

---

## 📚 参考ドキュメント

### **プロジェクト内ドキュメント**
- `.docs/要件定義書.md` - プロジェクト仕様
- `.docs/開発コンテキストDay11.md` - 音声文字起こし実装
- `.docs/開発コンテキストDay12.md` - Firestoreデータモデル
- `.docs/開発コンテキストDay13.md` - データ保存機能実装
- `.docs/開発コンテキストDay14.md` - 履歴機能実装（次回予定）

### **外部ドキュメント**
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

## 🚀 次のステップ（Day 17）

### **実装予定**
1. **アニメーション追加**
   - 画面遷移アニメーション
   - ボタンタップフィードバック
   - ローディングアニメーション

2. **ローディング・エラー表示改善**
   - スケルトンローディング
   - よりわかりやすいエラーメッセージ
   - リトライ機能の強化

3. **レスポンシブデザイン調整**
   - タブレット対応
   - 画面サイズに応じたレイアウト調整
   - フォントサイズの最適化

4. **アクセシビリティ向上**
   - スクリーンリーダー対応
   - コントラスト比の改善
   - タッチターゲットサイズの最適化

### **詳細**
→ `.docs/開発コンテキストDay17.md` 参照（次回作成予定）

---

## 💡 開発のコツ

### **1. デバッグ時のログ活用**
```javascript
console.log('[ComponentName] 説明:', data);
console.error('[ComponentName] エラー:', error);
console.warn('[ComponentName] 警告:', warning);
```

**例**: `[SessionContext] Session saved: abc123`

---

### **2. React DevToolsの活用**
- Context値の確認
- State変更の追跡
- パフォーマンス分析

---

### **3. Firebase Consoleの活用**
- Firestoreデータの確認
- Cloud Functionsログの確認
- Authenticationユーザーの確認

---

### **4. Gitコミットの粒度**
- 1機能1コミット
- 意味のある単位でコミット
- コミットメッセージは明確に

---

## 🔐 セキュリティ

### **APIキー管理**
- ✅ OpenAI API Key → Cloud Functions環境変数
- ✅ Firebase API Key → `src/config/firebase.js`（公開OK）
- ❌ `.env`ファイルは使用しない（Expoの制約）

### **Firestoreセキュリティルール**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId}/sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📞 サポート情報

### **開発者情報**
- GitHub: https://github.com/fanta1127
- リポジトリ: https://github.com/fanta1127/business-communication-trainer/

### **Firebase プロジェクト**
- Project ID: `business-communication-trainer`
- Region: `asia-northeast1`

### **EAS ビルド情報**
- Project ID: `d8957a17-7f57-454d-b344-0c7202fd1168`
- Bundle ID: `com.fanta1127.businesstrainer`

---

## 📝 メモ・TODO

### **既知の問題**
- [ ] `expo-av` 非推奨（SDK 54で削除予定）
- [ ] iOS Simulatorで音声録音不可（実機のみ）

### **Week 3予定**
- [x] 統計・分析機能（Day 15）✅
- [x] グラフ表示機能（Day 16）⏭️ スキップ
- [ ] UI/UX改善（Day 17-18）
- [ ] 最終調整・テスト（Day 19）
- [ ] 総仕上げ（Day 20）

### **将来の改善**
- [ ] `expo-av` → `expo-audio` 移行
- [ ] オフライン対応
- [ ] プッシュ通知

### **パフォーマンス最適化**
- [ ] 画像の最適化
- [ ] コンポーネントのメモ化（React.memo）
- [ ] 不要な再レンダリング削減

---

**このファイルについて**:
- このファイルはAI（Claude）と開発者の両方が参照するプロジェクトガイドです
- 実装状況に応じて随時更新してください
- 新しい学びやトラブルシューティングを追記してください

**最終更新**: 2025年10月28日 (Day 15完了 / Day 16スキップ決定 - Week 3進行中)
