import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

type AuthCtx = {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>(null as any);
export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const user = session?.user ?? null;

  // Expo Google provider
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  } as any);
  WebBrowser.maybeCompleteAuthSession();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('Current session:', data.session ? 'Active' : 'None');
        setSession(data.session);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    })();
    
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      console.log('Auth state changed:', event, sess ? 'Active session' : 'No session');
      setSession(sess);
    });
    
    return () => sub.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      // IIFE でラップして await を安全に使う
      (async () => {
        const { idToken } = response.authentication!;
  
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,           // v2 SDK は token プロパティ
        });
  
        if (error) console.error(error);
      })();
    }
  }, [response]);

  const signInWithGoogle = async () => {
    promptAsync();
  };
  
  const signInWithPassword = async (email: string, password: string) => {
    if (!email.includes('@')) throw new Error('メールアドレスが正しくありません');
    if (password.length < 6) throw new Error('パスワードは6文字以上必要です');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password: password.trim() 
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      if (data?.session) {
        console.log('Login successful');
        return data;
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      throw error;
    }
  };
  
  const signUp = async (email: string, password: string) => {
    if (!email.includes('@')) throw new Error('メールアドレスが正しくありません');
    if (password.length < 6) throw new Error('パスワードは6文字以上必要です');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: undefined,
          data: {
            app_name: 'swipe-estate'
          },
          // Supabaseの設定によっては、ここでautoConfirmを設定できる場合があります
          // autoConfirm: true,
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      if (data?.user && !data.session) {
        console.log('Sign up successful - please check your email for verification');
        // 開発中は、自動的にログインを試みる
        try {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password: password.trim(),
          });
          if (!loginError && loginData.session) {
            console.log('Auto-login successful after signup');
            return loginData;
          }
        } catch (e) {
          console.log('Auto-login failed, email confirmation may be required');
        }
        return data;
      }
      
      if (data?.session) {
        console.log('Sign up successful - auto logged in');
        return data;
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      throw error;
    }
  };
  
  const signOut = async () => { await supabase.auth.signOut(); };

  const value = { session, user, loading, signInWithGoogle, signInWithPassword, signUp, signOut };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};