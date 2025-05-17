// src/utils/demoData.ts
import { PropertyData } from '../services/RealEstateAPI';

// 主要駅用デモデータ生成関数
export const generateDemoProperties = (stationName: string): PropertyData[] => {
  console.log(`${stationName}用デモデータを生成します`);

  // 元のデータの形式に合わせてデモデータを作成
  const demoProperties: PropertyData[] = [];

  // 物件の場所情報マッピング
  const stationAreaInfo: { [key: string]: { ward: string, neighborhoods: string[], prefecture: string } } = {
    '渋谷': {
      ward: '渋谷区',
      neighborhoods: ['桑原', '東', '神南', '富ヶ谷'],
      prefecture: '東京都',
    },
    '新宿': {
      ward: '新宿区',
      neighborhoods: ['西新宿', '歌舞伎町', '四谷', '中落合'],
      prefecture: '東京都',
    },
    '恵比寿': {
      ward: '渋谷区',
      neighborhoods: ['恵比寿', '広尾', '恵比寿西', '恵比寿南'],
      prefecture: '東京都',
    },
    '池袋': {
      ward: '豊島区',
      neighborhoods: ['東池袋', '西池袋', '南池袋', '北池袋'],
      prefecture: '東京都',
    },
    '品川': {
      ward: '品川区',
      neighborhoods: ['北品川', '西品川', '東品川', '南品川'],
      prefecture: '東京都',
    },
    '目黒': {
      ward: '目黒区',
      neighborhoods: ['上大崎', '下目黒', '三田', '五反田'],
      prefecture: '東京都',
    },
    '東京': {
      ward: '千代田区',
      neighborhoods: ['丸の内', '大手町', '日本橋', '有楽町'],
      prefecture: '東京都',
    },
    '横浜': {
      ward: '西区',
      neighborhoods: ['みなとみらい', '中区', '山下町', '関内'],
      prefecture: '神奈川県',
    },
    '自由が丘': {
      ward: '目黒区',
      neighborhoods: ['中根', '自由が丘', '緑が丘', '柳小路'],
      prefecture: '東京都',
    },
    '上野': {
      ward: '台東区',
      neighborhoods: ['上野', '東上野', '西上野', '浜松町'],
      prefecture: '東京都',
    },
    '秋葉原': {
      ward: '千代田区',
      neighborhoods: ['外神田', '内神田', '浅草橋', '島屋敷'],
      prefecture: '東京都',
    },
    '銀座': {
      ward: '中央区',
      neighborhoods: ['銀座', '有楽町', '銀座西', '銀座東'],
      prefecture: '東京都',
    },
    '鉄道博物館': {
      ward: '大宗市',
      neighborhoods: ['土呈', '原山', '花園', '西大宗'],
      prefecture: '埼玉県',
    },
    '七里ヶ浜': {
      ward: '鑼刃市',
      neighborhoods: ['七里ヶ浜', '稗村ヶ崎', '長谷', '村岡'],
      prefecture: '神奈川県',
    },
  };

  // 構造と用途のオプション
  const structures = ['ＲＣ', 'ＳＲＣ', '鉄骨', '木造'];
  const purposes = ['住居', '店舗', '事務所', '共同住宅'];
  const cityPlannings = ['商業地域', '住居地域', '軒宅地域', '渓外・渓谷地域'];
  const layouts = ['１Ｒ', '１Ｋ', '２ＬＤＫ', '３ＬＤＫ'];

  // 画像サンプル用URL
  const sampleImages = [
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1549517045-bc93de075e53?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  ];

  // 選択された駅の情報を取得
  const stationInfo = stationAreaInfo[stationName] || {
    ward: '中央区',
    neighborhoods: ['中央', '東', '西', '南'],
    prefecture: '東京都',
  };

  // 求められた駅用に4つのデモ物件を生成
  for (let i = 0; i < 4; i++) {
    const neighborhood = stationInfo.neighborhoods[i % stationInfo.neighborhoods.length];
    const layout = layouts[i % layouts.length];
    const structure = structures[i % structures.length];
    const price = (3 + i * 2) * 10000000; // 3000万、5000万、7000万、9000万
    const area = 30 + i * 15; // 30、45、60、75平米
    const buildingYear = 2010 + i * 2; // 2010、2012、2014、2016年
    const walkMinutes = 3 + i * 2; // 3、5、7、9分

    demoProperties.push({
      id: `${stationName}-${i + 1}`,
      title: `${stationInfo.prefecture} ${stationInfo.ward} ${neighborhood}の${layout} 中古マンション等`,
      price: price,
      cover_url: sampleImages[i % sampleImages.length],
      layout: layout,
      station: stationName,
      walk_minutes: walkMinutes,
      deposit: 1,
      key_money: 1,
      initial_cost: price * 3,
      address: `${stationInfo.prefecture} ${stationInfo.ward} ${neighborhood}`,
      owner_type: 'agency',
      owner_name: structure,
      building_year: buildingYear,
      area: area,
      landType: '中古マンション等',
      structure: structure,
      purpose: purposes[i % purposes.length],
      cityPlanning: cityPlannings[i % cityPlannings.length],
    });
  }

  console.log(`${stationName}用デモデータ ${demoProperties.length}件を生成しました`);
  return demoProperties;
};
