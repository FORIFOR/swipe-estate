import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

/* プロパティ型 */
export type Property = {
  id: string;
  title: string;
  price: number | null;
  cover_url: string | null;
  layout: string | null;
  station: string | null;
  walk_minutes: number | null;
  deposit: number | null;
  key_money: number | null;
  initial_cost: number | null;
  address: string | null;
  owner_type: 'direct' | 'agency' | null; // 所有者タイプ: direct=所有者直接, agency=仲介業者
  owner_name: string | null; // 所有者または仲介業者名
};

type FeedCtx = {
  feed: Property[];
  likedProperties: Property[];
  loading: boolean;
  error: string | null;
  likeProperty: (id: string, liked: boolean) => Promise<void>;
  loadLikedProperties: () => Promise<void>;
};

const FeedContext = createContext<FeedCtx>({
  feed: [],
  likedProperties: [],
  loading: true,
  error: null,
  likeProperty: async () => {},
  loadLikedProperties: async () => {},
});

export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [feed, setFeed] = useState<Property[]>([]);
  const [likedProperties, setLiked] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* 物件フィードを取得 */
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // 実際のSupabaseから物件データを取得
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .limit(20);

        if (error) {
          console.error('物件情報取得エラー:', error);
          throw error;
        }

        // データ型をPropertyに変換
        const properties: Property[] = data.map((item: any) => ({
          id: item.id,
          title: item.title || 'タイトルなし',
          price: item.price,
          cover_url: item.cover_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          layout: item.layout,
          station: item.station,
          walk_minutes: item.walk_minutes,
          deposit: item.deposit,
          key_money: item.key_money,
          initial_cost: item.initial_cost,
          address: item.address,
          owner_type: item.owner_type || 'agency',
          owner_name: item.owner_name,
        }));

        console.log(`物件情報を${properties.length}件取得しました`);
        setFeed(properties);
      } catch (error) {
        console.error('物件データ取得中のエラー:', error);
        // エラー時は最小限のテストデータを設定
        setFeed([
          {
            id: '1',
            title: '渋谷駅徒歩5分の素敵なワンルーム',
            price: 150000,
            cover_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            layout: '1LDK',
            station: '渋谷',
            walk_minutes: 5,
            deposit: 1,
            key_money: 1,
            initial_cost: 450000,
            address: '東京都渋谷区渋谷　1-1-1',
            owner_type: 'direct',
            owner_name: '佐藤不動産オーナー',
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // いいね済み物件を取得 - 依存配列を最適化
  const loadLikedProperties = useCallback(async () => {
    try {
      if (!user) {
        console.log('ユーザーがログインしていないため、いいね物件を取得できません');
        return;
      }
      
      console.log(`ユーザーID ${user.id} のいいね物件を取得中...`);
      
      // Supabaseデータベースの確認用に追加したログ
      console.log('電話番号: /mobile/src/contexts/FeedContext.tsx:109 - いいね情報取得開始');
      
      // Supabaseから最新のいいね情報を取得
      const { data, error } = await supabase
        .from('likes')
        .select('property_id')
        .eq('user_id', user.id);
          
      console.log('電話番号: /mobile/src/contexts/FeedContext.tsx:119 - Supabaseからのいいね情報取得完了', data);

      if (error) {
        console.error('いいね物件取得エラー:', error.message);
        // テーブルが存在しない場合は空の配列を返す
        setLiked([]);
        return;
      }
      
      const likeData = data || [];
      
      if (likeData.length === 0) {
        console.log('いいねした物件がありません');
        // 空配列を設定して、表示をクリア
        setLiked([]);
        return;
      }
      
      console.log(`いいね物件IDを${likeData.length}件取得しました, 詳細:`, likeData);
      
      // いいね物件のIDリストからテストデータ内の物件情報を取得
      const propertyIds = likeData.map(item => item.property_id);
      console.log('取得したいいね物件ID一覧:', propertyIds);
      
      if (propertyIds.length > 0) {
        // Supabaseからプロパティ情報を取得
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);
          
        if (error) {
          console.error('いいね物件データ取得エラー:', error.message);
          setLiked([]);
          return;
        }
        
        // データ型をPropertyに変換
        const likedProps: Property[] = data.map((item: any) => ({
          id: item.id,
          title: item.title || 'タイトルなし',
          price: item.price,
          cover_url: item.cover_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          layout: item.layout,
          station: item.station,
          walk_minutes: item.walk_minutes,
          deposit: item.deposit,
          key_money: item.key_money,
          initial_cost: item.initial_cost,
          address: item.address,
          owner_type: item.owner_type || 'agency',
          owner_name: item.owner_name,
        }));
        
        console.log(`いいね物件情報を${likedProps.length}件取得しました, 詳細:`, likedProps.map(p => p.id));
        setLiked(likedProps);
      } else {
        setLiked([]);
      }
    } catch (e: any) {
      console.error('いいね物件取得中の予期せぬエラー:', e.message);
      setLiked([]);
    }
  }, [user]); // 依存配列をuserのみに減らす

  useEffect(() => {
    // ユーザーが変わったときにデータを再取得する
    if (user) {
      // アプリ起動時にフィードがあればいいねを取得
      if (feed.length > 0) {
        console.log('ユーザーセッション検知: いいね取得開始');
        loadLikedProperties();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // ユーザーIDの変更のみを監視

  /* like / dislike - 通常関数として定義 */
  const likeProperty = async (id: string, liked: boolean) => {
    try {
      if (!user) {
        console.log('ユーザーがログインしていません');
        return;
      }
      
      console.log(`物件ID ${id} を ${liked ? 'いいね' : 'いいね解除'} - ユーザーID: ${user.id}`);
      
      // デバッグ用に追加したログ
      console.log('電話番号: /mobile/src/contexts/FeedContext.tsx:169 - 処理開始');

      // Supabaseでのいいね情報の更新
      try {
        if (liked) {
          // いいね登録
          const { error } = await supabase
            .from('likes')
            .upsert({ 
              user_id: user.id, 
              property_id: id, 
              created_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,property_id'
            });
            
          if (error) {
            console.error('いいね処理エラー:', error.message);
          }
        } else {
          // いいね解除
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq('property_id', id);
            
          if (error) {
            console.error('いいね解除エラー:', error.message);
          }
        }
      } catch (error) {
        console.error('いいね処理中の例外:', error);
      }
      
      console.log('電話番号: /mobile/src/contexts/FeedContext.tsx:193 - 処理完了');
      
      // UIを即座に更新するためのローカル操作
      if (liked) {
        // 対象の物件をフィードから指定idで取得
        const property = feed.find(p => p.id === id);
        if (property && !likedProperties.some(p => p.id === id)) {
          console.log(`物件ID ${id} をメモリ上のいいねリストに追加`);
          setLiked(prev => [...prev, property]);
        }
      } else {
        // いいね解除の場合、リストから除外
        console.log(`物件ID ${id} をメモリ上のいいねリストから削除`);
        setLiked(prev => prev.filter(p => p.id !== id));
      }
      
      // API通信後の再取得は行わない - ローカルステートのみ更新
    } catch (e: any) {
      console.error('いいね処理中の予期せぬエラー:', e.message);
    }
  };

  return (
    <FeedContext.Provider value={{ feed, likedProperties, loading, error, likeProperty, loadLikedProperties }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => useContext(FeedContext);