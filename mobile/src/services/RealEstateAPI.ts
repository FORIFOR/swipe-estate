// RealEstateAPI.ts - 国土交通省 不動産情報ライブラリAPIクライアント
// axios依存を避け、fetch APIを使用

// APIキー（実際の環境では.envファイルから読み込むことをお勧めします）
const API_KEY = '977b71414b0d4944ab8ec9c5426972bf'; // 国土交通省不動産ライブラリ用APIキー
const BASE_URL = 'https://www.reinfolib.mlit.go.jp/ex-api/external';

// APIリクエストヘッダー
const headers = {
  'Ocp-Apim-Subscription-Key': API_KEY,
  'Content-Type': 'application/json',
};

// APIエンドポイント
const endpoints = {
  propertyPrices: '/XIT001', // 不動産価格（取引価格・成約価格）情報
  municipalities: '/XIT002', // 都道府県内市区町村一覧
};

// プロパティ型定義
export type PropertyData = {
  id: string; // 一意のID
  title: string; // タイトル
  price: number; // 価格
  cover_url: string; // 画像URL
  layout: string; // 間取り
  station: string; // 最寄り駅
  walk_minutes: number; // 駅からの徒歩分数
  deposit: number; // 敷金（賃貸の場合）
  key_money: number; // 礼金（賃貸の場合）
  initial_cost: number; // 初期費用概算
  address: string; // 住所
  owner_type: 'direct' | 'agency'; // 所有者タイプ: direct=所有者直接, agency=仲介業者
  owner_name: string; // 所有者または仲介業者名
  building_year: number; // 築年数
  area: number; // 面積（㎡）
  landType: string; // 土地の種類
  structure: string; // 構造
  purpose: string; // 用途
  cityPlanning: string; // 都市計画
};

