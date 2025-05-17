const { createClient } = require('@supabase/supabase-js');

// .envファイルから環境変数を読み込む
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Supabase認証テストを開始...');
  
  const testEmail = 'test@example.com';
  const testPassword = 'test123456';
  
  try {
    // 1. ユーザー登録テスト
    console.log('\n1. ユーザー登録テスト:');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.error('登録エラー:', signUpError);
    } else {
      console.log('登録成功:', signUpData.user?.email);
    }
    
    // 2. ログインテスト
    console.log('\n2. ログインテスト:');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.error('ログインエラー:', signInError);
    } else {
      console.log('ログイン成功:', signInData.session?.user.email);
    }
    
    // 3. セッション確認
    console.log('\n3. セッション確認:');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('セッションエラー:', sessionError);
    } else {
      console.log('現在のセッション:', session ? 'アクティブ' : 'なし');
    }
    
  } catch (error) {
    console.error('予期せぬエラー:', error);
  }
}

testAuth();
