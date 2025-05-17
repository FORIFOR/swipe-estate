import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
// import { Database } from './types'; // DB 型がある場合は有効化

/**
 * Supabase client — React Native (Expo) 用
 * URL / KEY は .env / app.config.(js|json) から読み込み、
 * ハードコードを避ける設計にしました。
 */
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[supabase] 環境変数 EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY が未設定です');
} else {
  console.log('[supabase] 接続情報:');
  console.log('URL:', SUPABASE_URL);
  console.log('KEY (first 10 chars):', SUPABASE_ANON_KEY.substring(0, 10) + '...');
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // React Native では URL 解析を行わない
    },
    // ★Realtime が不要なら以下を有効化
    // realtime: { enabled: false },
  }
);

/* ───────── DB モデル定義（任意） ───────── */
export interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  layout: string;
  area: number;
  station: string;
  walk_minutes: number;
  image_url: string;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  property_id: string;
  is_liked: boolean;
  created_at: string;
}