// APIクライアント
class RealEstateAPI {
  // 不動産物件情報を取得する関数
  async getProperties(params?: { 
    prefCode?: string, 
    cityCode?: string, 
    year?: string, 
    quarter?: string,
    station?: string,
    area?: string,
    walkMinutes?: number,
  }): Promise<PropertyData[]> {
    try {
      console.log('パラメータ確認 (RealEstateAPI.getProperties):', {
        area: params?.area,
        station: params?.station,
        prefCode: params?.prefCode,
        cityCode: params?.cityCode
      });

      // windowがglobalに定義されていない場合、グローバルオブジェクトを取得
      const globalObj = typeof window !== 'undefined' ? window : global;
      
      // 強制テストモードが有効な場合はテストデータを返さない
      if ((globalObj as any).FORCE_TEST_MODE) {
        console.log('強制テストモードが有効ですが、実際のAPIを使用します');
      }

      // 国交省APIへのリクエストを準備
      console.log('国土交通省不動産APIを呼び出します');
      
// 駅名からエリアコードへのマッピング
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

      // 検索条件の設定
      const queryParams = new URLSearchParams();
      
      // 地域コード・都道府県（必須）
      if (params?.area) {
        // 指定された地域コードを使用 - 直接指定された場合は最優先
        console.log(`検索パラメータから地域コードを使用: ${params.area}`);
        queryParams.append('area', params.area);
      } else if (params?.station) {
        // 駅名から地域コードを判定
        let areaCode = STATION_TO_AREA_MAP[params.station] || '13'; // マッピングになければデフォルトは東京(13)
        
        // ログ出力を追加
        console.log(`駅名「${params.station}」のエリアコード: ${areaCode}を使用します`);
        queryParams.append('area', areaCode);
      } else if (params?.prefCode) {
        // 都道府県コードが指定されている場合
        queryParams.append('area', params.prefCode);
      } else {
        // 全パラメータが指定されていない場合はデフォルト値を使用
        queryParams.append('area', '13'); // 東京都（13）をデフォルトに
      }
      
      // 市区町村（任意）
      if (params?.cityCode) queryParams.append('city', params.cityCode);
      
      // 年度（必須）
      queryParams.append('year', params?.year || '2024'); // 未指定の場合は2024年をデフォルトに
      
      // 四半期（必須）
      queryParams.append('quarter', params?.quarter || '1'); // 未指定の場合は第1四半期をデフォルトに
      
      // 駅徒歩分数の追加 - 指定された場合のみ
      if (params?.walkMinutes) {
        queryParams.append('walk_minutes', params.walkMinutes.toString());
        console.log(`駅徒歩${params.walkMinutes}分以内を指定`);
      }
      
      // 駅名はクライアント側で対応するため、APIには送らない
      // Note: APIが駅名パラメータをサポートしていないため、クライアント側でフィルタリングする
      if (params?.station) {
        // APIが対応していないので station パラメータは追加しない
        // ログを見ると「駅名検索条件を追加: station=渋谷」という記録があり、これが問題の原因になっている
        console.log(`駅名「${params.station}」の検索条件はクライアント側で処理します（APIには送信しません）`);
        
        // 駅名パラメータが追加されている可能性があるので、デバッグコードで確認
        console.log('パラメータに駅名が追加されていないことを確認:', queryParams.toString());

        // リクエストパラメータから駅名を削除（もし追加されていた場合）
        if (queryParams.has('station')) {
          console.log('⚠️ station パラメータが追加されていたため削除します');
          queryParams.delete('station');
        }
        // 「駅名検索条件を追加」ログが出ているので、以前はここでstationパラメータを追加していた可能性が高い
        // この問題を修正するために、stationパラメータは全く追加しないようにします
        // もしここに queryParams.append('station', params.station) があれば、それがエラーの原因でした
      }
      
      console.log('リクエストパラメータ確認:', queryParams.toString());
      
      // エンドポイントを選択 - 取引価格情報の場合はXIT001
      const endpoint = `${BASE_URL}${endpoints.propertyPrices}`;
      const url = `${endpoint}?${queryParams.toString()}`;
      
      console.log('リクエストURL:', url);
      
      try {
        // API呼び出し
        const response = await fetch(url, { 
          method: 'GET',
          headers: headers as HeadersInit
        });
        
        // レスポンス確認
        if (!response.ok) {
          console.error(`APIリクエスト失敗: ${response.status} ${response.statusText}`);
          let errorMessage = '';
          try {
            // JSON形式のエラーメッセージを解析
            const errorJson = await response.json();
            errorMessage = errorJson.message || `サーバーエラー (${response.status})`;
            console.error('APIエラーレスポンス:', errorJson);
          } catch (e) {
            // JSONでない場合はテキストを取得
            const errorText = await response.text();
            errorMessage = errorText || `サーバーエラー (${response.status})`;
            console.error('APIエラーレスポンス:', errorText);
          }
          
          // 404の場合はデータが存在しないだけなので空配列を返す
          if (response.status === 404) {
            console.log('指定された条件に合うデータが存在しません。空の配列を返します');
            return [];
          }
          
          throw new Error(errorMessage || `API request failed with status ${response.status}`);
        }
        
        // レスポンスをJSONとして解析
        const responseData = await response.json();
        
        // レスポンスがオブジェクトか確認
        if (!responseData) {
          console.error('APIレスポンスが空です');
          return [];
        }
        
        // レスポンス構造を確認
        console.log('APIレスポンス構造:', Object.keys(responseData));
        
        // レスポンスから実際のデータ配列を取得（通常はdata、items、resultsなどのフィールドに格納）
        let dataArray = [];
        
        // 国土交通省APIの場合、特定のキーにデータ配列が格納されている可能性がある
        if (responseData.data && Array.isArray(responseData.data)) {
          dataArray = responseData.data;
        } else if (responseData.items && Array.isArray(responseData.items)) {
          dataArray = responseData.items;
        } else if (responseData.results && Array.isArray(responseData.results)) {
          dataArray = responseData.results;
        } else if (responseData.records && Array.isArray(responseData.records)) {
          dataArray = responseData.records;
        } else if (responseData.property && Array.isArray(responseData.property)) {
          dataArray = responseData.property;
        } else if (Array.isArray(responseData)) {
          // レスポンス自体が配列の場合
          dataArray = responseData;
        } else {
          // 上記以外のケースでは、responseDataをそのまま使用
          // オブジェクトの場合は配列に変換
          const properties = [];
          if (typeof responseData === 'object' && responseData !== null) {
            // オブジェクトの各プロパティを調査し、配列の場合はそれを使用
            for (const key in responseData) {
              if (Array.isArray(responseData[key])) {
                dataArray = responseData[key];
                break;
              }
            }
            
            // まだ配列が見つからない場合は、オブジェクト全体を1つの要素として扱う
            if (dataArray.length === 0) {
              properties.push(this.convertToPropertyData(responseData, 0));
              return properties;
            }
          }
        }
        
        console.log(`取得した物件データ: ${dataArray.length}件`);
        
        // データを変換
        return this.formatAPIResponse(dataArray);
      } catch (error) {
        console.error('国土交通省API呼び出しエラー:', error);
        // エラー時は空の配列を返す
        return [];
      }
    } catch (error) {
      console.error('不動産物件情報の取得に失敗しました:', error);
      // エラー時は空の配列を返す
      return [];
    }
  }

