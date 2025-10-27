// src/services/firestoreService.js
import {
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
import { db } from './firebaseConfig';

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

    // userIdをドキュメントIDとして使用
    const docRef = doc(db, 'users', userId);
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
