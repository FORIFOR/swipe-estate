// scripts/check-env.js
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log('環境変数チェック:');
console.log('=================');

if (fs.existsSync(envPath)) {
  console.log('✓ .envファイルが存在します');
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key.includes('SUPABASE')) {
        console.log(`${key} = ${value ? '設定済み' : '未設定'}`);
      }
    }
  });
} else {
  console.error('✗ .envファイルが見つかりません');
}

// 環境変数の実際の値をチェック
console.log('\n実際の環境変数:');
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '設定済み（最初の10文字）: ' + process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) : '未設定');
