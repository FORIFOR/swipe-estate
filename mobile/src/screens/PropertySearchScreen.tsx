import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { JRTheme as theme } from '../theme';
import { useRealEstate } from '../contexts/RealEstateContext';
import Icon from '@expo/vector-icons/MaterialIcons';
import { PropertyData } from '../services/RealEstateAPI';

// 駅名のサンプルデータ
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

type PropertySearchParams = {
  station?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  layout?: string[];
  walkMinutes?: number;
};

export default function PropertySearchScreen() {
  const navigation = useNavigation();
  const { properties, loading, refreshProperties } = useRealEstate();
  
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({});
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [onlyJR, setOnlyJR] = useState(false);
  const [walkSpeedSlow, setWalkSpeedSlow] = useState(false);
  const [useIC, setUseIC] = useState(true);

  // ページを切り替える関数
  const navigateToSwipe = (stationName: string) => {
    // 駅名に基づいて検索パラメータを構築
    console.log('スワイプ画面に遷移します。検索条件:', {
      stations: stationName ? [stationName] : [],
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      walkMinutes: searchParams.walkMinutes,
    });
    
    // @ts-ignore
    navigation.navigate('PropertySwipe', { 
      searchParams: {
        stations: stationName ? [stationName] : [],
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
        walkMinutes: searchParams.walkMinutes,
      }
    });
  };

  // 物件をフィルタリングする関数
  const filterProperties = async () => {
    if (!properties || properties.length === 0) {
      return [];
    }

    try {
      // ローカルでフィルタリングを適用
      let filtered = [...properties];
  
      // 駅名でフィルタリング
      if (toLocation) {
        console.log(`ローカルフィルタリング: ${toLocation} に関連する物件を検索`);
        filtered = filtered.filter((property) => 
          property.station?.includes(toLocation) || 
          property.address?.includes(toLocation)
        );
        console.log(`駅名/住所に '${toLocation}' を含む物件数: ${filtered.length}件`);
      }
  
      // 価格帯でフィルタリング (searchParamsが設定されている場合)
      if (searchParams.minPrice) {
        filtered = filtered.filter((property) => 
          (property.price || 0) >= (searchParams.minPrice || 0)
        );
      }
  
      if (searchParams.maxPrice) {
        filtered = filtered.filter((property) => 
          (property.price || 0) <= (searchParams.maxPrice || 0)
        );
      }
  
      // 徒歩分数でフィルタリング
      if (searchParams.walkMinutes) {
        filtered = filtered.filter((property) => 
          (property.walk_minutes || 0) <= (searchParams.walkMinutes || 10)
        );
      }
  
      // 間取りでフィルタリング
      if (searchParams.layout && searchParams.layout.length > 0) {
        filtered = filtered.filter((property) => 
          searchParams.layout?.some(layout => property.layout?.includes(layout))
        );
      }
      
      return filtered;
    } catch (error) {
      console.error('物件フィルタリング中のエラー:', error);
      return [];
    }
  };

  // フォームの送信処理
  const handleSubmit = async () => {
    try {
      setLoading(true); // 読み込み開始
      console.log(`検索ボタンが押されました。駅名: "${toLocation}"`);

      // 駅名による検索を実行
      if (toLocation) {
        // Step 1: 駅名に基づいて地域コードを設定 - マッピングテーブルを使用
        const STATION_TO_AREA_MAP: {[key: string]: string} = {
          '渋谷': '13',
          '新宿': '13',
          '恵比寿': '13',
          '池袋': '13',
          '品川': '13',
          '目黒': '13',
          '東京': '13',
          '横浜': '14',
          '自由が丘': '13',
          '上野': '13',
          '秋葉原': '13',
          '銀座': '13',
          '鉄道博物館': '11', // 埼玉県
          '七里ヶ浜': '14',   // 神奈川県
        };
        
        // 駅名から地域コードを取得
        let areaCode = STATION_TO_AREA_MAP[toLocation] || '13'; // デフォルトは東京
        
        console.log(`駅名「${toLocation}」のエリアコード: ${areaCode}を使用します`);

        // Step 2: 検索パラメータを満構築
        const searchApiParams = {
          area: areaCode,
          station: toLocation,
          walkMinutes: searchParams.walkMinutes // 駅徒歩分数を追加
        };
        
        console.log('検索APIパラメータ:', searchApiParams);
        
        // Step 3: API呼び出しで物件データを再取得
        console.log('新しいデータをAPIから取得中...');
        try {
          await refreshProperties(searchApiParams);
          console.log(`エリアコード: ${areaCode} のデータを取得しました`);
          
          // 少し遅延を追加して、データが正しく更新されるようにする
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (apiError) {
          console.error('物件データ取得中のエラー:', apiError);
          Alert.alert('データ取得エラー', `${toLocation}駅のデータ取得中にエラーが発生しました。しばらくしてから再度お試しください。`);
          setLoading(false);
          return;
        }
        
        // Step 4: フィルタリングを実行
        console.log('取得したデータからフィルタリングを実行中...');
        const filtered = await filterProperties();
        setFilteredProperties(filtered);
        console.log(`検索条件に合う物件が${filtered.length}件見つかりました`);
        
        // Step 5: 結果に基づいて画面遷移またはアラート表示
        if (filtered.length > 0) {
          // 検索結果があればユーザーに通知してスワイプ画面に遷移
          Alert.alert(
            '検索結果', 
            `${toLocation}駅周辺の物件が${filtered.length}件見つかりました。`,
            [{ text: '物件を表示する', style: 'default', onPress: () => navigateToSwipe(toLocation) }]
          );
        } else {
          Alert.alert(
            '検索結果', 
            `${toLocation}駅周辺の物件が見つかりませんでした。別の駅名で試してください。`,
            [{ text: 'わかりました', style: 'default' }]
          );
        }
      } else {
        // 駅名が指定されていない場合
        Alert.alert('駅名が必要です', '検索する駅名を入力してください');
      }
    } catch (error) {
      console.error('物件検索中のエラー:', error);
      let errorMessage = '検索中にエラーが発生しました。';
      
      // エラーメッセージに年度情報を追加
      if (error instanceof Error && error.message.includes('404')) {
        errorMessage += '\n\n現在は2024年度のデータが利用可能です。';
      } else {
        errorMessage += '\n再度お試しください。';
      }
      
      Alert.alert('エラー', errorMessage);
    } finally {
      setLoading(false); // 処理完了
    }
  };

  // 人気の駅を選択
  const selectStation = (station: string) => {
    setToLocation(station);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ローディングインジケーター */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>検索中...</Text>
        </View>
      )}
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerTabs}>
          <Text style={styles.headerTabActive}>検索履歴</Text>
          <Text style={styles.headerTab}>検索</Text>
          <Text style={styles.headerTab}>よく見る検索</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* タイトル */}
        <Text style={styles.title}>
          {fromLocation ? fromLocation : '出発地'}
          <Text style={styles.titleNormal}>から</Text>
        </Text>

        {/* 目的地入力 */}
        <View style={styles.destinationContainer}>
          <Text style={styles.destinationText}>{toLocation}</Text>
          <Text style={styles.destinationSuffix}>まで</Text>
        </View>

        {/* 検索条件 */}
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.optionButton}>
            <Icon name="swap-vert" size={24} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>+ 経由</Text>
          </TouchableOpacity>
        </View>

        {/* 駅名入力フォーム */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>希望の駅名:</Text>
          <TextInput
            style={styles.input}
            value={toLocation}
            onChangeText={setToLocation}
            placeholder="例: 渋谷"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* 人気の駅 */}
        <View style={styles.popularStations}>
          <Text style={styles.sectionTitle}>人気の駅:</Text>
          <View style={styles.stationTags}>
            {POPULAR_STATIONS.map((station) => (
              <TouchableOpacity
                key={station}
                style={[
                  styles.stationTag,
                  toLocation === station && styles.stationTagSelected,
                ]}
                onPress={() => selectStation(station)}
              >
                <Text
                  style={[
                    styles.stationTagText,
                    toLocation === station && styles.stationTagTextSelected,
                  ]}
                >
                  {station}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 価格範囲 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>家賃範囲:</Text>
          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={searchParams.minPrice?.toString() || ''}
              onChangeText={(text) =>
                setSearchParams({
                  ...searchParams,
                  minPrice: text ? parseInt(text) : undefined,
                })
              }
              placeholder="下限 (例: 80000)"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
            />
            <Text style={{ marginHorizontal: 8 }}>〜</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={searchParams.maxPrice?.toString() || ''}
              onChangeText={(text) =>
                setSearchParams({
                  ...searchParams,
                  maxPrice: text ? parseInt(text) : undefined,
                })
              }
              placeholder="上限 (例: 150000)"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* 駅徒歩 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>駅徒歩:</Text>
          <TextInput
            style={styles.input}
            value={searchParams.walkMinutes?.toString() || ''}
            onChangeText={(text) =>
              setSearchParams({
                ...searchParams,
                walkMinutes: text ? parseInt(text) : undefined,
              })
            }
            placeholder="徒歩分数 (例: 10)"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
          />
        </View>

        {/* 出発時間 */}
        <View style={styles.departureSetting}>
          <Text style={styles.departureLabel}>現在時刻</Text>
          <Text style={styles.departureOption}>出発</Text>
        </View>

        {/* 検索オプション */}
        <View style={styles.searchOptions}>
          <View style={styles.optionItem}>
            <Text>JRのみ</Text>
            <Switch
              value={onlyJR}
              onValueChange={setOnlyJR}
              trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
              thumbColor={onlyJR ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.optionItem}>
            <Text>ゆっくり歩く</Text>
            <Switch
              value={walkSpeedSlow}
              onValueChange={setWalkSpeedSlow}
              trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
              thumbColor={walkSpeedSlow ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.optionItem}>
            <Text>ICカード</Text>
            <Switch
              value={useIC}
              onValueChange={setUseIC}
              trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
              thumbColor={useIC ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* 検索ボタン */}
        <TouchableOpacity
          style={styles.goButton}
          onPress={handleSubmit}
          disabled={!toLocation}
        >
          <Text style={styles.goButtonText}>GO!</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* タブバー (オプショナル) */}
      <View style={styles.tabBar}>
        <View style={styles.tab}>
          <Icon name="directions" size={24} color="#fff" />
          <Text style={styles.tabText}>経路検索</Text>
        </View>
        <View style={styles.tab}>
          <Icon name="directions-railway" size={24} color="#aaa" />
          <Text style={styles.tabTextInactive}>運行状況</Text>
        </View>
        <View style={styles.tab}>
          <Icon name="place" size={24} color="#aaa" />
          <Text style={styles.tabTextInactive}>駅情報</Text>
        </View>
        <View style={styles.tab}>
          <Icon name="more-horiz" size={24} color="#aaa" />
          <Text style={styles.tabTextInactive}>もっと見る</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.primary,
  },
  header: {
    backgroundColor: '#31505e',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
  },
  headerTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  headerTab: {
    color: '#aaa',
    fontSize: 16,
    paddingVertical: 10,
  },
  headerTabActive: {
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4a9',
    textAlign: 'center',
    marginVertical: 10,
  },
  titleNormal: {
    fontWeight: 'normal',
    color: '#444',
  },
  destinationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  destinationText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4a9',
  },
  destinationSuffix: {
    fontSize: 24,
    color: '#444',
    marginLeft: 5,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularStations: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#444',
  },
  stationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stationTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  stationTagSelected: {
    backgroundColor: theme.colors.primary,
  },
  stationTagText: {
    color: '#444',
  },
  stationTagTextSelected: {
    color: '#fff',
  },
  departureSetting: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  departureLabel: {
    fontSize: 18,
    color: '#3c7',
    marginRight: 10,
  },
  departureOption: {
    fontSize: 18,
    color: '#444',
  },
  searchOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  optionItem: {
    alignItems: 'center',
  },
  goButton: {
    backgroundColor: '#3c7',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goButtonText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#31505e',
    paddingVertical: 8,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#223942',
  },
  tab: {
    alignItems: 'center',
  },
  tabText: {
    color: '#fff',
    fontSize: 12,
  },
  tabTextInactive: {
    color: '#aaa',
    fontSize: 12,
  },
});
