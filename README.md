# Swipe Estate - JR East Style Property App

## 概要

JR東日本スタイルのスワイプ型物件アプリ。

## セットアップ手順

### 1. 必要な依存関係のインストール

```bash
cd mobile
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

### 2. Supabaseの設定

1. [Supabase](https://supabase.com)にアクセスしてプロジェクトを作成
2. プロジェクトのダッシュボードから「SQL Editor」を開く
3. `supabase-setup.sql`の内容をコピーして実行
4. プロジェクトの「Settings > API」からURL とanon keyを取得

### 3. アプリの設定

`mobile/src/lib/supabase.ts`を開き、以下の部分を実際の値に置き換えてください：

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 4. アプリの起動

```bash
cd mobile
npm start
```

その後、「i」を押してiOSシミュレーターで起動します。

## 機能

- **ホーム**: 物件をスワイプして気に入った物件を保存
- **保存済み**: お気に入りの物件一覧を表示
- **検索**: 条件を指定して物件を検索
- **プロフィール**: ユーザー設定

## 注意事項

- デモ版では認証機能は実装されていません（ユーザーIDは固定）
- 実際の運用では適切な認証システムを実装してください
- 画像はプレースホルダーを使用しています
