import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { JRTheme as theme } from '../theme';

// サンプルアラートデータ
const ALERTS_DATA = [
  {
    id: '1',
    type: 'price_drop',
    title: '価格変更通知',
    message: '渋谷区の2LDKマンションの価格が15%下落しました',
    date: '3日前',
    read: false,
  },
  {
    id: '2',
    type: 'new_listing',
    title: '新着物件',
    message: 'お気に入り条件に合った新着物件が5件追加されました',
    date: '1週間前',
    read: true,
  },
  {
    id: '3',
    type: 'saved_update',
    title: 'お気に入り物件更新',
    message: 'お気に入りに登録した物件の詳細情報が更新されました',
    date: '2週間前',
    read: true,
  },
];

export default function AlertsScreen() {
  const renderAlertItem = ({ item }) => (
    <TouchableOpacity style={[styles.alertItem, item.read ? styles.alertRead : styles.alertUnread]}>
      <View style={styles.alertIconContainer}>
        {item.type === 'price_drop' && <Icon name="trending-down" size={24} color="#FF6B6B" />}
        {item.type === 'new_listing' && <Icon name="fiber-new" size={24} color="#42A86E" />}
        {item.type === 'saved_update' && <Icon name="update" size={24} color="#4285F4" />}
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertMessage}>{item.message}</Text>
        <Text style={styles.alertDate}>{item.date}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>お知らせ</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoBox}>
        <Icon name="notifications-active" size={24} color={theme.colors.primary} style={styles.infoIcon} />
        <Text style={styles.infoText}>価格変更や新着物件の通知を受け取れます。設定から通知条件をカスタマイズできます。</Text>
      </View>
      
      <FlatList
        data={ALERTS_DATA}
        renderItem={renderAlertItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>通知はありません</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  settingsButton: {
    padding: 5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9F7EF',
    padding: 15,
    margin: 15,
    borderRadius: 8,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  listContainer: {
    padding: 15,
  },
  alertItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertUnread: {
    backgroundColor: '#fff',
  },
  alertRead: {
    backgroundColor: '#F9F9F9',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  alertDate: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  }
});