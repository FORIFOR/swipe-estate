import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { JRTheme as theme } from '../theme';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>地図から検索</Text>
      
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=Tokyo,Japan&zoom=12&size=600x400&maptype=roadmap&key=YOUR_API_KEY' }}
          style={styles.mapPlaceholder}
          resizeMode="cover"
        />
        <View style={styles.mapOverlay}>
          <Text style={styles.mapText}>地図ベースの物件検索が利用できるようになる予定です</Text>
        </View>
      </View>
      
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Text style={styles.featureTitle}>エリア選択</Text>
          <Text style={styles.featureDescription}>地図上でエリアを選択して物件を検索できます</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureTitle}>周辺施設</Text>
          <Text style={styles.featureDescription}>駅、スーパー、学校などの位置関係から物件を探せます</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureTitle}>通勤時間</Text>
          <Text style={styles.featureDescription}>通勤・通学時間から最適な物件を見つけられます</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: theme.colors.primary,
  },
  mapContainer: {
    height: 250,
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresContainer: {
    padding: 20,
  },
  featureItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme.colors.secondary,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  }
});