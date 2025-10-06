// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { subscribeToAuthChanges } from '../services/authService';

// Contextの作成
export const AuthContext = createContext({
  user: null,
  loading: true,
  isGuest: false,
  setIsGuest: () => {},
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
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Firebase Authentication の状態変更を監視
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'Logged in' : 'Logged out');
      setUser(firebaseUser);
      setLoading(false);
      
      // ユーザーがログインしたらゲストモードを解除
      if (firebaseUser) {
        setIsGuest(false);
      }
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isGuest,
    setIsGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};