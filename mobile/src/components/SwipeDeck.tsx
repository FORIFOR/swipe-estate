import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { JRTheme as theme } from '../theme';
import { useFeed } from '../contexts/FeedContext';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

/** helper for safe number formatting */
const fmt = (n?: number | null) => {
  if (typeof n !== 'number' || !isFinite(n)) return '---';
  return new Intl.NumberFormat().format(n);
};

export default function SwipeDeck() {
  const { feed: properties, loading, error, likeProperty } = useFeed();
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

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
    await likeProperty(card.id, dir === 'right');
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );

  const card = properties?.[currentIndex];
  if (!card)
    return (
      <View style={styles.center}>
        <Text style={styles.noMore}>物件がありません</Text>
      </View>
    );

  /* ───── JSX ───── */
  return (
    <View style={styles.container}>
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
          <Text style={styles.title}>{card.title ?? 'タイトル不明'}</Text>
          <Text style={styles.price}>¥{fmt(card.price)}</Text>
          <Text style={styles.detail}>
            {(card.layout ?? '---')}・{card.station ?? '---'}駅 徒歩
            {card.walk_minutes ?? '--'}分
          </Text>
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
          <Text style={styles.addr}>{card.address ?? ''}</Text>
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerType}>
              {card.owner_type === 'direct' ? 'オーナー直接物件' : '仲介業者物件'}:
            </Text>
            <Text style={styles.ownerName}>{card.owner_name ?? ''}</Text>
          </View>
        </View>
      </Animated.View>

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
    </View>
  );
}

/* ───── styles ───── */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    alignItems: 'center',
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  card: {
    position: 'absolute',
    width: width - 40,
    height: 520,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
    top: 40, // 届かせるように上の方向に移動
  },
  image: { 
    flex: 3, 
    borderTopLeftRadius: 16, 
    borderTopRightRadius: 16,
  },
  content: { 
    flex: 2, 
    padding: 18 
  },
  title: { 
    fontSize: 19, 
    fontWeight: 'bold', 
    marginBottom: 6,
    color: '#222',
  },
  price: { 
    fontSize: 18, 
    color: theme.colors.primary, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  detail: { 
    fontSize: 15, 
    color: '#444', 
    marginBottom: 10 
  },
  chips: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginBottom: 8 
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
    marginBottom: 6 
  },
  addr: { 
    fontSize: 13, 
    color: '#555', 
    marginBottom: 6 
  },
  ownerInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 2 
  },
  ownerType: { 
    fontSize: 12, 
    color: '#555', 
    fontWeight: '600' 
  },
  ownerName: { 
    fontSize: 12, 
    color: '#555', 
    marginLeft: 4 
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 40,
    width: '100%',
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
  error: { color: 'red', fontSize: 16 },
  noMore: { fontSize: 18, color: '#666' },
});