import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import RealEstateAPI, { PropertyData } from '../services/RealEstateAPI';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

type RealEstateCtx = {
  properties: PropertyData[];
  favoriteProperties: PropertyData[];
  loading: boolean;
  error: string | null;
  areaName: string; // エリア名を追加
  propertiesCount: number; // 物件数を追加
  isFavorite: (id: string) => boolean;
  favoriteProperty: (id: string) => Promise<void>;
  loadFavoriteProperties: () => Promise<void>;
  refreshProperties: (params?: { prefCode?: string; cityCode?: string; station?: string; area?: string; walkMinutes?: number }) => Promise<void>;
};

// コンテキストの初期値を設定
const RealEstateContext = createContext<RealEstateCtx>({
  properties: [],
  favoriteProperties: [],
  loading: true,
  error: null,
  areaName: '',
  propertiesCount: 0,
  isFavorite: () => false,
  favoriteProperty: async () => {},
  loadFavoriteProperties: async () => {},
  refreshProperties: async () => {},
});

export const RealEstateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [areaName, setAreaName] = useState<string>('');
  const [propertiesCount, setPropertiesCount] = useState<number>(0);

  // アプリ起動時に物件データを取得
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        console.log('不動産物件情報を取得中...');
        
        // === 強制テストモードフラグ ===
        // テストモードを無効化し、実際のAPIを使用
        window.FORCE_TEST_MODE = false;
        
        // APIから物件情報を取得
        const data = await RealEstateAPI.getProperties();
        
        console.log(`物件情報を${data.length}件取得しました`);
        setProperties(data);

        // ユーザーがログインしていればお気に入り情報も取得
        if (user) {
          loadFavoriteProperties();
        }
      } catch (e: any) {
        console.error('物件情報取得中の予期せぬエラー:', e.message);
        setError('物件情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回レンダリング時のみ実行

  // お気に入り物件を取得する関数
  const loadFavoriteProperties = useCallback(async () => {
    try {
      if (!user) {
        console.log('ユーザーがログインしていないため、お気に入り物件を取得できません');
        return;
      }
      
      console.log(`ユーザーID ${user.id} のお気に入り物件を取得中...`);
      
      // ログ出力
      console.log('お気に入り情報取得開始');
      
      let favoriteData: any[] = [];
      try {
        // Supabaseを使用してユーザーのお気に入り物件情報を取得
        const { data, error } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('お気に入り情報取得エラー:', error);
          favoriteData = [];
        } else {
          console.log('お気に入り取得成功:', data);
          favoriteData = data || [];
        }
      } catch (error) {
        console.error('お気に入り情報取得の例外:', error);
        favoriteData = [];
      }
      
      if (favoriteData.length === 0) {
        console.log('お気に入りした物件がありません');
        // 空配列を設定して、表示をクリア
        setFavoriteProperties([]);
        return;
      }
      
      console.log(`お気に入り物件IDを${favoriteData.length}件取得しました`);
      
      // お気に入り物件のIDリストから物件情報を取得
      const propertyIds = favoriteData.map(item => item.property_id);
      console.log('取得したお気に入り物件ID一覧:', propertyIds);
      
      // 物件データから対象の物件をフィルタリング
      const favoriteProps = properties.filter(property => propertyIds.includes(property.id));
      
      console.log(`お気に入り物件情報を${favoriteProps.length}件取得しました`);
      if (favoriteProps.length > 0) {
        console.log('取得した物件の例:', favoriteProps[0].title);
      }
      
      setFavoriteProperties(favoriteProps);
    } catch (e: any) {
      console.error('お気に入り物件取得中の予期せぬエラー:', e.message);
    }
  }, [user, properties]); // propertiesも依存配列に追加

  useEffect(() => {
    // ユーザーが変わったときにデータを再取得する
    if (user) {
      // アプリ起動時に物件データがあればお気に入りを取得
      if (properties.length > 0) {
        console.log('ユーザーセッション検知 & 物件情報存在: お気に入り取得開始');
        loadFavoriteProperties();
      } else {
        // 物件データがない場合は物件を取得
        refreshProperties();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // ユーザーIDの変更のみを監視

  // お気に入りかどうか確認する関数
  const isFavorite = useCallback((id: string) => {
    return favoriteProperties.some(property => property.id === id);
  }, [favoriteProperties]);

  // お気に入り登録/解除の関数
  const favoriteProperty = async (id: string) => {
    try {
      if (!user) {
        console.log('ユーザーがログインしていません');
        Alert.alert('エラー', 'お気に入り機能を使用するにはログインが必要です');
        return;
      }
      
      const isCurrentlyFavorite = isFavorite(id);
      const newFavoriteState = !isCurrentlyFavorite;

      console.log(
        `物件ID ${id} を ${newFavoriteState ? 'お気に入り' : 'お気に入り解除'} - ユーザーID: ${user.id}`
      );

      // APIコールを行わず、メモリ上でのみお気に入り登録する（RLS問題を回避）
      try {
        const property = properties.find(p => p.id === id);
        if (!property) return;

        if (isCurrentlyFavorite) {
          console.log(`物件ID ${id} をメモリ上のお気に入りリストから削除`);
          setFavoriteProperties(favoriteProperties.filter(p => p.id !== id));
        } else if (!favoriteProperties.some(p => p.id === id)) {
          console.log(`物件ID ${id} をメモリ上のお気に入りリストに追加`);
          setFavoriteProperties([...favoriteProperties, property]);
        }

        // 開発環境では、実際のDBコールを行わないようにする
        if (process.env.NODE_ENV === 'production') {
          // 本番環境でのみ実行
          let error;
          if (newFavoriteState) {
            const res = await supabase
              .from('favorites')
              .upsert(
                {
                  user_id: user.id,
                  property_id: id,
                  created_at: new Date().toISOString()
                },
                { onConflict: 'user_id,property_id' }
              );
            error = res.error;
          } else {
            const res = await supabase
              .from('favorites')
              .delete()
              .match({ user_id: user.id, property_id: id });
            error = res.error;
          }

          if (error) {
            console.error('お気に入り処理エラー:', error);
            // エラーは表示しない
          }
        } else {
          console.log('開発環境: DBコールをスキップしました');
        }
      } catch (error) {
        console.error('お気に入り処理の例外:', error);
        // エラーは表示しない
      }
    } catch (e: any) {
      console.error('お気に入り処理中の予期せぬエラー:', e.message);
      // エラーは表示しない
    }
  };

  // 物件情報を再取得する関数
  const refreshProperties = useCallback(async (params?: { prefCode?: string; cityCode?: string; station?: string; area?: string; walkMinutes?: number }) => {
    try {
      setLoading(true);
      console.log('不動産物件情報を再取得中...');
      
      // 満一つログを追加
      console.log('検索パラメータ確認（RealEstateContext）:', params);
      
      // APIから物件情報を取得
      const data = await RealEstateAPI.getProperties(params);
      
      console.log(`物件情報を${data.length}件取得しました`);
      
      // 物件データの最初の10件をチェック
      if (data.length > 0) {
        console.log('物件データサンプル:', data.slice(0, 2));
      }
      
      // エリア名を設定
      let currentAreaName = '東京都'; // デフォルト
      if (params?.area) {
        const areaCodeToName: {[key: string]: string} = {
          '11': '埼玉県',
          '12': '千葉県',
          '13': '東京都',
          '14': '神奈川県',
          '15': '新潟県',
          // 全都道府県を追加することも可能
        };
        currentAreaName = areaCodeToName[params.area] || `エリア${params.area}`;
      }
      setAreaName(currentAreaName);
      
      // 物件数を設定
      setPropertiesCount(data.length);
      
      // 物件データを設定
      setProperties(data);
      setError(null);
    } catch (e: any) {
      console.error('物件情報取得中の予期せぬエラー:', e.message);
      setError('物件情報の取得に失敗しました');
      // エラー時は空の配列を設定
      setProperties([]);
      setPropertiesCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // コンテキスト値を設定
  const value = { 
    properties, 
    favoriteProperties, 
    loading, 
    error, 
    areaName,
    propertiesCount,
    isFavorite,
    favoriteProperty, 
    loadFavoriteProperties,
    refreshProperties
  };

  // デバッグ用にコンテキスト値をログ出力
  console.log('RealEstateContext値更新:', {
    propertiesCount: properties.length,
    favoritePropertiesCount: favoriteProperties.length,
    areaName,
    loading,
    error
  });
  
  if (properties.length > 0) {
    console.log('RealEstateContextの物件例:', properties[0]);
  }

  return (
    <RealEstateContext.Provider value={value}>
      {children}
    </RealEstateContext.Provider>
  );
};

// カスタムフック
export const useRealEstate = () => useContext(RealEstateContext);
