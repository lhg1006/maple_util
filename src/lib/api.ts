import axios from 'axios';
import { 
  MapleItem, 
  MapleItemResponse,
  MapleNPC, 
  MapleMob, 
  MapleJob, 
  MapleSkill,
  ApiResponse 
} from '@/types/maplestory';

const API_BASE_URL = 'https://maplestory.io/api';
const DEFAULT_REGION = 'GMS';
const DEFAULT_VERSION = '208.2.0';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

  // Item API
  async getItem(id: number): Promise<MapleItem> {
    try {
      const response = await apiClient.get(this.getEndpoint(`/item/${id}`));
      const data = response.data as MapleItemResponse;
      
      // API 응답을 MapleItem 형식으로 변환
      return {
        id: data.id,
        name: data.description?.name || `Item ${data.id}`,
        description: data.description?.description,
        icon: data.metaInfo?.icon,
        category: data.typeInfo?.overallCategory,
        subcategory: data.typeInfo?.subCategory,
        cash: data.metaInfo?.cash || false,
        price: data.metaInfo?.price,
      };
    } catch (error) {
      console.error(`Failed to fetch item ${id}:`, error);
      throw error;
    }
  }

  async getItemIcon(id: number): Promise<string> {
    return `${API_BASE_URL}${this.getEndpoint(`/item/${id}/icon`)}`;
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.warn('Search not available, returning empty array');
      return [];
    }
  }
}

export const mapleAPI = new MapleStoryAPI();