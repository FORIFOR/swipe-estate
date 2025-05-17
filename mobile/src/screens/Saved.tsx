import React, { useCallback, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, FlatList, Text, RefreshControl, StyleSheet, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useFeed } from '../contexts/FeedContext';
import { useRealEstate } from '../contexts/RealEstateContext';
import { JRTheme as theme } from '../theme';

export default function SavedScreen() {
  const navigation = useNavigation();
  // FeedContextとRealEstateContextの両方を使用
  const { likedProperties, loading: feedLoading, error: feedError, loadLikedProperties } = useFeed();
  const { favoriteProperties, loading: realEstateLoading, error: realEstateError, loadFavoriteProperties } = useRealEstate();
  const [refreshing, setRefreshing] = useState(false);
  
  // 表示するお気に入り物件を統合
  const allFavorites = [...likedProperties, ...favoriteProperties];
  // 重複を除去
  const uniqueFavorites = Array.from(new Map(allFavorites.map(item => [item.id, item])).values());
  
  // デバッグ用のログ出力
  console.log('Saved画面のお気に入り物件数:', uniqueFavorites.length);
  console.log('Feedからのお気に入り:', likedProperties.length);
  console.log('RealEstateからのお気に入り:', favoriteProperties.length);
  
  // ローディング状態を統合
  const loading = feedLoading || realEstateLoading;
  // エラーを統合
  const error = feedError || realEstateError;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // 両方のコンテキストからお気に入りを読み込む
    await Promise.all([
      loadLikedProperties(),
      loadFavoriteProperties()
    ]);
    setRefreshing(false);
  }, [loadLikedProperties, loadFavoriteProperties]);

  useEffect(() => {
    // 画面表示時にいいね物件を読み込む
    console.log('Saved画面表示 - 両方のお気に入り物件を読み込み');
    const loadFavorites = async () => {
      try {
        setRefreshing(true);
        await loadFavoriteProperties();
        await loadLikedProperties();
      } catch (error) {
        console.error('お気に入り読み込みエラー:', error);
      } finally {
        setRefreshing(false);
      }
    };
    
    loadFavorites();
  }, []);

  if (loading)
    return <View style={styles.center}><Text style={styles.loading}>読み込み中...</Text></View>;
  if (error)
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;

  if (uniqueFavorites.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noItems}>お気に入り物件がありません</Text>
        <View style={{height: 20}} />
        <Text style={styles.subText}>物件をスワイプしてお気に入りすると、
ここに表示されます</Text>
        <View style={{height: 30}} />
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>再読み込み</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={uniqueFavorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('PropertyDetail', { property: item });
            }}
          >
            <Image source={{ uri: item.cover_url || 'https://via.placeholder.com/150' }} style={styles.image} />
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              <Text style={styles.price}>¥{item.price?.toLocaleString() || '---'}</Text>
              <Text style={styles.detail}>
                {(item.layout ?? '---')}・{item.station ?? '---'}駅 徒歩
                {item.walk_minutes ?? '--'}分
              </Text>
              <View style={styles.chips}>
                {item.deposit != null && (
                  <Text style={styles.chip}>敷金 {item.deposit}ヶ月</Text>
                )}
                {item.key_money != null && (
                  <Text style={styles.chip}>礼金 {item.key_money}ヶ月</Text>
                )}
              </View>
              <Text style={styles.address} numberOfLines={1} ellipsizeMode="tail">{item.address || ''}</Text>
              {item.owner_type && (
                <Text style={styles.ownerInfo}>
                  {item.owner_type === 'direct' ? 'オーナー直接' : '仲介業者'}: {item.owner_name || ''}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>お気に入り物件一覧</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <Text style={styles.refreshButtonText}>再読み込み</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 40, // 上の余白を増やす
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -70, // 上にスライドさせて真ん中に表示
  },
  loading: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
  noItems: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  subText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    height: 140, // 固定高さを設定
  },
  image: {
    width: width * 0.35,
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
  },
  price: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  chip: {
    fontSize: 12,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: theme.colors.surfaceVariant,
    color: '#333',
    overflow: 'hidden',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ownerInfo: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
});