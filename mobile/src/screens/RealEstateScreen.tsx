import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  PanResponder,
  RefreshControl,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { JRTheme as theme } from '../theme';
import { useRealEstate } from '../contexts/RealEstateContext';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

/** helper for safe number formatting */
const fmt = (n?: number | null) => {
  if (typeof n !== 'number' || !isFinite(n)) return '---';
  return new Intl.NumberFormat().format(n);
};

export default function RealEstateScreen() {
  const { properties, loading, error, favoriteProperty, refreshProperties } = useRealEstate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const position = React.useRef(new Animated.ValueXY()).current;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProperties();
    setRefreshing(false);
  }, [refreshProperties]);

  /* ───── swipe helpers ───── */
  const rotateCard = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE_THRESHOLD) forceSwipe('right');
      else if (g.dx < -SWIPE_THRESHOLD) forceSwipe('left');
      else resetPosition();
    },
  });

  const forceSwipe = (dir: 'left' | 'right') => {
    Animated.timing(position, {
      toValue: { x: dir === 'right' ? width : -width, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(dir));
  };

  const onSwipeComplete = async (dir: 'left' | 'right') => {
    const card = properties[currentIndex];
    if (!card) return;
    await favoriteProperty(card.id, dir === 'right');
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((p) => p + 1);
  };

  const resetPosition = () =>
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();

  /* ───── early returns ───── */
  if (loading)
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>不動産物件情報を読み込み中...</Text>
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>再読み込み</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  const card = properties?.[currentIndex];
  if (!card)
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.noMore}>表示できる物件がありません</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>物件を再取得</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  /* ───── JSX ───── */
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.headerTitle}>おすすめ物件</Text>
        <Text style={styles.headerSubtitle}>
          API連携で取得した最新の物件情報を表示しています
        </Text>
        
        <View style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate: rotateCard },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Image source={{ uri: card.cover_url }} style={styles.image} />
            <View style={styles.content}>
              <Text style={styles.title}>{card.title}</Text>
              <Text style={styles.price}>¥{fmt(card.price)}</Text>
              <Text style={styles.detail}>
                {(card.layout ?? '---')}・{card.station ?? '---'}駅 徒歩
                {card.walk_minutes ?? '--'}分
              </Text>
              
              <View style={styles.additionalInfo}>
                <Text style={styles.infoLabel}>建築年:</Text>
                <Text style={styles.infoValue}>{card.building_year}年</Text>
                <Text style={styles.infoLabel}>面積:</Text>
                <Text style={styles.infoValue}>{card.area}㎡</Text>
              </View>
              
              <View style={styles.chips}>
                {card.deposit != null && (
                  <Text style={styles.chip}>敷金 {card.deposit}ヶ月</Text>
                )}
                {card.key_money != null && (
                  <Text style={styles.chip}>礼金 {card.key_money}ヶ月</Text>
                )}
                {card.initial_cost != null && (
                  <Text style={styles.chip}>初期費用 ~¥{fmt(card.initial_cost)}</Text>
                )}
              </View>
              
              <Text style={styles.initialCostNote}>※初期費用には敷金・礼金・仲介手数料・前家賃などが含まれます</Text>
              <Text style={styles.address}>{card.address ?? ''}</Text>
              
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerType}>
                  {card.owner_type === 'direct' ? 'オーナー直接物件' : '仲介業者物件'}:
                </Text>
                <Text style={styles.ownerName}>{card.owner_name ?? ''}</Text>
              </View>
              
              <View style={styles.propertyDetails}>
                <Text style={styles.propertyDetail}>構造: {card.structure}</Text>
                <Text style={styles.propertyDetail}>用途: {card.purpose}</Text>
                <Text style={styles.propertyDetail}>都市計画: {card.cityPlanning}</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <View style={styles.navigation}>
          <Text style={styles.pageIndicator}>
            {currentIndex + 1} / {properties.length}
          </Text>
        </View>

        {/* like / dislike buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, styles.no]}
            onPress={() => forceSwipe('left')}
          >
            <Text style={styles.btnTxt}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.yes]}
            onPress={() => forceSwipe('right')}
          >
            <Text style={styles.btnTxt}>♥</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───── styles ───── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  cardContainer: {
    height: 520,
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  card: {
    width: width - 40,
    height: 520,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  image: {
    height: 220,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  price: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  detail: {
    fontSize: 15,
    color: '#444',
    marginBottom: 12,
  },
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    fontSize: 13,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.surfaceVariant,
    color: '#333',
    marginBottom: 5,
  },
  initialCostNote: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
    marginBottom: 6,
  },
  address: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  ownerType: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  ownerName: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },
  propertyDetails: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  propertyDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  navigation: {
    marginBottom: 16,
  },
  pageIndicator: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  btn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  no: { backgroundColor: '#FF6B6B' },
  yes: { backgroundColor: theme.colors.primary },
  btnTxt: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  error: { color: 'red', fontSize: 16, marginBottom: 20 },
  noMore: { fontSize: 18, color: '#666', marginBottom: 20 },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
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
});
