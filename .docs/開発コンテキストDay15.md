# 📄 開発コンテキスト - Business Communication Trainer (Day 15用)

**作成日**: 2025年10月27日
**バージョン**: v2.7（統計・分析機能実装版）
**現在のステータス**: Day 14完了 ✅ + Week 2完了 ✅ → Day 15準備完了

---

## 📊 プロジェクト基本情報

| 項目 | 内容 |
|------|------|
| **リポジトリ** | https://github.com/fanta1127/business-communication-trainer/ |
| **現在のブランチ** | `day10-development-build` |
| **進捗** | Day 14/21 完了 (66.7%) - Week 2完了！ |
| **次回** | Day 15 - 統計・分析機能実装 |
| **技術スタック** | React Native + Expo SDK 54 / Firebase / OpenAI API |

---

## 🎯 Day 15: 統計・分析機能実装

### **目標**
ユーザーの練習履歴から統計情報を抽出・可視化し、成長を実感できるダッシュボードを実装する。

### **実装内容**
1. **ProfileScreenの拡張**: 統計情報表示エリア追加
2. **統計データ取得**: Firestoreから集計データ取得
3. **グラフ表示**: 練習回数の推移グラフ
4. **場面別統計**: 各場面の練習回数と最終実施日
5. **練習習慣の可視化**: 週間・月間の練習パターン

---

## 🎉 Week 2進捗状況

```
Week 1: 基盤構築 (100%完了!) ✅
├─ Day 1-4: 環境/認証/画面 ✅
├─ Day 5: 場面データ/SessionContext ✅
├─ Day 6: 音声録音機能 ✅
├─ Day 7: 練習画面の完成 ✅
└─ Day 8: OpenAI API（質問生成）✅

Week 2: AI統合 + データ管理 (100%完了!) ✅
├─ Day 9: ゲストモード廃止 + フィードバックAPI ✅
├─ Day 10: Android Development Build ✅
├─ Day 10.5: iOS実機テスト環境構築 ✅
├─ Day 11: 音声文字起こし機能（Whisper API）✅
├─ Day 12: Firestoreデータモデル ✅
├─ Day 13: データ保存機能 ✅
└─ Day 14: 履歴機能 ✅

Week 3: 統計・分析 + 最終調整 (開始!)
└─ Day 15: 統計・分析機能 ⏳ ← 次回

全体進捗: 14/21日 (66.7%)
```

---

## 🎊 Day 14の主要成果（完了）

### ✅ 履歴機能実装完全成功

**達成内容**:
- ✅ HistoryScreen完全書き換え（Firestore統合、削除機能、エラーハンドリング）
- ✅ SessionDetailScreen完全書き換え（フィードバック詳細表示）
- ✅ Pull to Refresh機能
- ✅ 日時フォーマット（相対表示）
- ✅ 削除機能（確認ダイアログ付き）

**GitHubコミット**:
```
コミットID: 3856689
メッセージ: [feat] Day 14: 履歴機能実装
```

---

## 📂 現在のプロジェクト構造（Day 14完了時点）

```
BusinessTrainer/
├── src/
│   ├── screens/
│   │   ├── ProfileScreen.js ⏳ Day 15拡張予定 ← 次回
│   │   ├── HistoryScreen.js ✅ (セッション一覧表示)
│   │   └── SessionDetailScreen.js ✅ (セッション詳細表示)
│   ├── services/
│   │   ├── firestoreService.js ✅ (CRUD操作実装済み)
│   │   └── statisticsService.js ⏳ Day 15新規作成 ← 次回
│   └── components/
│       └── StatisticsCard.js ⏳ Day 15新規作成 ← 次回
```

---

## 📋 Day 15実装タスク

### **タスク1: statisticsService.js作成（1.5時間）**

#### **1-1. 統計データ取得関数の実装**

**ファイル**: `src/services/statisticsService.js`

