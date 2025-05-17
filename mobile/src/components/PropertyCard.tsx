// src/components/PropertyCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { JRTheme as theme } from '../theme';
import { PropertyData } from '../services/RealEstateAPI';
import Icon from '@expo/vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface PropertyCardProps {
  property: PropertyData;
  onFavorite: () => void;
  isFavorite: boolean;
  onPress?: () => void;
}

// 数値フォーマット用のヘルパー関数
const fmt = (n?: number | null) => {
  if (typeof n !== 'number' || !isFinite(n)) return '---';
  return new Intl.NumberFormat().format(n);
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavorite, isFavorite, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* カバー画像 */}
      <Image
        source={{ uri: property.cover_url || 'https://via.placeholder.com/400x250?text=No+Image' }}
        style={styles.coverImage}
        resizeMode="cover"
      />
      
      {/* お気に入りボタン */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onFavorite}
      >
        <Icon
          name={isFavorite ? 'favorite' : 'favorite-border'}
          size={28}
          color={isFavorite ? theme.colors.favorite : '#fff'}
        />
      </TouchableOpacity>
      
      {/* 物件情報 */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>{property.title || '物件名未登録'}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{fmt(property.price)}円</Text>
          <Text style={styles.layout}>{property.layout || '---'}</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Icon name="train" size={16} color={theme.colors.text} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {property.station || '最寄り駅不明'} 
              {property.walk_minutes && ` (徒歩${property.walk_minutes}分)`}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="location-on" size={16} color={theme.colors.text} style={styles.infoIcon} />
            <Text style={styles.infoText} numberOfLines={1}>{property.address || '所在地不明'}</Text>
          </View>
          
          <View style={styles.tagsContainer}>
            {property.building_year && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{property.building_year}年築</Text>
              </View>
            )}
            {property.area && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{property.area}㎡</Text>
              </View>
            )}
            {property.structure && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{property.structure}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 15,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: theme.colors.text,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  layout: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.secondary,
  },
  infoContainer: {
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: theme.colors.lightBackground,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.text,
  },
});

export default PropertyCard;
