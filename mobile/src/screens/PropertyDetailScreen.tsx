// src/screens/PropertyDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { JRTheme as theme } from '../theme';
import Icon from '@expo/vector-icons/MaterialIcons';
import { PropertyData } from '../services/RealEstateAPI';
import { useRealEstate } from '../contexts/RealEstateContext';

const { width } = Dimensions.get('window');

// 数値フォーマット用のヘルパー関数
const fmt = (n?: number | null) => {
  if (typeof n !== 'number' || !isFinite(n)) return '---';
  return new Intl.NumberFormat().format(n);
};

export default function PropertyDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { favoriteProperty, isFavorite } = useRealEstate();
  
  // ルートパラメータから物件情報を取得
  const property = route.params?.property as PropertyData;
  
  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color={theme.colors.warning} />
          <Text style={styles.errorText}>物件情報が見つかりません</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const isPropertyFavorite = isFavorite ? isFavorite(property.id) : false;
  
  // デバッグ用の出力
  console.log(`物件ID ${property.id} はお気に入り${isPropertyFavorite ? 'です' : 'ではありません'}`);
  
  // お気に入りボタンのハンドラー
  const handleToggleFavorite = () => {
    if (favoriteProperty) {
      favoriteProperty(property.id);
      // お気に入りに登録しましたというメッセージは表示しないように要望に従う
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ヘッダー部分 */}
      <View style={styles.safeHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, isPropertyFavorite ? styles.activeHeaderButton : {}]}
          onPress={handleToggleFavorite}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Icon
            name={isPropertyFavorite ? "favorite" : "favorite-border"}
            size={24}
            color={isPropertyFavorite ? theme.colors.favorite : "#fff"}
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* カバー画像 */}
        <Image
          source={{ uri: property.cover_url || 'https://via.placeholder.com/400x250?text=No+Image' }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        
        {/* 物件情報 */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{property.title || '物件名未登録'}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>価格</Text>
            <Text style={styles.price}>{fmt(property.price)}円</Text>
          </View>
          
          <View style={styles.divider} />
          
          {/* 基本情報 */}
          <Text style={styles.sectionTitle}>基本情報</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>間取り</Text>
              <Text style={styles.infoValue}>{property.layout || '---'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>面積</Text>
              <Text style={styles.infoValue}>{property.area ? `${property.area}㎡` : '---'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>駅徒歩</Text>
              <Text style={styles.infoValue}>
                {property.walk_minutes ? `${property.walk_minutes}分` : '---'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>築年数</Text>
              <Text style={styles.infoValue}>
                {property.building_year ? `${property.building_year}年` : '---'}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* 所在地 */}
          <Text style={styles.sectionTitle}>所在地・交通</Text>
          
          <View style={styles.infoRow}>
            <Icon name="location-on" size={20} color={theme.colors.primary} style={styles.infoIcon} />
            <Text style={styles.addressText}>{property.address || '所在地不明'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="train" size={20} color={theme.colors.primary} style={styles.infoIcon} />
            <Text style={styles.stationText}>
              {property.station || '最寄り駅不明'}
              {property.walk_minutes && ` (徒歩${property.walk_minutes}分)`}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          {/* 建物・費用情報 */}
          <Text style={styles.sectionTitle}>建物・費用情報</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>構造</Text>
              <Text style={styles.detailValue}>{property.structure || '---'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>用途地域</Text>
              <Text style={styles.detailValue}>{property.cityPlanning || '---'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>敷金</Text>
              <Text style={styles.detailValue}>
                {property.deposit ? `${property.deposit}ヶ月分` : '---'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>礼金</Text>
              <Text style={styles.detailValue}>
                {property.key_money ? `${property.key_money}ヶ月分` : '---'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>初期費用目安</Text>
              <Text style={styles.detailValue}>
                {property.initial_cost ? `${fmt(property.initial_cost)}円` : '---'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>種別</Text>
              <Text style={styles.detailValue}>{property.landType || '---'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* 物件所有者 */}
          <Text style={styles.sectionTitle}>物件所有者</Text>
          
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerType}>
              {property.owner_type === 'individual' ? '個人所有者' : '仲介業者'}
            </Text>
            <Text style={styles.ownerName}>{property.owner_name || '---'}</Text>
          </View>
          
          {/* お問い合わせボタン群 */}
          <View style={styles.contactButtonsContainer}>
            <Text style={styles.contactTitle}>お問い合わせ</Text>
            <Text style={styles.contactDescription}>下記のお問い合わせは当社の不動産エージェントから直接ご連絡いたします</Text>
            
            <TouchableOpacity style={styles.contactButton} onPress={() => alert('物件見学のお問い合わせを受付ました。担当者から連絡いたします。')}>
              <Icon name="home" size={20} color="#fff" style={styles.contactButtonIcon} />
              <Text style={styles.contactButtonText}>物件を実際に見たい</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton} onPress={() => alert('初期費用の詳細についてお問い合わせを受付ました。担当者から連絡いたします。')}>
              <Icon name="attach-money" size={20} color="#fff" style={styles.contactButtonIcon} />
              <Text style={styles.contactButtonText}>初期費用を知りたい</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton} onPress={() => alert('最新の空室状況についてお問い合わせを受付ました。担当者から連絡いたします。')}>
              <Icon name="event-available" size={20} color="#fff" style={styles.contactButtonIcon} />
              <Text style={styles.contactButtonText}>最新の空室状況を知りたい</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 15,
  },
  activeHeaderButton: {
    backgroundColor: 'rgba(255,80,80,0.8)',
  },
  headerButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  scrollView: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: theme.colors.text,
    marginRight: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  infoItem: {
    width: (width - 40) / 2,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  addressText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  stationText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  detailItem: {
    width: (width - 40) / 2,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
  },
  ownerInfo: {
    marginBottom: 20,
  },
  ownerType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  contactButtonsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 10,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  contactButtonIcon: {
    marginRight: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
