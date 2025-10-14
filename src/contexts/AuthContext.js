// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { subscribeToAuthChanges } from '../services/authService';

// 認証情報をグローバルに共有するためのContextの作成
export const AuthContext = createContext({
  user: null,
  loading: true,
  logout: () => {},
});

// カスタムフック: 認証状態を簡単に取得
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider コンポーネント
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase Authentication の状態変更を監視
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'Logged in' : 'Logged out');
      setUser(firebaseUser);
      setLoading(false);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  // ログアウト関数：認証状態をリセット
  const logout = async () => {
    try {
      // Firebaseからログアウト（ユーザーがログインしている場合）
      if (user) {
        const { logOut } = require('../services/authService');
        await logOut();
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // エラーが発生してもstateはリセット
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};