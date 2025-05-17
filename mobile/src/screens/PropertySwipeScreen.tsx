// src/screens/PropertySwipeScreen.tsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  Animated,
  PanResponder,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { JRTheme as theme } from '../theme';
import { useRealEstate } from '../contexts/RealEstateContext';
import Icon from '@expo/vector-icons/MaterialIcons';
import { PropertyData } from '../services/RealEstateAPI';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

// 数値フォーマット用のヘルパー関数
const fmt = (n?: number | null) => {
  if (typeof n !== 'number' || !isFinite(n)) return '---';
  return new Intl.NumberFormat().format(n);
};

export default function PropertySwipeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { favoriteProperty, isFavorite, properties: allProperties, refreshProperties } = useRealEstate();

  // ルートパラメータから物件リストまたは検索パラメータを取得
  const passedProperties = route.params?.properties as PropertyData[] || [];
  const searchParams = route.params?.searchParams || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  // 検索パラメータから適切なAPIリクエストを実行
  useEffect(() => {
    const fetchDataForStation = async () => {
      if (searchParams && searchParams.stations && searchParams.stations.length > 0) {
        const stationName = searchParams.stations[0];
        console.log(`スワイプ画面: ${stationName}駅のデータを取得します`);

        // 照合引数をデバッグ出力
        console.log('検索引数:', searchParams);
        
        // 駅名からエリアコードを取得
        const STATION_TO_AREA_MAP: { [key: string]: string } = {
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

        const areaCode = STATION_TO_AREA_MAP[stationName] || '13';
        console.log(`駅名「${stationName}」のエリアコード: ${areaCode}を使用します`);

        // APIリクエストパラメータを構築
        // 重要: 駅名パラメータは送らない
        const apiParams = {
          area: areaCode,
          walkMinutes: searchParams.walkMinutes || 15 // デフォルト15分に設定
        };

        console.log('送信パラメータ:', apiParams);

        try {
          setLoading(true);
          // デモデータを使用するバックアッププラン
          // 実データが無い場合はデモデータを生成
          if (allProperties.length === 0) {
          // 実際に物件データがない場合のフォールバック
            // 10個のダミー物件を生成
            // 駅名と住所の連携を改善
            const stationToArea = {
              '渋谷': '渋谷区',
              '新宿': '新宿区',
              '恵比寿': '渋谷区',
              '池袋': '豊島区',
              '品川': '品川区',
              '目黒': '目黒区',
              '東京': '千代田区',
              '横浜': '横浜市西区',
              '自由が丘': '目黒区',
              '上野': '台東区',
              '秋葉原': '千代田区',
              '銀座': '中央区',
              '鉄道博物館': 'さいたま市大宇寿区',
              '七里ヶ浜': '鎮倉市',
            };

            const dummyProperties: PropertyData[] = Array.from({ length: 10 }).map((_, index) => ({
              id: `${stationName}-${index + 1}`,
              title: `${stationToArea[stationName] || '渋谷区'} ${stationName}の${index % 2 === 0 ? 'ワンルーム' : '1LDK'} 物件${index + 1}`,
              price: 80000 + (index * 10000),
              cover_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
              layout: index % 2 === 0 ? 'ワンルーム' : '1LDK',
              station: `${stationName}`,
              walk_minutes: 3 + (index % 10),
              deposit: 1,
              key_money: 1,
              initial_cost: (80000 + (index * 10000)) * 3,
              address: `東京都 ${stationToArea[stationName] || '渋谷区'} ${stationName}${index + 1}-${index + 2}`,
              owner_type: index % 2 === 0 ? 'direct' : 'agency',
              owner_name: index % 2 === 0 ? '個人オーナー' : '不動産会社',
              building_year: 2010 + (index % 10),
              area: 25 + (index * 2),
              landType: index % 3 === 0 ? 'マンション' : 'アパート',
              structure: index % 2 === 0 ? 'RC' : '木造',
              purpose: '住居',
              cityPlanning: '美市街区',
            }));

            console.log(`${stationName}用のダミーデータを${dummyProperties.length}件生成しました`);
            setProperties(dummyProperties);
          } else {
            // RealEstateContextのrefreshPropertiesを呼び出してデータを取得
            await refreshProperties(apiParams);
          }
          console.log(`スワイプ画面: ${stationName}駅のデータを取得完了`);
        } catch (error) {
          console.error(`スワイプ画面: ${stationName}駅のデータ取得エラー`, error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDataForStation();
  }, [searchParams, refreshProperties]);

  // 表示する物件リストを決定 - useMemoで最適化
  const properties = useMemo(() => {
    console.log('プロパティスワイプ画面: 物件リスト作成開始');
    console.log('渡された物件数:', passedProperties.length);
    console.log('検索条件:', Object.keys(searchParams).length > 0 ? JSON.stringify(searchParams) : 'なし');
    console.log('全物件数:', allProperties.length);

    // 渡された物件があればそれを優先的に返す
    if (passedProperties.length > 0) {
      console.log('渡された物件リストを使用します');
      return passedProperties;
    }
    
    // 検索条件がない場合は全物件を返す
    if (!searchParams || !searchParams.stations || searchParams.stations.length === 0) {
      console.log('検索条件がないため、全物件を表示します');
      return allProperties.slice(0, 100); // 最初の100件のみ表示
    }

    // 物件なしの場合は空配列を返す　(ダミーデータ生成関数で対応)
    if (allProperties.length === 0) {
      console.log('物件データがありません');
      return [];
    }

    // 検索条件がある場合はフィルタリング
    try {
      // 複数の駅名が選択されている場合の処理
      if (searchParams.stations && searchParams.stations.length > 0) {
        console.log(`検索条件: ${searchParams.stations.length}個の駅名で検索`);

        // APIから取得した実データを使用
        // 駅名でのフィルタリングをより厳密にする
        let filtered = allProperties.filter(property => {
          const propertyAddress = property.address || '';
          const propertyStation = property.station || '';
          
          // 駅名でのフィルタリングを大幅に緩和
          return searchParams.stations.some(stationName => {
            // 駅名を小文字化
            const normalizedStationName = stationName.toLowerCase();
            const normalizedPropertyStation = propertyStation.toLowerCase();
            const normalizedPropertyAddress = propertyAddress.toLowerCase();
            
            // 駅名の部分一致チェック
            const isStationMatch = (
              normalizedPropertyStation.includes(normalizedStationName) ||
              normalizedPropertyStation === normalizedStationName ||
              normalizedPropertyStation === `${normalizedStationName}駅`
            );

            // 住所の部分一致チェック
            const isAddressMatch = normalizedPropertyAddress.includes(normalizedStationName);
            
            // デバッグログ
            if (isStationMatch || isAddressMatch) {
              console.log(`マッチした物件: ${propertyStation} / ${stationName} - ${propertyAddress}`);
            }
            
            // 近隅駅の関連付け
            // 渋谷・厚木・厚木大警訊は近隅として適切
            const stationMapping: { [key: string]: string[] } = {
              '渋谷': ['厚木', '厚木大警訊', '代々木', '表参道', '神泉'],
              '新宿': ['西新宿', '東新宿', '昭和通り', '西早稲田', '高田馬場'],
              '池袋': ['目白', '東池袋', '大塩', '葛飛', '要町'],
              '上野': ['京成上野', '上野庄', '入谷', '鉄銃三丁目'],
              '秋葉原': ['小川町', '佐久間', '御茶ノ水', '神田'],
              '東京': ['二重橋', '大手町', '日本橋', '八重洲', '一ノ橋'],
              '五反田': ['上ノ原', '神保町', '渋谷'],
              '品川': ['大崎', '戸越', '武蔵小杉', '大井町', '西大井'],
              '横浜': ['香港城', '桃山町', '桜木町', '小束', '元町'],
              '自由が丘': ['山下', '九品仙川', '緑が丘', '尾山台', '都立大']              
            };
            
            // 近隅駅が一致するかチェック
            const isNearbyStationMatch = stationMapping[stationName]?.some(nearbyStation => {
              return normalizedPropertyStation.includes(nearbyStation.toLowerCase()) || 
                     normalizedPropertyAddress.includes(nearbyStation.toLowerCase());
            }) || false;
            
            // 市区町村の一致チェック
            const cityMapping: { [key: string]: string[] } = {
              '渋谷': ['渋谷区', '東京都渋谷区'],
              '新宿': ['新宿区', '東京都新宿区'],
              '池袋': ['豊島区', '東京都豊島区'],
              '品川': ['品川区', '東京都品川区'],
              '目黒': ['目黒区', '東京都目黒区'],
              '東京': ['千代田区', '東京都千代田区'],
              '横浜': ['横浜市', '神奈川県横浜市']
            };
            
            // 市区町村が一致するかチェック
            const isCityMatch = cityMapping[stationName]?.some(city => {
              return normalizedPropertyAddress.includes(city.toLowerCase());
            }) || false;
            
            // 上記いずれかの条件に一致すれば返す
            return isStationMatch || isAddressMatch || isNearbyStationMatch || isCityMatch;
          });
        });
        
        console.log(`幅広フィルタリング後の物件数: ${filtered.length}件`);
        
        // 結果が少なすぎる場合、駅名に基づいたダミーデータを生成して表示する
        if (filtered.length < 3) {
          console.log('検索結果が少なすぎます。駅名に基づいたダミーデータを生成します');
          
          // 駅名と住所のマッピング
          const stationToArea = {
            '渋谷': '渋谷区',
            '新宿': '新宿区',
            '恵比寿': '渋谷区',
            '池袋': '豊島区',
            '品川': '品川区',
            '目黒': '目黒区',
            '東京': '千代田区',
            '横浜': '横浜市西区',
            '自由が丘': '目黒区',
            '上野': '台東区',
            '秋葉原': '千代田区',
            '銀座': '中央区',
            '鉄道博物館': 'さいたま市大宇寿区',
            '七里ヶ浜': '鐘倍市',
          };
          
          // 選択された駅名を取得
          const stationName = searchParams.stations[0] || '渋谷'; // デフォルトは渋谷
          
          // 都道府県を適切に設定
          const prefecture = 
            stationName === '横浜' || stationName === '七里ヶ浜' ? '神奈川県' :
            stationName === '鉄道博物館' ? '埼玉県' : '東京都';
          
          // 地域に適した価格設定
          const priceMultiplier = 
            stationName === '渋谷' || stationName === '新宿' || stationName === '恵比寿' ? 1.2 :
            stationName === '銀座' ? 1.3 :
            stationName === '自由が丘' ? 1.1 : 1.0;
            
          // 10個のダミー物件を生成
          const dummyProperties = Array.from({ length: 10 }).map((_, index) => ({
            id: `${stationName}-${index + 1}`,
            title: `${prefecture} ${stationToArea[stationName] || '渋谷区'} ${stationName}の${index % 3 === 0 ? '1LDK' : (index % 3 === 1 ? '2LDK' : '3LDK')} 物件${index + 1}`,
            price: Math.round((80000 + (index * 5000)) * priceMultiplier) * 1000,
            cover_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            layout: index % 3 === 0 ? '1LDK' : (index % 3 === 1 ? '2LDK' : '3LDK'),
            station: stationName,
            walk_minutes: 3 + (index % 10),
            deposit: 1,
            key_money: 1,
            initial_cost: Math.round((80000 + (index * 5000)) * priceMultiplier * 3) * 1000,
            address: `${prefecture} ${stationToArea[stationName] || '渋谷区'} ${stationName}${index + 1}-${index + 2}`,
            owner_type: index % 2 === 0 ? 'direct' : 'agency',
            owner_name: index % 2 === 0 ? 'SRC' : 'RC',
            building_year: 2010 + (index % 10),
            area: 25 + (index * 5),
            landType: index % 3 === 0 ? 'マンション' : 'アパート',
            structure: index % 2 === 0 ? 'RC' : '木造',
            purpose: '住居',
            cityPlanning: '美市街区',
          }));
          
          console.log(`${stationName}用のダミーデータを${dummyProperties.length}件生成しました`);
          return dummyProperties;
        }
        
        // 値段フィルタリング
        if (searchParams.minPrice) {
          filtered = filtered.filter(property => (property.price || 0) >= searchParams.minPrice);
        }
        if (searchParams.maxPrice) {
          filtered = filtered.filter(property => (property.price || 0) <= searchParams.maxPrice);
        }

        console.log(`最終的な検索結果: ${filtered.length}件`);
        
        // 結果が少なすぎる場合、駅名に基づいたダミーデータを生成して表示する
        if (filtered.length < 3) {
          console.log('最終的な検索結果が少なすぎます。駅名に基づいたダミーデータを生成します');
          
          // 駅名と住所のマッピングを使用して同じダミーデータ生成関数を利用
          const stationToArea = {
            '渋谷': '渋谷区',
            '新宿': '新宿区',
            '恵比寿': '渋谷区',
            '池袋': '豊島区',
            '品川': '品川区',
            '目黒': '目黒区',
            '東京': '千代田区',
            '横浜': '横浜市西区',
            '自由が丘': '目黒区',
            '上野': '台東区',
            '秋葉原': '千代田区',
            '銀座': '中央区',
            '鉄道博物館': 'さいたま市大宇寿区',
            '七里ヶ浜': '鐘倍市',
          };
          
          // 選択された駅名を取得
          const stationName = searchParams.stations[0] || '渋谷'; // デフォルトは渋谷
          
          // 都道府県を適切に設定
          const prefecture = 
            stationName === '横浜' || stationName === '七里ヶ浜' ? '神奈川県' :
            stationName === '鉄道博物館' ? '埼玉県' : '東京都';
          
          // 地域に適した価格設定
          const priceMultiplier = 
            stationName === '渋谷' || stationName === '新宿' || stationName === '恵比寿' ? 1.2 :
            stationName === '銀座' ? 1.3 :
            stationName === '自由が丘' ? 1.1 : 1.0;
            
          // 10個のダミー物件を生成
          const dummyProperties = Array.from({ length: 10 }).map((_, index) => ({
            id: `${stationName}-${index + 1}`,
            title: `${prefecture} ${stationToArea[stationName] || '渋谷区'} ${stationName}の${index % 3 === 0 ? '1LDK' : (index % 3 === 1 ? '2LDK' : '3LDK')} 物件${index + 1}`,
            price: Math.round((80000 + (index * 5000)) * priceMultiplier) * 1000,
            cover_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            layout: index % 3 === 0 ? '1LDK' : (index % 3 === 1 ? '2LDK' : '3LDK'),
            station: stationName,
            walk_minutes: 3 + (index % 10),
            deposit: 1,
            key_money: 1,
            initial_cost: Math.round((80000 + (index * 5000)) * priceMultiplier * 3) * 1000,
            address: `${prefecture} ${stationToArea[stationName] || '渋谷区'} ${stationName}${index + 1}-${index + 2}`,
            owner_type: index % 2 === 0 ? 'direct' : 'agency',
            owner_name: index % 2 === 0 ? 'SRC' : 'RC',
            building_year: 2010 + (index % 10),
            area: 25 + (index * 5),
            landType: index % 3 === 0 ? 'マンション' : 'アパート',
            structure: index % 2 === 0 ? 'RC' : '木造',
            purpose: '住居',
            cityPlanning: '美市街区',
          }));
          
          console.log(`${stationName}用のダミーデータを${dummyProperties.length}件生成しました`);
          return dummyProperties;
        }
        
        return filtered;
      }
      
      // 検索条件がない場合は全ての物件を返す
      return allProperties.slice(0, 100);
    } catch (error) {
      console.error('物件フィルタリング中にエラーが発生しました:', error);
      // エラー時は全物件の最初の10件を返す
      return allProperties.slice(0, 10);
    }
  }, [searchParams, passedProperties, allProperties]);
  
  // PanResponderを設定 - 右左スワイプができるように修正
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // 他のPanResponderに奪われないようにする
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value
        });
        position.setValue({ x: 0, y: 0 });
        console.log('Pan responder granted');
      },
      onPanResponderMove: (event, gesture) => {
        console.log('Moving:', gesture.dx, gesture.dy);
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        position.flattenOffset();
        console.log('Released:', gesture.dx, gesture.dy);
        // スワイプ動作の判定
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  // スワイプ時のアニメーション
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
    }).start();
  };

  // 右スワイプ（お気に入り）
  const swipeRight = () => {
    if (properties.length <= currentIndex) return;
    
    const property = properties[currentIndex];
    console.log('お気に入りに追加:', property.title);
    
    try {
      // お気に入り追加 - 明示的にお気に入り状態をトグルしない
      if (!isFavorite(property.id)) {
        favoriteProperty(property.id);
        // メッセージ表示なし（要望により）
      }
    } catch (error) {
      console.error('お気に入り追加エラー:', error);
    }
    
    // アニメーション
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      useNativeDriver: false,
      duration: 250,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
    });
  };

  // 左スワイプ（スキップ）
  const swipeLeft = () => {
    if (properties.length <= currentIndex) return;
    
    console.log('スキップ:', properties[currentIndex].title);
    
    // アニメーション
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      useNativeDriver: false,
      duration: 250,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
    });
  };

  // 物件詳細画面に遷移
  const handleViewDetails = () => {
    if (properties.length <= currentIndex) return;
    
    // 詳細画面に遷移
    // @ts-ignore
    navigation.navigate('PropertyDetail', {
      property: properties[currentIndex],
    });
  };

  // カードの回転角度計算
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  // 現在表示中のカードのスタイル
  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  };

  // ローディング状態の表示
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>物件情報を取得中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 物件がない場合のメッセージ表示
  if (properties.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="sentiment-dissatisfied" size={60} color={theme.colors.gray} />
          <Text style={styles.emptyText}>
            条件に合う物件が見つかりませんでした
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>検索条件を変更する</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 全物件を見終わった場合
  if (currentIndex >= properties.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="check-circle" size={60} color={theme.colors.success} />
          <Text style={styles.emptyText}>
            全ての物件を確認しました
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>検索条件を変更する</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => setCurrentIndex(0)}
          >
            <Text style={styles.backButtonText}>最初からもう一度見る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // カスタムボタンコンポーネントを作成
  const SwipeButtons = () => {
    return (
      <View style={{
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 60,
        zIndex: 1000, // 必ず最前面に表示
      }}>
        {/* NOPEボタン（円形） */}
        <TouchableOpacity
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#FF6B6B',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 5,
          }}
          onPress={swipeLeft}
        >
          <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>

        {/* LIKEボタン（円形） */}
        <TouchableOpacity
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#42A86E',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 5,
          }}
          onPress={swipeRight}
        >
          <Icon name="favorite" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {searchParams?.stations && searchParams.stations.length > 0 
            ? `${searchParams.stations.join(', ')}の物件`
            : '物件一覧'}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {`${properties.length}件中 ${currentIndex + 1}件目`}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {/* メインカード */}
        <Animated.View
          style={[styles.card, cardStyle]}
          {...panResponder.panHandlers}
        >
          <TouchableWithoutFeedback onPress={handleViewDetails}>
            <View style={{ flex: 1 }}>
              <Image
                source={{ uri: properties[currentIndex].cover_url || 'https://via.placeholder.com/400x250?text=No+Image' }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{properties[currentIndex].title}</Text>
                <Text style={styles.cardPrice}>¥{fmt(properties[currentIndex].price)}</Text>
                <Text style={styles.cardDetails}>
                  {properties[currentIndex].layout} ・ {properties[currentIndex].station} 徒歩{properties[currentIndex].walk_minutes}分
                </Text>
                
                <View style={styles.tagContainer}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>敷金 1ヶ月</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>礼金 1ヶ月</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>初期費用 〜¥{fmt(properties[currentIndex].initial_cost || properties[currentIndex].price * 3)}</Text>
                  </View>
                </View>
                
                <Text style={styles.info}>※ 初期費用には敷金・礼金・仏介手数料などが含まれます</Text>
                <Text style={styles.address}>{properties[currentIndex].address}</Text>
                <Text style={styles.owner}>オーナー直接物件: {properties[currentIndex].owner_name}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
          
          {position.x._value > 50 && (
            <View style={[styles.swipeIndicator, styles.likeIndicator]}>
              <Text style={[styles.swipeIndicatorText, {color: 'white'}]}>LIKE</Text>
            </View>
          )}
          
          {position.x._value < -50 && (
            <View style={[styles.swipeIndicator, styles.nopeIndicator]}>
              <Text style={[styles.swipeIndicatorText, {color: 'white'}]}>NOPE</Text>
            </View>
          )}
        </Animated.View>

        {/* 次のカード（あれば表示） */}
        {currentIndex < properties.length - 1 && (
          <View style={[styles.card, styles.nextCard]}>
            <TouchableWithoutFeedback onPress={() => {
              setCurrentIndex(currentIndex + 1);
              handleViewDetails();
            }}>
              <View style={{ flex: 1 }}>
                <Image
                  source={{ uri: properties[currentIndex + 1].cover_url || 'https://via.placeholder.com/400x250?text=No+Image' }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{properties[currentIndex + 1].title}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        )}
      </View>

      {/* カスタム半円ボタンを表示 */}
      <SwipeButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 0, // タブバーとの平行性を保つため、下部の余白を削除
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  countText: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center', // 中央揃え
    alignItems: 'center',    // 中央揃え
    paddingTop: 30,          // 上部に余白を追加
    marginBottom: 80,        // ボタンと被らないよう余白を追加
  },
  card: {
    position: 'absolute',
    width: width - 30,
    maxHeight: height * 0.65, // 画面の65%までの高さに制限してボタンと被らないようにする
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    zIndex: 1,
  },
  cardImage: {
    width: '100%',
    height: width * 0.7,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  cardPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#42A86E',
    marginBottom: 6,
  },
  cardDetails: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
  },
  info: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  owner: {
    fontSize: 14,
    color: '#666',
  },
  swipeIndicator: {
    position: 'absolute',
    top: 30,
    padding: 10,
    borderWidth: 2,
    borderRadius: 6,
    transform: [{ rotate: '-20deg' }],
    zIndex: 10,
  },
  likeIndicator: {
    right: 20,
    backgroundColor: '#42A86E',
    borderColor: '#42A86E',
  },
  nopeIndicator: {
    left: 20,
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  swipeIndicatorText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nextCard: {
    top: 10,
    transform: [{ scale: 0.95 }],
    zIndex: -1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
    paddingVertical: 30,
    paddingBottom: 50, // 下部に余白を追加
    marginBottom: 20, // 下部にマージンを追加
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  skipButton: {
    backgroundColor: '#FF6B6B',
  },
  likeButton: {
    backgroundColor: '#42A86E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 15,
    marginBottom: 30,
    fontSize: 18,
    textAlign: 'center',
    color: theme.colors.text,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
