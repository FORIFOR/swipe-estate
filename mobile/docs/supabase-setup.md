# Supabase認証設定ガイド

## 1. メール認証の設定

Supabaseダッシュボードで以下の設定を確認・変更してください：

1. **Authentication > Providers > Email**
   - `Enable Email Provider` がオンになっていることを確認
   - `Confirm Email` を開発中は`Disabled`に設定
   - `Secure Email Change` を`Disabled`に設定（開発中）
   - `Secure Password Change` を`Disabled`に設定（開発中）

2. **Authentication > URL Configuration**
   - `Site URL` にアプリのURL（開発中はhttp://localhost:19006など）を設定
   - `Redirect URLs` に以下を追加：
     - `http://localhost:19006`
     - `exp://localhost:19000`
     - `swipeestate://`

3. **Authentication > Email Templates**
   - 必要に応じてメールテンプレートをカスタマイズ

## 2. メールドメインの制限

もしメールドメインが制限されている場合：

1. **Authentication > Providers > Email > Additional settings**
   - `Restrict sign-ups by domain` の設定を確認
   - 開発中は制限を解除するか、許可するドメインを追加

## 3. テストユーザーの作成

1. Supabaseダッシュボードの`Authentication > Users`タブから手動でユーザーを作成できます
2. または、以下のSQLを実行してテストユーザーを作成：

```sql
-- テストユーザーの作成
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@yourdomain.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

## 4. デバッグ手順

1. 環境変数が正しく設定されているか確認：
   ```bash
   node scripts/check-env.js
   ```

2. Supabaseの接続テスト：
   ```bash
   node scripts/test-auth.js
   ```

3. アプリ内でのテスト：
   - TestAuth画面で実際のメールアドレスを使用してテスト
   - コンソールログでエラーの詳細を確認

## 5. よくある問題と解決方法

### "Email address is invalid" エラー

- Supabaseの設定で特定のドメインのみ許可されている可能性
- 実際の有効なメールアドレスを使用してテスト

### "Invalid login credentials" エラー

- ユーザーが存在しない
- パスワードが間違っている
- メール確認が必要だが未確認

### セッションが保持されない

- AsyncStorageの設定を確認
- Expoの再起動を試す

## 6. 推奨される開発設定

開発中は以下の設定を推奨：

1. メール確認を無効化
2. パスワードの最小長を6文字に設定
3. テスト用のメールドメイン制限を解除
4. ログレベルを詳細に設定

本番環境では適切なセキュリティ設定に戻すことを忘れないでください。