**実装内容**:
```javascript
// src/services/statisticsService.js
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * ユーザーの統計データを取得
 * @param {string} userId - ユーザーID
 * @returns {Promise<object>} 統計データ
 */
export const getUserStatistics = async (userId) => {
  try {
    console.log('[Statistics] 統計データ取得開始:', userId);

    // 全セッション取得
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({
        sessionId: doc.id,
        ...doc.data(),
      });
    });

    console.log('[Statistics] セッション数:', sessions.length);

    // 統計データ計算
    const stats = calculateStatistics(sessions);

    return stats;
  } catch (error) {
    console.error('[Statistics] 統計データ取得エラー:', error);
    throw new Error('統計データの取得に失敗しました: ' + error.message);
  }
};

/**
 * 統計データを計算
 * @param {Array} sessions - セッションデータ配列
 * @returns {object} 統計データ
 */
const calculateStatistics = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
      sceneStats: [],
      recentActivity: [],
      weeklyStats: {
        thisWeek: 0,
        lastWeek: 0,
      },
    };
  }

  // 総セッション数
  const totalSessions = sessions.length;

  // 総所要時間（秒）
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  // 平均所要時間（秒）
  const averageDuration = Math.floor(totalDuration / totalSessions);

  // 場面別統計
  const sceneMap = {};
  sessions.forEach((session) => {
    const sceneId = session.sceneId;
    if (!sceneMap[sceneId]) {
      sceneMap[sceneId] = {
        sceneId: sceneId,
        sceneName: session.sceneName,
        count: 0,
        lastPracticed: null,
      };
    }
    sceneMap[sceneId].count += 1;

    // 最新の練習日時を記録
    const sessionDate = session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
    if (!sceneMap[sceneId].lastPracticed || sessionDate > sceneMap[sceneId].lastPracticed) {
      sceneMap[sceneId].lastPracticed = sessionDate;
    }
  });

  const sceneStats = Object.values(sceneMap).sort((a, b) => b.count - a.count);

  // 最近7日間のアクティビティ
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentActivity = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = `${date.getMonth() + 1}/${date.getDate()}`;

    const count = sessions.filter((session) => {
      const sessionDate = session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
      return (
        sessionDate.getFullYear() === date.getFullYear() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getDate() === date.getDate()
      );
    }).length;

    recentActivity.push({
      date: dateString,
      count: count,
    });
  }

  // 週間統計（今週と先週）
  const thisWeekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeekCount = sessions.filter((session) => {
    const sessionDate = session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
    return sessionDate >= thisWeekStart;
  }).length;

  const lastWeekCount = sessions.filter((session) => {
    const sessionDate = session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
    return sessionDate >= lastWeekStart && sessionDate < thisWeekStart;
  }).length;

  return {
    totalSessions,
    totalDuration,
    averageDuration,
    sceneStats,
    recentActivity,
    weeklyStats: {
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
    },
  };
};

/**
 * 時間フォーマット（秒 → 時:分:秒 or 分:秒）
 * @param {number} seconds - 秒数
 * @returns {string} フォーマットされた時間
 */
export const formatTotalDuration = (seconds) => {
  if (!seconds) return '0分';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}時間${mins}分`;
  } else if (mins > 0) {
    return `${mins}分${secs}秒`;
  } else {
    return `${secs}秒`;
  }
};
```

---

### **タスク2: StatisticsCard.jsコンポーネント作成（1時間）**

#### **2-1. 統計カードコンポーネント作成**

**ファイル**: `src/components/StatisticsCard.js`

**実装内容**:
```javascript
// src/components/StatisticsCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatisticsCard({ icon, iconColor, title, value, subtitle }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
```

---

### **タスク3: ProfileScreen.js拡張（2時間）**

#### **3-1. ProfileScreenに統計表示を追加**

**ファイル**: `src/screens/ProfileScreen.js`

**実装方針**:
- 既存のProfileScreen.jsに統計情報セクションを追加
- getUserStatistics()でデータ取得
- StatisticsCardコンポーネントで表示
- ローディング・エラーハンドリング

**主要機能**:
- 総練習回数
- 総練習時間
- 平均所要時間
- 今週の練習回数
- 最近7日間のアクティビティ（簡易グラフ）
- 場面別統計

**実装例**:
```javascript
// 統計データ取得
const [statistics, setStatistics] = useState(null);
const [statsLoading, setStatsLoading] = useState(true);

