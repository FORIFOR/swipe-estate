import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { JRTheme as theme } from '../theme';

const { width } = Dimensions.get('window');

// テスト用のダミーデータ
const DUMMY_PROPERTIES = [
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
  },
  {
    id: '2',
    title: '水道橋駅徒歩10分のラグジュアリー物件',
    price: 180000,
    cover_url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    layout: '2LDK',
    station: '水道橋',
    walk_minutes: 10,
    deposit: 2,
    key_money: 1,
    initial_cost: 550000,
    address: '東京都渋谷区水道橋　2-2-2',
  },
  {
    id: '3',
    title: '豊洲駅徒歩7分の新築マンション',
    price: 120000,
    cover_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    layout: '1K',
    station: '豊洲',
    walk_minutes: 7,
    deposit: 1,
    key_money: 0,
    initial_cost: 350000,
    address: '東京都新宿区豊洲　3-3-3',
  },
];

/** テスト用のシンプルなカードコンポーネント */
export default function TestSwipe() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  
  console.log('TestSwipe rendering...');

  const property = DUMMY_PROPERTIES[currentIndex];
  
  if (!property) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>物件がありません</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => setCurrentIndex(0)}
        >
          <Text style={styles.buttonText}>最初から見る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLike = (id: string, isLiked: boolean) => {
    console.log(`物件 ${id} を ${isLiked ? 'いいね' : 'スキップ'}`);
    if (isLiked) {
      setLiked(prev => [...prev, id]);
    }
    setCurrentIndex(currentIndex + 1);
  };

  // 数値のフォーマット
  const formatNumber = (num?: number | null) => {
    if (typeof num !== 'number' || !isFinite(num)) return '---';
    return new Intl.NumberFormat().format(num);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.debug}>
        テストモード: カード {currentIndex + 1}/{DUMMY_PROPERTIES.length}
      </Text>
      
      <View style={styles.card}>
        <Image source={{ uri: property.cover_url }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.price}>¥{formatNumber(property.price)}</Text>
          <Text style={styles.detail}>
            {property.layout ?? '---'}・{property.station ?? '---'}駅 徒歩
            {property.walk_minutes ?? '--'}分
          </Text>
          <View style={styles.chips}>
            {property.deposit != null && (
              <Text style={styles.chip}>敷 {property.deposit}</Text>
            )}
            {property.key_money != null && (
              <Text style={styles.chip}>礼 {property.key_money}</Text>
            )}
            {property.initial_cost != null && (
              <Text style={styles.chip}>初期 ~¥{formatNumber(property.initial_cost)}</Text>
            )}
          </View>
          <Text style={styles.address}>{property.address ?? ''}</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF6B6B' }]}
          onPress={() => handleLike(property.id, false)}
        >
          <Text style={styles.buttonText}>✕ スキップ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleLike(property.id, true)}
        >
          <Text style={styles.buttonText}>♥ いいね</Text>
        </TouchableOpacity>
      </View>
      
      {liked.length > 0 && (
        <View style={styles.likedContainer}>
          <Text style={styles.likedTitle}>いいねした物件: {liked.length}件</Text>
          {liked.map(id => {
            const prop = DUMMY_PROPERTIES.find(p => p.id === id);
            return prop ? (
              <Text key={id} style={styles.likedItem}>
                • {prop.title}
              </Text>
            ) : null;
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  debug: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  card: {
    width: '100%',
    height: 420,
    borderRadius: 8,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  image: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  chip: {
    fontSize: 12,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: theme.colors.surfaceVariant,
    color: '#333',
  },
  address: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  likedContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  likedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  likedItem: {
    fontSize: 14,
    marginBottom: 5,
  },
});
