import axios from 'axios';
import { 
  MapleItem, 
  MapleNPC, 
  MapleMob, 
  MapleJob, 
  MapleSkill
} from '@/types/maplestory';

const API_BASE_URL = 'https://maplestory.io/api';
const DEFAULT_REGION = 'KMS';
const DEFAULT_VERSION = '389';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ItemQueryParams {
  overallCategory?: string;
  category?: string;
  subCategory?: string;
  page?: number;
  startPosition?: number;
  count?: number;
}


export class MapleStoryAPI {
  private region: string;
  private version: string;

  constructor(region: string = DEFAULT_REGION, version: string = DEFAULT_VERSION) {
    this.region = region;
    this.version = version;
  }

  private getEndpoint(path: string): string {
    return `/${this.region}/${this.version}${path}`;
  }

  // NPC API
  async getNPC(id: number): Promise<MapleNPC> {
    const response = await apiClient.get(this.getEndpoint(`/npc/${id}`));
    return response.data;
  }

  async getNPCRender(id: number, action: string = 'stand'): Promise<string> {
    return `${API_BASE_URL}${this.getEndpoint(`/npc/${id}/render/${action}`)}`;
  }

  // Mob API
  async getMob(id: number): Promise<MapleMob> {
    const response = await apiClient.get(this.getEndpoint(`/mob/${id}`));
    return response.data;
  }

  async getMobRender(id: number, action: string = 'stand'): Promise<string> {
    return `${API_BASE_URL}${this.getEndpoint(`/mob/${id}/render/${action}`)}`;
  }

  // Mob 목록 API
  async getMobsByCategory(params: { startPosition?: number; count?: number }): Promise<MapleMob[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startPosition) queryParams.append('startPosition', params.startPosition.toString());
      if (params.count) queryParams.append('count', params.count.toString());
      
      const url = `${this.getEndpoint('/mob')}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      const mobs = response.data;
      
      if (!Array.isArray(mobs)) {
        return [];
      }
      
      return mobs.map((mob: any) => ({
        id: mob.id,
        name: mob.name || `Mob ${mob.id}`,
        level: mob.level || null,
        hp: mob.hp || null,
        exp: mob.exp || null,
      }));
    } catch (error) {
      console.error('Failed to fetch mobs:', error);
      throw error;
    }
  }

  // Item API
  async getItem(id: number): Promise<MapleItem> {
    try {
      const response = await apiClient.get(this.getEndpoint(`/item/${id}`));
      const data = response.data;
      
      // API가 null을 반환하는 경우 (아이템이 존재하지 않음)
      if (data === null) {
        throw new Error(`Item ${id} not found`);
      }
      
      // 응답이 없거나 에러 메시지인 경우
      if (!data || data.error || data.message) {
        throw new Error(`Item ${id} not found`);
      }
      
      // API 응답을 MapleItem 형식으로 변환
      return {
        id: data.id || id,
        name: data.description?.name || `Item ${id}`,
        description: data.description?.description || '',
        icon: data.metaInfo?.icon || '',
        category: data.typeInfo?.overallCategory || 'Unknown',
        subcategory: data.typeInfo?.subCategory || '',
        cash: data.metaInfo?.cash || false,
        price: data.metaInfo?.price || 0,
      };
    } catch (error) {
      // 에러 로깅 제거하여 콘솔 스팸 방지
      throw error;
    }
  }

  async getItemIcon(id: number): Promise<string> {
    return `${API_BASE_URL}${this.getEndpoint(`/item/${id}/icon`)}`;
  }

  async getItemsByCategory(params: ItemQueryParams): Promise<MapleItem[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.overallCategory) queryParams.append('overallCategory', params.overallCategory);
      if (params.category) queryParams.append('category', params.category);
      if (params.subCategory) queryParams.append('subCategory', params.subCategory);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.startPosition) queryParams.append('startPosition', params.startPosition.toString());
      if (params.count) queryParams.append('count', params.count.toString());
      
      const url = `${this.getEndpoint('/item')}?${queryParams.toString()}`;
      console.log('API 호출 URL:', `${API_BASE_URL}${url}`);
      const response = await apiClient.get(url);
      const items = response.data;
      
      if (!Array.isArray(items)) {
        return [];
      }
      
      // API 응답을 MapleItem 형식으로 변환
      return items.map((item: {
        id: number;
        name?: string;
        desc?: string;
        isCash?: boolean;
        price?: number;
        typeInfo?: {
          category?: string;
          subCategory?: string;
        };
      }) => ({
        id: item.id,
        name: item.name || `Item ${item.id}`,
        description: item.desc || '',
        icon: `${API_BASE_URL}${this.getEndpoint(`/item/${item.id}/icon`)}`,
        category: item.typeInfo?.category || 'Unknown',
        subcategory: item.typeInfo?.subCategory || '',
        cash: item.isCash || false,
        price: item.price || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch items by category:', error);
      throw error;
    }
  }


  // Job API (if available)
  async getJob(id: number): Promise<MapleJob> {
    const response = await apiClient.get(this.getEndpoint(`/job/${id}`));
    return response.data;
  }

  // Skill API (if available)
  async getSkill(id: number): Promise<MapleSkill> {
    const response = await apiClient.get(this.getEndpoint(`/skill/${id}`));
    return response.data;
  }

  async getSkillIcon(id: number): Promise<string> {
    return `${API_BASE_URL}${this.getEndpoint(`/skill/${id}/icon`)}`;
  }

  // Search functionality
  async searchItems(query: string, limit: number = 20): Promise<MapleItem[]> {
    try {
      const response = await apiClient.get(this.getEndpoint(`/item/search`), {
        params: { q: query, limit }
      });
      return response.data;
    } catch {
      console.warn('Search not available, returning empty array');
      return [];
    }
  }

  async searchNPCs(query: string, limit: number = 20): Promise<MapleNPC[]> {
    try {
      const response = await apiClient.get(this.getEndpoint(`/npc/search`), {
        params: { q: query, limit }
      });
      return response.data;
    } catch {
      console.warn('Search not available, returning empty array');
      return [];
    }
  }

  async searchMobs(query: string, limit: number = 20): Promise<MapleMob[]> {
    try {
      const response = await apiClient.get(this.getEndpoint(`/mob/search`), {
        params: { q: query, limit }
      });
      return response.data;
    } catch {
      console.warn('Search not available, returning empty array');
      return [];
    }
  }
}

export const mapleAPI = new MapleStoryAPI();