  // 単一オブジェクトをPropertyDataに変換
  private convertToPropertyData(item: any, index: number): PropertyData {
    try {
      // 駅名と距離を改善する
      let station = '不明';
      let walkMinutes = 5;
      
      // 最寄り駅情報があれば使用
      if (item.Station && item.Station !== '') {
        station = item.Station;
      } else if (item.Prefecture) {
        // 都道府県から説明的な刀駅名を設定
        if (item.Prefecture.includes('東京')) {
          station = item.Municipality ? item.Municipality.replace(/市$|区$|町$|村$/, '') : '東京';
        } else if (item.Prefecture.includes('神奈川')) {
          station = item.Municipality ? item.Municipality.replace(/市$|区$|町$|村$/, '') : '横浜';
        } else if (item.Prefecture.includes('埼玉')) {
          station = item.Municipality ? item.Municipality.replace(/市$|区$|町$|村$/, '') : '大宮';
        } else {
          station = item.Municipality ? item.Municipality.replace(/市$|区$|町$|村$/, '') : '不明';
        }
      }
      // 徒歩時間情報があれば使用
      if (item.TimeToStation && item.TimeToStation !== '') {
        walkMinutes = this.extractNumber(item.TimeToStation);
      }
      
      // 住所から地域名を抽出して駅名の代わりに使用
      let address = '';
      if (item.Prefecture && item.Municipality) {
        address = `${item.Prefecture || ''} ${item.Municipality || ''} ${item.DistrictName || ''}`;
        
        // 駅名が不明の場合、市区町村名を駅名代わりに設定
        if (station === '不明' && item.Municipality) {
          station = item.Municipality.replace(/市$|区$|町$|村$/, '');
        }
      }
      
      // 物件情報を整形して返す
      return {
        id: item.id || item.No || String(index),
        title: item.title || this.generateTitle(item),
        price: this.extractNumber(item.price || item.TradePrice || 0),
        cover_url: item.cover_url || item.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        layout: item.layout || item.FloorPlan || 'ワンルーム',
        station: station,
        walk_minutes: walkMinutes,
        deposit: this.extractNumber(item.deposit || 1),
        key_money: this.extractNumber(item.key_money || 1),
        initial_cost: this.extractNumber(item.initial_cost || (item.TradePrice ? this.extractNumber(item.TradePrice) * 3 : 0)),
        address: address,
        owner_type: item.owner_type || 'agency',
        owner_name: item.owner_name || item.Structure || '不動産仲介',
        building_year: this.extractNumber(item.building_year || item.BuildingYear || 2000),
        area: this.extractNumber(item.area || item.Area || 50),
        landType: item.landType || item.Type || 'マンション',
        structure: item.structure || item.Structure || 'RC',
        purpose: item.purpose || item.Purpose || '住居',
        cityPlanning: item.cityPlanning || item.CityPlanning || '設定なし',
      };
    } catch (e) {
      console.error('物件データ変換エラー:', e);
      // 最低限の情報だけで作成
      return {
        id: String(index),
        title: `物件 #${index + 1}`,
        price: 150000,
        cover_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        layout: 'ワンルーム',
        station: '不明',
        walk_minutes: 5,
        deposit: 1,
        key_money: 1,
        initial_cost: 450000,
        address: '不明',
        owner_type: 'agency',
        owner_name: '不動産仲介',
        building_year: 2020,
        area: 50,
        landType: 'マンション',
        structure: 'RC',
        purpose: '住居',
        cityPlanning: '設定なし',
      };
    }
  }

  // タイトルを生成するヘルパー関数
  private generateTitle(item: any): string {
    // 場所と物件タイプからタイトルを生成
    const location = [];
    if (item.Prefecture) location.push(item.Prefecture);
    if (item.Municipality) location.push(item.Municipality);
    if (item.DistrictName) location.push(item.DistrictName);
    
    const locationStr = location.join(' ');
    const propertyType = item.Type || '物件';
    const layout = item.FloorPlan || '';
    
    if (locationStr && layout) {
      return `${locationStr}の${layout} ${propertyType}`;
    } else if (locationStr) {
      return `${locationStr}の${propertyType}`;
    } else {
      return `物件 #${(Math.floor(Math.random() * 1000) + 1)}`;
    }
  }

  // 数値を安全に抽出するヘルパー関数
  private extractNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // カンマや単位を削除
      const cleaned = value.replace(/[,\s¥円㎡]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }

  // 国度交通省APIのレスポンスを整形する関数
  private formatAPIResponse(data: any[]): PropertyData[] {
    console.log('APIレスポンスデータフォーマット中', data.length, '件');
    
    try {
      // 各アイテムをPropertyData型に変換
      const properties: PropertyData[] = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const property = this.convertToPropertyData(data[i], i);
          // ノイズ除去：無効なデータを除外
          if (property && property.id && property.price > 0 && property.area > 0) {
            properties.push(property);
          }
        } catch (itemError) {
          console.log(`アイテム#${i}の変換エラーをスキップ:`, itemError);
          // 個別のアイテムエラーをスキップ
          continue;
        }

        // 最大2000件に制限
        if (properties.length >= 2000) {
          console.log('最大2000件に制限しました');
          break;
        }
      }

      console.log(`変換済み物件データ: ${properties.length}件、最初の2件:、`, properties.slice(0, 2));
      return properties;
    } catch (error) {
      console.error('APIレスポンスの変換エラー:', error);
      return [];
    }
  }
}

export default new RealEstateAPI();