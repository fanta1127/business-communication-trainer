# 📄 開発コンテキスト - Business Communication Trainer (Day 16用)

**作成日**: 2025年10月28日
**バージョン**: v2.8（グラフ表示機能実装版）
**現在のステータス**: Day 15完了 ✅ → Day 16準備完了

---

## 📊 プロジェクト基本情報

| 項目 | 内容 |
|------|------|
| **リポジトリ** | https://github.com/fanta1127/business-communication-trainer/ |
| **現在のブランチ** | `week3-development` |
| **進捗** | Day 15/21 完了 (71.4%) |
| **次回** | Day 16 - グラフ表示機能実装 |
| **技術スタック** | React Native + Expo SDK 54 / Firebase / OpenAI API |

---

## 🎯 Day 16: グラフ表示機能実装

### **目標**
統計データをより視覚的に理解しやすくするため、インタラクティブなグラフ機能を実装する。

### **実装内容**
1. **グラフライブラリの選定と導入**
2. **練習回数推移グラフ**: 過去30日間の練習回数を折れ線グラフで表示
3. **場面別円グラフ**: 各場面の練習回数割合を円グラフで表示
4. **週間比較棒グラフ**: 先週と今週の練習回数を比較
5. **グラフのインタラクション**: タップで詳細表示

---

## 🎉 Day 15進捗状況

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
├─ Day 15: 統計・分析機能 ✅
└─ Day 16: グラフ表示機能 ⏳ ← 次回

全体進捗: 15/21日 (71.4%)
```

---

## 🎊 Day 15の主要成果（完了）

### ✅ 統計・分析機能実装完全成功

**達成内容**:
- ✅ statisticsService.js作成（統計データ取得・計算）
- ✅ StatisticsCard.jsコンポーネント作成
- ✅ ProfileScreen統計セクション追加（6種類の統計カード）
- ✅ useFocusEffect実装（自動データ更新）
- ✅ 回答文字数上限拡張（2000 → 5000文字）

**表示している統計データ**:
- 総練習回数
- 総練習時間
- 平均所要時間
- 今週の練習回数（先週比較）
- 最近7日間のアクティビティ（簡易棒グラフ）
- 場面別統計

**GitHubコミット**:
```
コミットID: 45fe893（バグ修正）、9ea5670（初回実装）
メッセージ: [fix] Day 15: バグ修正と機能改善
```

---

## 📂 現在のプロジェクト構造（Day 15完了時点）

```
BusinessTrainer/
├── src/
│   ├── screens/
│   │   ├── ProfileScreen.js ✅ (統計セクション追加済み)
│   │   └── HistoryScreen.js ✅ (自動更新機能追加済み)
│   ├── services/
│   │   └── statisticsService.js ✅ (統計データ取得・計算)
│   ├── components/
│   │   └── StatisticsCard.js ✅ (統計カード表示)
│   └── constants/
│       └── appConfig.js ✅ (回答上限5000文字)
```

---

## 📋 Day 16実装タスク

### **タスク1: グラフライブラリの選定と導入（1時間）**

#### **1-1. ライブラリ候補の調査**

**候補1: react-native-chart-kit**
- GitHub: https://github.com/indiespirit/react-native-chart-kit
- 特徴:
  - ✅ 軽量でシンプル
  - ✅ Expo対応
  - ✅ 折れ線グラフ、棒グラフ、円グラフサポート
  - ❌ インタラクション機能が限定的
- インストール:
  ```bash
  npm install react-native-chart-kit react-native-svg
  ```

**候補2: victory-native**
- GitHub: https://github.com/FormidableLabs/victory
- 特徴:
  - ✅ 高機能でカスタマイズ性が高い
  - ✅ Expo対応
  - ✅ インタラクション機能が豊富
  - ❌ バンドルサイズが大きい
- インストール:
  ```bash
  npx expo install victory-native react-native-svg
  ```

**推奨**: **react-native-chart-kit** （シンプルで軽量、十分な機能）

#### **1-2. インストールと動作確認**

```bash
npm install react-native-chart-kit react-native-svg
```

**動作確認コード**:
```javascript
import { LineChart } from 'react-native-chart-kit';

<LineChart
  data={{
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [0, 1, 2, 1, 3, 0, 1] }]
  }}
  width={350}
  height={220}
  chartConfig={{
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  }}
/>
```

---

### **タスク2: 練習回数推移グラフ（2時間）**

#### **2-1. データ準備関数の追加**

**ファイル**: `src/services/statisticsService.js`

**新規関数**:
```javascript
/**
 * 過去30日間の練習回数データを取得
 * @param {Array} sessions - セッションデータ配列
 * @returns {object} グラフ用データ
 */
