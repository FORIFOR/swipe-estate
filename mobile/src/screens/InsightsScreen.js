import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { JRTheme as theme } from '../theme';

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>インサイト</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>相場情報</Text>
          <Text style={styles.sectionText}>
            不動産相場情報が国交省のデータを元に表示されます。
            現在データを取得中です。
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>エリア分析</Text>
          <Text style={styles.sectionText}>
            選択したエリアの平均賃料や人気度などの分析情報を表示します。
            詳細な分析はエリアを選択すると表示されます。
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>リスク評価</Text>
          <Text style={styles.sectionText}>
            災害リスクや施設情報などの周辺環境評価を確認できます。
            物件を選択すると詳細情報が表示されます。
          </Text>
        </View>
      </ScrollView>
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
  scrollView: {
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.secondary,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  }
});