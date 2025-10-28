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