useEffect(() => {
  const fetchStatistics = async () => {
    try {
      const stats = await getUserStatistics(user.uid);
      setStatistics(stats);
    } catch (error) {
      console.error('統計取得エラー:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (user?.uid) {
    fetchStatistics();
  }
}, [user]);

// 統計カード表示
{statistics && (
  <>
    <StatisticsCard
      icon="trophy"
      iconColor="#FFB300"
      title="総練習回数"
      value={`${statistics.totalSessions}回`}
    />
    <StatisticsCard
      icon="time"
      iconColor="#2196F3"
      title="総練習時間"
      value={formatTotalDuration(statistics.totalDuration)}
    />
    {/* ... */}
  </>
)}
```

---

## 🧪 テスト項目

### **基本動作テスト**
- [ ] ProfileScreenで統計情報が表示される
- [ ] 総練習回数が正しい
- [ ] 総練習時間が正しい
- [ ] 平均所要時間が正しい
- [ ] 今週の練習回数が正しい

### **場面別統計テスト**
- [ ] 各場面の練習回数が正しい
- [ ] 最終実施日が正しい
- [ ] 場面別統計が練習回数順にソートされている

### **週間統計テスト**
- [ ] 今週の練習回数が正しい
- [ ] 先週の練習回数が正しい
- [ ] 増減が正しく表示される

### **エラーハンドリングテスト**
- [ ] データ取得エラー時に適切なエラーメッセージが表示される
- [ ] セッションが0件の場合、適切な空の状態が表示される

### **UI/UXテスト**
- [ ] ローディングインジケーターが表示される
- [ ] カードのデザインが見やすい
- [ ] アイコンが適切に表示される
- [ ] スクロールが正常に動作する

---

## ⏱️ 所要時間

| タスク | 時間 |
|--------|------|
| **statisticsService.js実装** | 1.5時間 |
| **StatisticsCard.js実装** | 1時間 |
| **ProfileScreen.js拡張** | 2時間 |
| **テスト（統計表示）** | 1時間 |
| **デバッグ** | 0.5時間 |
| **合計** | 約6時間 |

---

## 🔧 Day 15完了基準

### ✅ 実装チェックリスト

#### **statisticsService.js実装**
- [ ] getUserStatistics関数作成
- [ ] calculateStatistics関数作成
- [ ] formatTotalDuration関数作成
- [ ] エラーハンドリング実装

#### **StatisticsCard.js実装**
- [ ] StatisticsCardコンポーネント作成
- [ ] アイコン表示機能
- [ ] スタイリング実装

#### **ProfileScreen.js拡張**
- [ ] 統計データ取得実装
- [ ] StatisticsCard統合
- [ ] ローディング表示実装
- [ ] エラーハンドリング実装
- [ ] 空の状態表示実装

#### **テスト**
- [ ] 統計情報表示テスト成功
- [ ] 場面別統計テスト成功
- [ ] 週間統計テスト成功

---

## 📝 重要な技術パターン

### **Firestoreからの統計データ取得**

```javascript
// 全セッション取得
const q = query(
  collection(db, 'sessions'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc')
);

const querySnapshot = await getDocs(q);
const sessions = [];
querySnapshot.forEach((doc) => {
  sessions.push({
    sessionId: doc.id,
    ...doc.data(),
  });
});
```

### **統計データ計算**

```javascript
// 総セッション数
const totalSessions = sessions.length;

// 総所要時間
const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

// 平均所要時間
const averageDuration = Math.floor(totalDuration / totalSessions);

// 場面別統計
const sceneMap = {};
sessions.forEach((session) => {
  const sceneId = session.sceneId;
  if (!sceneMap[sceneId]) {
    sceneMap[sceneId] = {
      sceneId: sceneId,
      sceneName: session.sceneName,
      count: 0,
    };
  }
  sceneMap[sceneId].count += 1;
});
```

### **日付フィルタリング**

```javascript
// 今週のセッション数
const thisWeekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
thisWeekStart.setHours(0, 0, 0, 0);

const thisWeekCount = sessions.filter((session) => {
  const sessionDate = session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
  return sessionDate >= thisWeekStart;
}).length;
```

---

## 🚀 次回（Day 16）予定

### **Day 16: グラフ表示機能**
- react-native-chartライブラリ導入
- 練習回数推移グラフ
- 場面別円グラフ
- 週間アクティビティグラフ
- インタラクティブなグラフ機能

---

## 🎓 これまでの学習成果

### **Week 1-2で習得した技術**

1. **React Native + Expo開発**
   - コンポーネント設計 ✅
   - Navigation（Stack, Tab） ✅
   - Context API ✅
   - Hooks（useState, useEffect, useRef, useCallback）✅
   - FlatList + RefreshControl ✅

2. **Firebase統合**
   - Authentication ✅
   - Cloud Functions ✅
   - Firestore CRUD操作 ✅
   - セキュリティルール ✅

3. **OpenAI API活用**
   - gpt-4o-mini（質問生成・フィードバック生成）✅
   - Whisper API（音声文字起こし）✅

4. **ネイティブ機能**
   - 音声録音（expo-av）✅
   - ファイルシステム（expo-file-system）✅
   - 権限管理 ✅

5. **データ管理**
   - Firestore CRUD操作 ✅
   - データバリデーション ✅
   - エラーハンドリング ✅
   - Pull to Refresh ✅
   - 履歴管理 ✅

---

## 📞 開発サポート情報

### **リポジトリ**
- GitHub: https://github.com/fanta1127/business-communication-trainer/
- ブランチ: `day10-development-build`
- 最新コミット: `3856689`

### **ドキュメント**
- Expo: https://docs.expo.dev/
- Firebase: https://firebase.google.com/docs
- Firestore: https://firebase.google.com/docs/firestore
- React Native: https://reactnative.dev/docs/getting-started

### **ビルド情報**
- EAS Project ID: `d8957a17-7f57-454d-b344-0c7202fd1168`
- Android Build ID: `c9c92a50-6a10-4ef9-8c27-21b37614c7d2`
- iOS: Xcode Local Build（無料Personal Team）

### **デバイス情報**
- Android: 実機テスト成功 ✅
- iOS: 実機テスト成功 ✅
- Bundle ID: `com.fanta1127.businesstrainer`

---

## 🎯 Day 15開始準備チェックリスト

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

Day 15を開始する前に、以下が完了していることを確認:
- ✅ Day 14完了（履歴機能実装済み）
- ✅ HistoryScreen実装済み
- ✅ SessionDetailScreen実装済み
- ✅ firestoreService.js実装済み（getUserSessions関数）
- ✅ Firebase Console でセッションデータ確認済み

---

## ✨ Week 3の目標（Day 15実施時点）

### **Week 2完了項目** ✅
- [x] Day 9: ゲストモード廃止 + フィードバックAPI
- [x] Day 10: Android Development Build
- [x] Day 10.5: iOS実機テスト環境構築
- [x] Day 11: 音声文字起こし機能（Whisper API）
- [x] Day 12: Firestoreデータモデル
- [x] Day 13: データ保存機能
- [x] Day 14: 履歴機能

### **Week 3タスク** ⏳
- [ ] Day 15: 統計・分析機能 ← 次回
- [ ] Day 16: グラフ表示機能
- [ ] Day 17-18: UI/UX改善
- [ ] Day 19-20: 最終調整
- [ ] Day 21: 総仕上げ

### **Week 3終了時の目標**
```
✅ 統計・分析機能完全実装
✅ グラフ表示機能
✅ UI/UX改善
✅ パフォーマンス最適化
✅ 最終テスト完了
✅ リリース準備完了
```

---

## 🚀 Day 15: 統計・分析機能実装へ！

**ユーザーの成長を可視化し、練習のモチベーションを高める統計機能を実装します！**

練習履歴から有意義な統計情報を抽出し、ユーザーが自分の成長を実感できるようにします。

**統計・分析機能を実現しましょう！** 📊

---

**最終更新**: Day 14完了（2025年10月27日）- Week 2完了！
**次回作業**: Day 15 - 統計・分析機能実装
**Week 3目標**: アプリ完成へ向けた最終調整
