import Constants from 'expo-constants';
import { PropertyData } from './RealEstateAPI';

const BASE_URL = 'https://openai-api.homes.co.jp/v1';
const TOKEN = Constants.expoConfig?.extra?.lifullToken || process.env.EXPO_PUBLIC_LIFULL_TOKEN;

function extractNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
}

export async function searchProperties(params: { fulladdr?: string; page?: number } = {}): Promise<PropertyData[]> {
  if (!TOKEN) {
    console.warn('LIFULL API token is not set');
    return [];
  }

  const query = new URLSearchParams();
  query.append('page', String(params.page ?? 1));
  query.append('sort_by', '-newdate');
  if (params.fulladdr) query.append('fulladdr', params.fulladdr);

  const url = `${BASE_URL}/realestate_article/search/room?${query.toString()}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!res.ok) {
      console.error('LIFULL API error', res.status);
      return [];
    }

    const data = await res.json();
    const rows = data.row_set || [];
    return rows.map((item: any, idx: number): PropertyData => {
      const photo = Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0].url :
        'https://via.placeholder.com/400x250?text=No+Image';
      return {
        id: item.property_id || String(idx),
        title: item.realestate_article_name || item.full_address || `物件#${idx}`,
        price: extractNumber(item.month_money_room_text) * 10000 || extractNumber(item.money_room_text),
        cover_url: photo,
        layout: item.floor_plan_text || '',
        station: item.traffics?.[0]?.station_name || '',
        walk_minutes: extractNumber(item.traffics?.[0]?.walk_time) || 0,
        deposit: extractNumber(item.deposit_text),
        key_money: extractNumber(item.key_money_text),
        initial_cost: 0,
        address: item.full_address || '',
        owner_type: 'agency',
        owner_name: item.realestate_article_type_name || '不動産会社',
        building_year: extractNumber(item.building_completed_text),
        area: extractNumber(item.etc_area_text),
        landType: '',
        structure: item.building_structure_detail || '',
        purpose: '',
        cityPlanning: ''
      };
    });
  } catch (e) {
    console.error('LIFULL API fetch error', e);
    return [];
  }
}
