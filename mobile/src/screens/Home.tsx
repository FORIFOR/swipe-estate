// mobile/src/screens/Home.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SwipeDeck from '../components/SwipeDeck';
import { JRTheme as theme } from '../theme';

export default function Home() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [stations, setStations] = useState<string[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  
  // 静的な駅リスト
  const POPULAR_STATIONS = [
    '渋谷',
    '新宿',
    '恵比寿',
    '池袋',
    '品川',
    '目黒',
    '東京',
    '横浜',
    '自由が丘',
    '上野',
    '秋葉原',
    '銀座',
    '鉄道博物館',
    '七里ヶ浜',
  ];

  console.log('Home screen rendering...');

  // 地域を選択する関数
  const toggleStation = (station: string) => {
    setSelectedStations(prev => {
      // 既に選択されている場合は削除
      if (prev.includes(station)) {
        return prev.filter(s => s !== station);
      } 
      // 選択されていない場合は追加
      return [...prev, station];
    });
  };

  // 物件Go!ボタンのハンドラー
  const handleGoToSwipe = () => {
    // @ts-ignore
    navigation.navigate('PropertySwipe', {
      searchParams: {
        stations: selectedStations,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        keyword: searchQuery || undefined,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>SwipeEstate</Text>
      
      <ScrollView style={styles.content}>
        {/* 検索バー */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="キーワードで検索"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* 駅名選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>駅名を選択:</Text>
          <Text style={styles.sectionSubtitle}>複数選択可能</Text>
          <View style={styles.stationTags}>
            {POPULAR_STATIONS.map((station) => (
              <TouchableOpacity
                key={station}
                style={[
                  styles.stationTag,
                  selectedStations.includes(station) && styles.stationTagSelected,
                ]}
                onPress={() => toggleStation(station)}
              >
                <Text
                  style={[
                    styles.stationTagText,
                    selectedStations.includes(station) && styles.stationTagTextSelected,
                  ]}
                >
                  {station}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 価格帯 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>家賃範囲:</Text>
          <View style={styles.priceContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="下限額"
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
            />
            <Text style={styles.priceSeparator}>~</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="上限額"
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
            />
          </View>
        </View>

        {/* Goボタン */}
        <TouchableOpacity 
          style={[styles.goButton, selectedStations.length === 0 && styles.goButtonDisabled]} 
          onPress={handleGoToSwipe}
          disabled={selectedStations.length === 0}
        >
          <Text style={styles.goButtonText}>物件Go!</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  container: { 
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: -10,
    marginBottom: 10,
  },
  stationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stationTag: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  stationTagSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stationTagText: {
    color: '#333',
    fontSize: 16,
  },
  stationTagTextSelected: {
    color: '#fff',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  priceSeparator: {
    paddingHorizontal: 10,
    fontSize: 18,
    color: '#666',
  },
  goButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  goButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  goButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});