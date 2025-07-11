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
    const npcData = response.data;
    
    // 첫 번째 맵 정보 가져오기 (foundAt 배열의 첫 번째 요소)
    let mapInfo = undefined;
    if (npcData.foundAt && npcData.foundAt.length > 0) {
      try {
        const mapId = npcData.foundAt[0].id;
        const mapResponse = await apiClient.get(this.getEndpoint(`/map/${mapId}`));
        const mapData = mapResponse.data;
        mapInfo = {
          id: mapId,
          name: mapData.streetName || mapData.mapName || `맵 ${mapId}`,
          category: mapData.category,
          region: mapData.region,
        };
      } catch (error) {
        console.warn('Failed to fetch map info for NPC:', id);
      }
    }
    
    return {
      id: npcData.id,
      name: npcData.name,
      description: npcData.dialogue ? Object.values(npcData.dialogue).join('\n') : '',
      location: mapInfo?.name,
      scripts: npcData.dialogue ? Object.values(npcData.dialogue) : [],
      map: mapInfo,
      func: npcData.isShop ? 'shop' : '',
      sprites: [],
    };
  }

  async getNPCRender(id: number, action: string = 'stand'): Promise<string> {
    return `${API_BASE_URL}${this.getEndpoint(`/npc/${id}/render/${action}`)}`;
  }

  // NPC 목록 API (옵션으로 상세 정보 포함)
  async getNPCsByCategory(params: { startPosition?: number; count?: number; includeDetails?: boolean }): Promise<MapleNPC[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startPosition) queryParams.append('startPosition', params.startPosition.toString());
      if (params.count) queryParams.append('count', params.count.toString());
      
      const url = `${this.getEndpoint('/npc')}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      const npcs = response.data;
      
      if (!Array.isArray(npcs)) {
        return [];
      }
      
      // 상세 정보 포함 여부에 따라 다르게 처리
      if (params.includeDetails) {
        // 처음 100개만 상세 정보 포함 (성능 고려)
        const limitedNPCs = npcs.slice(0, 100);
        
        const npcDetailsPromises = limitedNPCs.map(async (npc: any) => {
          try {
            const detailResponse = await apiClient.get(this.getEndpoint(`/npc/${npc.id}`));
            const npcData = detailResponse.data;
            
            // 첫 번째 맵 정보 가져오기
            let mapInfo = undefined;
            if (npcData.foundAt && npcData.foundAt.length > 0) {
              try {
                const mapId = npcData.foundAt[0].id;
                const mapResponse = await apiClient.get(this.getEndpoint(`/map/${mapId}`));
                const mapData = mapResponse.data;
                mapInfo = {
                  id: mapId,
                  name: mapData.streetName || mapData.mapName || `맵 ${mapId}`,
                  category: mapData.category,
                  region: mapData.region,
                };
              } catch (mapError) {
                console.warn('Failed to fetch map info for NPC:', npc.id);
              }
            }
            
            return {
              id: npc.id,
              name: npcData.name || npc.name,
              description: npcData.dialogue ? Object.values(npcData.dialogue).join('\n') : '',
              location: mapInfo?.name,
              scripts: npcData.dialogue ? Object.values(npcData.dialogue).map(d => String(d)) : [],
              map: mapInfo,
              func: npcData.isShop ? 'shop' : '',
              sprites: [],
            };
          } catch (error) {
            console.warn('Failed to fetch detail for NPC:', npc.id);
            return {
              id: npc.id,
              name: npc.name,
              description: '',
              location: undefined,
              scripts: [],
              map: undefined,
              func: '',
              sprites: [],
            };
          }
        });
        
        const detailedNPCs = await Promise.all(npcDetailsPromises);
        
        // 나머지 NPC들은 기본 정보만
        const remainingNPCs = npcs.slice(100)
          .filter((npc: any) => npc.name) // 이름이 있는 NPC만 필터링
          .map((npc: any) => ({
            id: npc.id,
            name: npc.name,
            description: '',
            location: undefined,
            scripts: [],
            map: undefined,
            func: '',
            sprites: [],
          }));
        
        return [...detailedNPCs, ...remainingNPCs];
      } else {
        // 기본 정보만 반환 (빠른 로딩)
        return npcs
          .filter((npc: any) => npc.name) // 이름이 있는 NPC만 필터링
          .map((npc: any) => ({
            id: npc.id,
            name: npc.name,
            description: '',
            location: undefined,
            scripts: [],
            map: undefined,
            func: '',
            sprites: [],
          }));
      }
    } catch (error) {
      console.error('Failed to fetch NPCs:', error);
      throw error;
    }
  }

  // 맵 목록 가져오기
  async getMaps(params: { startPosition?: number; count?: number } = {}): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startPosition) queryParams.append('startPosition', params.startPosition.toString());
      if (params.count) queryParams.append('count', params.count.toString());
      
      const url = `${this.getEndpoint('/map')}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      const maps = response.data || [];
      
      return maps.map((map: any) => ({
        id: map.id,
        name: map.name,
        streetName: map.streetName,
        displayName: map.streetName ? `${map.streetName} - ${map.name}` : map.name,
        continent: this.getContinentByStreetName(map.streetName),
        category: this.getMapCategory(map.streetName),
      }));
    } catch (error) {
      console.error('Failed to fetch maps:', error);
      throw error;
    }
  }

  // 대륙별 분류 함수
  private getContinentByStreetName(streetName: string): string {
    if (!streetName) return '기타';
    
    // 메이플 로드 (초보자 지역)
    if (['메이플로드', '레인보우스트리트'].includes(streetName)) {
      return '메이플 로드';
    }
    
    // 빅토리아 아일랜드
    if (['빅토리아로드', '헤네시스', '엘리니아', '페리온', '슬리피우드', '습지', '드레이크의 동굴'].includes(streetName)) {
      return '빅토리아 아일랜드';
    }
    
    // 루타비스
    if (['루타비스', '루디브리엄성', '헬리오스 탑', '에오스 탑'].includes(streetName)) {
      return '루타비스';
    }
    
    // 아쿠아로드 (아쿠아리움)
    if (['아쿠아로드', '미나르숲', '포트로드'].includes(streetName)) {
      return '아쿠아로드';
    }
    
    // 리프레 대륙
    if (['리프레', '엘린숲', '아랫마을', '킹덤로드', '퀸스로드'].includes(streetName)) {
      return '리프레';
    }
    
    // 무릉 지역
    if (['무릉도원', '백초마을', '상산'].includes(streetName)) {
      return '무릉도원';
    }
    
    // 아스완 지역
    if (['아스완', '사자왕의 성'].includes(streetName)) {
      return '아스완';
    }
    
    // 천상 지역 (에델슈타인 포함)
    if (['천상의 크리세', '시간의 신전', '타임로드', '기사단 요새'].includes(streetName)) {
      return '천상계';
    }
    
    // 스노우 아일랜드 (얼음 지역)
    if (['스노우 아일랜드', '얼음왕국'].includes(streetName)) {
      return '스노우 아일랜드';
    }
    
    // 버섯 왕국
    if (['버섯의 성', '버섯노래숲'].includes(streetName)) {
      return '버섯 왕국';
    }
    
    // 커닝시티
    if (['커닝타워', '커닝시티', '커닝 스퀘어', '커닝시티지하철', '커닝스퀘어'].includes(streetName)) {
      return '커닝시티';
    }
    
    // 요정 지역
    if (['요정의 숲', '요정학원 엘리넬', '엘리넬 호수', '엘로딘'].includes(streetName)) {
      return '요정계';
    }
    
    // 테마파크 및 이벤트
    if (['판타스틱 테마파크', 'UFO 내부', '폐기지 잔해', '헌티드 맨션'].includes(streetName)) {
      return '테마파크';
    }
    
    // 던전 지역
    if (['던전', '골렘사원', '발록의 신전', '저주받은신전', '타락한 세계수', '폐광'].includes(streetName)) {
      return '던전';
    }
    
    // 항해 지역
    if (['항해중', '배틀 호라이즌', '노틸러스'].includes(streetName)) {
      return '해상 지역';
    }
    
    // 특수 지역
    if (['히든스트리트', '히든 스트리트', '미니던전'].includes(streetName)) {
      return '히든 지역';
    }
    
    return '기타 지역';
  }

  // 맵 카테고리 분류
  private getMapCategory(streetName: string): string {
    if (!streetName) return 'other';
    
    if (['메이플로드', '레인보우스트리트'].includes(streetName)) return 'beginner';
    if (['빅토리아로드', '헤네시스', '엘리니아', '페리온'].includes(streetName)) return 'victoria';
    if (streetName === '루타비스') return 'ludibrium';
    if (['버섯의 성', '버섯노래숲'].includes(streetName)) return 'mushroom';
    if (streetName.includes('커닝')) return 'kerning';
    if (['던전', '골렘사원', '발록의 신전', '저주받은신전'].includes(streetName)) return 'dungeon';
    if (streetName.includes('히든')) return 'hidden';
    
    return 'other';
  }

  // 특정 맵의 NPC 목록 가져오기 (간단 버전)
  async getNPCsByMap(mapId: number): Promise<MapleNPC[]> {
    try {
      console.log(`🗺️ Fetching NPCs for map ${mapId}...`);
      
      // 1단계: 맵 정보 가져오기
      const mapResponse = await apiClient.get(this.getEndpoint(`/map/${mapId}`));
      const mapData = mapResponse.data;
      
      if (!mapData || !mapData.npcs || mapData.npcs.length === 0) {
        console.log(`No NPCs found in map ${mapId}`);
        return [];
      }
      
      const mapInfo = {
        id: mapId,
        name: mapData.streetName ? `${mapData.streetName} - ${mapData.name}` : mapData.name,
        category: mapData.category,
        region: mapData.region,
      };
      
      console.log(`Found ${mapData.npcs.length} NPCs in ${mapInfo.name}`);
      
      // 2단계: 각 NPC의 이름 가져오기 (처음 20개만)
      const npcPromises = mapData.npcs.slice(0, 20).map(async (npc: any) => {
        try {
          const npcResponse = await apiClient.get(this.getEndpoint(`/npc/${npc.id}`));
          const npcData = npcResponse.data;
          
          return {
            id: npc.id,
            name: npcData.name || `NPC ${npc.id}`,
            description: npcData.dialogue ? Object.values(npcData.dialogue).join(' ') : '',
            location: mapInfo.name,
            scripts: [],
            map: mapInfo,
            func: npcData.isShop ? 'shop' : '',
            sprites: [],
          };
        } catch (error) {
          console.warn(`Failed to load NPC ${npc.id}:`, error);
          return null;
        }
      });
      
      const npcs = (await Promise.all(npcPromises)).filter(npc => npc !== null) as MapleNPC[];
      
      console.log(`✅ Successfully loaded ${npcs.length} NPCs from ${mapInfo.name}`);
      return npcs;
      
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Map ${mapId} not found (404)`);
        return [];
      }
      console.error(`Failed to fetch NPCs for map ${mapId}:`, error);
      return []; // 에러 시 빈 배열 반환 (throw 대신)
    }
  }

  // 기본 NPC 목록 (빈 상태용)
  async getAllNPCs(): Promise<MapleNPC[]> {
    // 기본적으로는 빈 배열 반환
    return [];
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
        mp: mob.mp || null,
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


  // Job API (static data)
  async getJob(id: number): Promise<MapleJob> {
    try {
      const response = await fetch('/jobs.json');
      const jobs = await response.json();
      const job = jobs.find((j: any) => j.id === id);
      if (!job) {
        throw new Error(`Job ${id} not found`);
      }
      return job;
    } catch (error) {
      console.warn('Failed to fetch job from static data:', error);
      throw error;
    }
  }

  // Jobs List API (static data)
  async getJobs(): Promise<MapleJob[]> {
    try {
      const response = await fetch('/jobs.json');
      const jobs = await response.json();
      return jobs;
    } catch (error) {
      console.warn('Failed to fetch jobs from static data:', error);
      throw error;
    }
  }

  // Skill API (static data)
  async getSkill(id: number): Promise<MapleSkill> {
    try {
      const response = await fetch('/skills.json');
      const skills = await response.json();
      const skill = skills.find((s: any) => s.id === id);
      if (!skill) {
        throw new Error(`Skill ${id} not found`);
      }
      return skill;
    } catch (error) {
      console.warn('Failed to fetch skill from static data:', error);
      throw error;
    }
  }

  // Skills List API (static data)
  async getSkills(): Promise<MapleSkill[]> {
    try {
      const response = await fetch('/skills.json');
      const skills = await response.json();
      return skills;
    } catch (error) {
      console.warn('Failed to fetch skills from static data:', error);
      throw error;
    }
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
      // maplestory.io API는 검색 기능이 없으므로 전체 NPC 목록에서 클라이언트 사이드 검색 구현
      const allNPCs = await this.getNPCsByCategory({ startPosition: 0, count: 1000 });
      
      const filteredNPCs = allNPCs.filter(npc => 
        npc.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      
      return filteredNPCs;
    } catch (error) {
      console.warn('NPC search failed:', error);
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

// Individual API functions for easier use
export const getItemById = (id: number) => mapleAPI.getItem(id);
export const getNPCById = (id: number) => mapleAPI.getNPC(id);
export const getMobById = (id: number) => mapleAPI.getMob(id);
export const getJobById = (id: number) => mapleAPI.getJob(id);
export const getSkillById = (id: number) => mapleAPI.getSkill(id);