export const getMonthlyTrendData = (sessions) => {
  const now = new Date();
  const monthlyData = [];

  // 過去30日間のデータを生成
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = `${date.getMonth() + 1}/${date.getDate()}`;

    const count = sessions.filter((session) => {
      const sessionDate = session.createdAt?.toDate
        ? session.createdAt.toDate()
        : new Date(session.createdAt);
      return (
        sessionDate.getFullYear() === date.getFullYear() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getDate() === date.getDate()
      );
    }).length;

    monthlyData.push({
      date: dateString,
      count: count,
    });
  }

  return {
    labels: monthlyData.map(d => d.date).filter((_, i) => i % 5 === 0), // 5日おきにラベル表示
    data: monthlyData.map(d => d.count),
  };
};
```

#### **2-2. ProfileScreenにグラフコンポーネント追加**

**実装例**:
```javascript
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// 練習回数推移グラフ
const renderTrendGraph = () => {
  if (!statistics || statistics.totalSessions === 0) return null;

  const trendData = getMonthlyTrendData(sessions);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>練習回数推移（30日間）</Text>
      <LineChart
        data={{
          labels: trendData.labels,
          datasets: [{ data: trendData.data }]
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#2196F3'
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
};
```

---

### **タスク3: 場面別円グラフ（1.5時間）**

#### **3-1. データ準備関数の追加**

**ファイル**: `src/services/statisticsService.js`

**新規関数**:
```javascript
/**
 * 場面別円グラフデータを取得
 * @param {object} statistics - 統計データ
 * @returns {Array} 円グラフ用データ
 */
export const getScenePieData = (statistics) => {
  if (!statistics || !statistics.sceneStats) return [];

  const colors = ['#2196F3', '#4CAF50', '#FFB300', '#9C27B0', '#F44336'];

  return statistics.sceneStats.map((scene, index) => ({
    name: scene.sceneName,
    count: scene.count,
    color: colors[index % colors.length],
    legendFontColor: '#333',
    legendFontSize: 12
  }));
};
```

#### **3-2. ProfileScreenに円グラフコンポーネント追加**

**実装例**:
```javascript
import { PieChart } from 'react-native-chart-kit';

const renderScenePieChart = () => {
  if (!statistics || statistics.totalSessions === 0) return null;

  const pieData = getScenePieData(statistics);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>場面別練習割合</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};
```

---

### **タスク4: 週間比較棒グラフ（1時間）**

#### **4-1. ProfileScreenに棒グラフコンポーネント追加**

**実装例**:
```javascript
import { BarChart } from 'react-native-chart-kit';

const renderWeeklyComparisonChart = () => {
  if (!statistics) return null;

  const { thisWeek, lastWeek } = statistics.weeklyStats;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>週間練習回数比較</Text>
      <BarChart
        data={{
          labels: ['先週', '今週'],
          datasets: [{
            data: [lastWeek, thisWeek]
          }]
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix="回"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
};
```

---

## 🧪 テスト項目

### **基本動作テスト**
- [ ] グラフライブラリが正しくインストールされる
- [ ] アプリがクラッシュせずに起動する
- [ ] ProfileScreenにグラフが表示される

### **練習回数推移グラフテスト**
- [ ] 過去30日間のデータが正しく表示される
- [ ] グラフが滑らかな曲線（bezier）で表示される
- [ ] ラベルが5日おきに表示される
- [ ] データポイントが正しい位置に表示される

### **場面別円グラフテスト**
- [ ] 各場面の割合が正しく表示される
- [ ] 色分けが正しい
- [ ] 凡例が表示される
- [ ] 各セクションに練習回数が表示される

### **週間比較棒グラフテスト**
- [ ] 先週と今週の棒グラフが表示される
- [ ] 数値が正しい
- [ ] Y軸ラベルが「回」と表示される

### **データ整合性テスト**
- [ ] 統計データとグラフデータが一致する
- [ ] セッションが0件の場合、グラフが非表示になる
- [ ] 新しいセッション追加後、グラフが更新される

### **UI/UXテスト**
- [ ] グラフがスクロール可能
- [ ] グラフのサイズが適切
- [ ] 読みやすいフォントサイズ
- [ ] カラースキームが統一されている

---

## ⏱️ 所要時間

| タスク | 時間 |
|--------|------|
| **ライブラリ選定・導入** | 1時間 |
| **練習回数推移グラフ** | 2時間 |
| **場面別円グラフ** | 1.5時間 |
| **週間比較棒グラフ** | 1時間 |
| **テスト（グラフ表示）** | 1時間 |
| **デバッグ・調整** | 0.5時間 |
| **合計** | 約7時間 |

---

## 🔧 Day 16完了基準

### ✅ 実装チェックリスト

#### **ライブラリ導入**
- [ ] react-native-chart-kitインストール完了
- [ ] react-native-svgインストール完了
- [ ] 動作確認完了

#### **statisticsService.js拡張**
- [ ] getMonthlyTrendData関数作成
- [ ] getScenePieData関数作成

#### **ProfileScreen.js拡張**
- [ ] 練習回数推移グラフ追加
- [ ] 場面別円グラフ追加
- [ ] 週間比較棒グラフ追加
- [ ] グラフセクションのスタイリング

#### **テスト**
- [ ] 全グラフ表示テスト成功
- [ ] データ整合性テスト成功
- [ ] UI/UXテスト成功

---

## 📝 重要な技術パターン

### **react-native-chart-kitの基本パターン**

```javascript
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// 共通チャート設定
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
};

// 折れ線グラフ
<LineChart
  data={{ labels: [...], datasets: [{ data: [...] }] }}
  width={screenWidth - 40}
  height={220}
  chartConfig={chartConfig}
  bezier
/>

// 円グラフ
<PieChart
  data={[...]}
  width={screenWidth - 40}
  height={220}
  chartConfig={chartConfig}
  accessor="count"
  backgroundColor="transparent"
/>

// 棒グラフ
<BarChart
  data={{ labels: [...], datasets: [{ data: [...] }] }}
  width={screenWidth - 40}
  height={220}
  chartConfig={chartConfig}
/>
```

---

## 🚀 次回（Day 17）予定

### **Day 17: UI/UX改善**
- アニメーション追加
- ローディング表示改善
- エラー表示改善
- レスポンシブデザイン調整
- アクセシビリティ向上

---

## 🎓 これまでの学習成果

### **Week 1-3で習得した技術**

1. **React Native + Expo開発**
   - コンポーネント設計 ✅
   - Navigation（Stack, Tab） ✅
   - Context API ✅
   - Hooks（useState, useEffect, useRef, useCallback, useFocusEffect）✅
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

5. **データ管理・可視化**
   - Firestore CRUD操作 ✅
   - データバリデーション ✅
   - エラーハンドリング ✅
   - Pull to Refresh ✅
   - 履歴管理 ✅
   - 統計データ計算 ✅
   - グラフ表示 ⏳ ← Day 16

---

## 📞 開発サポート情報

### **リポジトリ**
- GitHub: https://github.com/fanta1127/business-communication-trainer/
- ブランチ: `week3-development`
- 最新コミット: `45fe893`

### **ドキュメント**
- Expo: https://docs.expo.dev/
- Firebase: https://firebase.google.com/docs
- react-native-chart-kit: https://github.com/indiespirit/react-native-chart-kit
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

## 🎯 Day 16開始準備チェックリスト

### **環境確認**

```bash
# プロジェクトに移動
cd ~/Desktop/Coding_Practice/Expo-app/BusinessTrainer

# ブランチ確認
git branch
# week3-development

# 最新コードを確認
git status
git log --oneline -5
```

### **前提条件確認**

Day 16を開始する前に、以下が完了していることを確認:
- ✅ Day 15完了（統計・分析機能実装済み）
- ✅ ProfileScreen統計セクション実装済み
- ✅ statisticsService.js実装済み
- ✅ StatisticsCard.js実装済み
- ✅ 自動更新機能実装済み（useFocusEffect）

---

## ✨ Week 3の目標（Day 16実施時点）

### **Week 3タスク** ⏳
- [x] Day 15: 統計・分析機能 ✅
- [ ] Day 16: グラフ表示機能 ← 次回
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

## 🚀 Day 16: グラフ表示機能実装へ！

**ユーザーの成長をより視覚的に理解しやすくするグラフ機能を実装します！**

統計データをインタラクティブなグラフで可視化し、練習の成果を実感できるようにします。

**グラフ表示機能を実現しましょう！** 📊

---

**最終更新**: Day 15完了（2025年10月28日）
**次回作業**: Day 16 - グラフ表示機能実装
**Week 3目標**: アプリ完成へ向けた最終調整
