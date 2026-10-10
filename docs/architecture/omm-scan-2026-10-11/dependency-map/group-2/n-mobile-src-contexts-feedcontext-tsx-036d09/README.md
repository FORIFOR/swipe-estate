# dependency-map/group-2/n-mobile-src-contexts-feedcontext-tsx-036d09

[解析トップへ戻る](../../../README.md)

確認済みファイル: `mobile/src/contexts/FeedContext.tsx`

解析: 字句抽出。静的なimport／export参照です。関数の実行順序やHTTP通信は表していません。

- `react` → 外部・標準ライブラリ・別名など。ローカル対応先は未確定
- `../lib/supabase` → `mobile/src/lib/supabase.ts`（一覧確認・内容未読）
- `./AuthContext` → `mobile/src/contexts/AuthContext.tsx`（内容確認済み）


```mermaid
graph TD
    source["ソース\nmobile/src/contexts/FeedContext.tsx"]
    n-react-6b810c["react\n外部・別名・未解決"]
    source -->|"字句抽出: import／export"| n-react-6b810c
    n-lib-supabase-1ab51b["../lib/supabase\nmobile/src/lib/supabase.ts"]
    source -->|"字句抽出: import／export"| n-lib-supabase-1ab51b
    n-authcontext-40a192["./AuthContext\nmobile/src/contexts/AuthContext.tsx"]
    source -->|"字句抽出: import／export"| n-authcontext-40a192
```

## 要素の説明

### n-authcontext-40a192

参照名: `./AuthContext`

対応する実在ソース: `mobile/src/contexts/AuthContext.tsx`。内容確認済み。

### n-lib-supabase-1ab51b

参照名: `../lib/supabase`

対応する実在ソース: `mobile/src/lib/supabase.ts`。内容は未読。

### n-react-6b810c

参照名: `react`

ローカルのソース対応先を確定できませんでした。外部ライブラリ、標準ライブラリ、型別名などを区別する追加確認が必要です。

### source

`mobile/src/contexts/FeedContext.tsx` の内容を確認しました。

