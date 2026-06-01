'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { clientAPI, Profile, isSupabaseConfigured, initMockStorage } from '@/lib/supabase';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  isMock: boolean;
  signIn: (email: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, nickname: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (nickname: string, avatarUrl: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    // 初始化本地存储 seed 数据
    initMockStorage();
    
    // 判断是否在使用 mock
    setIsMock(!isSupabaseConfigured);

    async function loadUser() {
      try {
        const u = await clientAPI.auth.getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error('Error loading current user:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const signIn = async (email: string) => {
    setLoading(true);
    try {
      const { user: profile, error } = await clientAPI.auth.signIn(email);
      if (error) {
        return { success: false, error: String(error) };
      }
      setUser(profile as Profile);
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || '登录失败' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, nickname: string) => {
    setLoading(true);
    try {
      const { user: profile, error } = await clientAPI.auth.signUp(email, nickname);
      if (error) {
        return { success: false, error: String(error) };
      }
      setUser(profile as Profile);
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || '注册失败' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await clientAPI.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (nickname: string, avatarUrl: string) => {
    try {
      const { data, error } = await clientAPI.auth.updateProfile(nickname, avatarUrl);
      if (!error && data) {
        setUser(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isMock, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
