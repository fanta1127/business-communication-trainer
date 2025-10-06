// src/services/authService.js
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
  } from 'firebase/auth';
  import { auth } from './firebaseConfig';
  
  /**
   * 新規ユーザー登録
   * @param {string} email - メールアドレス
   * @param {string} password - パスワード
   * @param {string} displayName - 表示名（オプション）
   * @returns {Promise<UserCredential>}
   */
  export const signUp = async (email, password, displayName = '') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 表示名が指定されている場合は更新
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      return userCredential;
    } catch (error) {
      console.error('Sign up error:', error);
      throw handleAuthError(error);
    }
  };
  
  /**
   * ログイン
   * @param {string} email - メールアドレス
   * @param {string} password - パスワード
   * @returns {Promise<UserCredential>}
   */
  export const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
      throw handleAuthError(error);
    }
  };
  
  /**
   * ログアウト
   * @returns {Promise<void>}
   */
  export const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Log out error:', error);
      throw handleAuthError(error);
    }
  };
  
  /**
   * 認証状態の変更を監視
   * @param {Function} callback - 認証状態変更時のコールバック関数
   * @returns {Function} unsubscribe - 監視を停止する関数
   */
  export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
  };
  
  /**
   * 現在のユーザーを取得
   * @returns {User|null}
   */
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  /**
   * Firebase Authエラーを日本語メッセージに変換
   * @param {Error} error - Firebase Authエラー
   * @returns {Error} - 日本語メッセージ付きエラー
   */
  const handleAuthError = (error) => {
    let message = 'エラーが発生しました';
  
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'このメールアドレスは既に使用されています';
        break;
      case 'auth/invalid-email':
        message = '無効なメールアドレスです';
        break;
      case 'auth/operation-not-allowed':
        message = 'この操作は許可されていません';
        break;
      case 'auth/weak-password':
        message = 'パスワードは6文字以上で設定してください';
        break;
      case 'auth/user-disabled':
        message = 'このアカウントは無効化されています';
        break;
      case 'auth/user-not-found':
        message = 'ユーザーが見つかりません';
        break;
      case 'auth/wrong-password':
        message = 'メールアドレスまたはパスワードが間違っています';
        break;
      case 'auth/invalid-credential':
        message = 'メールアドレスまたはパスワードが間違っています';
        break;
      case 'auth/too-many-requests':
        message = 'しばらく時間をおいてから再度お試しください';
        break;
      case 'auth/network-request-failed':
        message = 'ネットワークエラーが発生しました。接続を確認してください';
        break;
      default:
        message = error.message || 'エラーが発生しました';
    }
  
    const customError = new Error(message);
    customError.code = error.code;
    return customError;
  };