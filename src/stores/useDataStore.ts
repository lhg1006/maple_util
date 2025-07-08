import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 타입 정의
interface Monster {
  id: number;
  name: string;
  level: number;
  hp: number;
  mp: number;
  exp: number;
  description: string;
  pad: number;
  mad: number;
  pdr: number;
  mdr: number;
  acc: number;
  speed: number;
  bodyAttack: boolean;
  boss: boolean;
  foundAt: number[];
}

interface Item {
  id: number;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  level?: number;
  [key: string]: any;
}

interface MapData {
  id: number;
  name: string;
  streetName?: string;
  region?: string;
  [key: string]: any;
}

interface NPC {
  id: number;
  name: string;
  description?: string;
  location?: string;
  scripts?: string[];
  [key: string]: any;
}

interface Stats {
  monsters: number;
  items: number;
  maps: number;
  npcs: number;
  bosses: number;
  maxLevel: number;
}

interface DataStore {
  // 데이터
  monsters: Record<number, Monster>;
  items: Record<number, Item>;
  maps: Record<number, MapData>;
  npcs: Record<number, NPC>;
  
  // 로딩 상태
  isLoading: boolean;
  monstersLoaded: boolean;
  itemsLoaded: boolean;
  mapsLoaded: boolean;
  npcsLoaded: boolean;
  
  // 에러 상태
  error: string | null;
  
  // 액션
  loadMonsters: () => Promise<void>;
  loadItems: () => Promise<void>;
  loadMaps: () => Promise<void>;
  loadNPCs: () => Promise<void>;
  loadAllData: () => Promise<void>;
  
  // 유틸리티
  getStats: () => Stats;
  getMonstersByLevel: (minLevel: number, maxLevel: number) => Monster[];
  getBossMonsters: () => Monster[];
  
  // 초기화
  reset: () => void;
}

// 데이터 로딩 함수들
async function fetchMonsters(): Promise<Record<number, Monster>> {
  try {
    // 우선 최종 몬스터 데이터 시도
    const response = await fetch('/monsters-ultimate.json');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 최종 몬스터 데이터 로드: ${Object.keys(data).length}개`);
      return data;
    }
  } catch (error) {
    console.warn('최종 몬스터 데이터 로드 실패, CDN 시도 중...');
  }
  
  // CDN 데이터 fallback
  try {
    const response = await fetch('https://cdn.jsdelivr.net/gh/lhg1006/maple-util-data@latest/monsters.json');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ CDN 몬스터 데이터 로드: ${Object.keys(data).length}개`);
      return data;
    }
  } catch (error) {
    console.error('CDN 몬스터 데이터 로드 실패:', error);
  }
  
  return {};
}

async function fetchItems(): Promise<Record<number, Item>> {
  try {
    // 아이템 인덱스 파일 로드
    const indexResponse = await fetch('https://cdn.jsdelivr.net/gh/lhg1006/maple-util-data@latest/items-index.json');
    if (!indexResponse.ok) throw new Error('인덱스 로드 실패');
    
    const index = await indexResponse.json();
    console.log(`📋 아이템 인덱스: ${index.totalItems}개, ${index.chunks.length}개 청크`);
    
    // 모든 청크를 병렬로 로드
    const chunkPromises = index.chunks.map(async (chunk: any) => {
      const response = await fetch(`https://cdn.jsdelivr.net/gh/lhg1006/maple-util-data@latest/${chunk.file}`);
      if (!response.ok) throw new Error(`청크 로드 실패: ${chunk.file}`);
      return response.json();
    });
    
    const chunks = await Promise.all(chunkPromises);
    
    // 모든 청크를 하나로 병합
    const allItems = chunks.reduce((acc, chunk) => {
      return { ...acc, ...chunk };
    }, {});
    
    console.log(`✅ 아이템 데이터 로드: ${Object.keys(allItems).length}개`);
    return allItems;
  } catch (error) {
    console.error('아이템 데이터 로드 실패:', error);
    return {};
  }
}

async function fetchMaps(): Promise<Record<number, MapData>> {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/gh/lhg1006/maple-util-data@latest/maps.json');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 맵 데이터 로드: ${Object.keys(data).length}개`);
      return data;
    }
  } catch (error) {
    console.error('맵 데이터 로드 실패:', error);
  }
  
  return {};
}

async function fetchNPCs(): Promise<Record<number, NPC>> {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/gh/lhg1006/maple-util-data@latest/npcs.json');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ NPC 데이터 로드: ${Object.keys(data).length}개`);
      return data;
    }
  } catch (error) {
    console.error('NPC 데이터 로드 실패:', error);
  }
  
  return {};
}

// Zustand 스토어 생성
export const useDataStore = create<DataStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      monsters: {},
      items: {},
      maps: {},
      npcs: {},
      
      isLoading: false,
      monstersLoaded: false,
      itemsLoaded: false,
      mapsLoaded: false,
      npcsLoaded: false,
      
      error: null,
      
      // 몬스터 데이터 로드
      loadMonsters: async () => {
        const state = get();
        if (state.monstersLoaded) return;
        
        set({ isLoading: true, error: null });
        try {
          const monsters = await fetchMonsters();
          set({ 
            monsters, 
            monstersLoaded: true,
            isLoading: false 
          });
        } catch (error) {
          console.error('몬스터 로딩 실패:', error);
          set({ 
            error: '몬스터 데이터 로딩에 실패했습니다.',
            isLoading: false 
          });
        }
      },
      
      // 아이템 데이터 로드
      loadItems: async () => {
        const state = get();
        if (state.itemsLoaded) return;
        
        set({ isLoading: true, error: null });
        try {
          const items = await fetchItems();
          set({ 
            items, 
            itemsLoaded: true,
            isLoading: false 
          });
        } catch (error) {
          console.error('아이템 로딩 실패:', error);
          set({ 
            error: '아이템 데이터 로딩에 실패했습니다.',
            isLoading: false 
          });
        }
      },
      
      // 맵 데이터 로드
      loadMaps: async () => {
        const state = get();
        if (state.mapsLoaded) return;
        
        set({ isLoading: true, error: null });
        try {
          const maps = await fetchMaps();
          set({ 
            maps, 
            mapsLoaded: true,
            isLoading: false 
          });
        } catch (error) {
          console.error('맵 로딩 실패:', error);
          set({ 
            error: '맵 데이터 로딩에 실패했습니다.',
            isLoading: false 
          });
        }
      },
      
      // NPC 데이터 로드
      loadNPCs: async () => {
        const state = get();
        if (state.npcsLoaded) return;
        
        set({ isLoading: true, error: null });
        try {
          const npcs = await fetchNPCs();
          set({ 
            npcs, 
            npcsLoaded: true,
            isLoading: false 
          });
        } catch (error) {
          console.error('NPC 로딩 실패:', error);
          set({ 
            error: 'NPC 데이터 로딩에 실패했습니다.',
            isLoading: false 
          });
        }
      },
      
      // 모든 데이터 로드
      loadAllData: async () => {
        console.log('🚀 전체 데이터 로딩 시작...');
        const startTime = Date.now();
        
        set({ isLoading: true, error: null });
        
        try {
          // 병렬로 모든 데이터 로드
          const [monsters, items, maps, npcs] = await Promise.all([
            fetchMonsters(),
            fetchItems(),
            fetchMaps(),
            fetchNPCs()
          ]);
          
          const endTime = Date.now();
          const duration = ((endTime - startTime) / 1000).toFixed(1);
          
          set({
            monsters,
            items,
            maps,
            npcs,
            monstersLoaded: true,
            itemsLoaded: true,
            mapsLoaded: true,
            npcsLoaded: true,
            isLoading: false,
            error: null
          });
          
          console.log(`✨ 전체 데이터 로딩 완료 (${duration}초)`);
          console.log(`📊 몬스터: ${Object.keys(monsters).length}개`);
          console.log(`📦 아이템: ${Object.keys(items).length}개`);
          console.log(`🗺️ 맵: ${Object.keys(maps).length}개`);
          console.log(`👤 NPC: ${Object.keys(npcs).length}개`);
          
        } catch (error) {
          console.error('전체 데이터 로딩 실패:', error);
          set({ 
            error: '데이터 로딩에 실패했습니다.',
            isLoading: false 
          });
        }
      },
      
      // 통계 정보 계산
      getStats: () => {
        const state = get();
        const monsters = Object.values(state.monsters);
        const bosses = monsters.filter(m => m.boss);
        const maxLevel = monsters.length > 0 ? Math.max(...monsters.map(m => m.level)) : 0;
        
        return {
          monsters: monsters.length,
          items: Object.keys(state.items).length,
          maps: Object.keys(state.maps).length,
          npcs: Object.keys(state.npcs).length,
          bosses: bosses.length,
          maxLevel
        };
      },
      
      // 레벨별 몬스터 조회
      getMonstersByLevel: (minLevel: number, maxLevel: number) => {
        const state = get();
        return Object.values(state.monsters).filter(
          monster => monster.level >= minLevel && monster.level <= maxLevel
        );
      },
      
      // 보스 몬스터 조회
      getBossMonsters: () => {
        const state = get();
        return Object.values(state.monsters).filter(monster => monster.boss);
      },
      
      // 초기화
      reset: () => {
        set({
          monsters: {},
          items: {},
          maps: {},
          npcs: {},
          isLoading: false,
          monstersLoaded: false,
          itemsLoaded: false,
          mapsLoaded: false,
          npcsLoaded: false,
          error: null
        });
      }
    }),
    {
      name: 'maple-data-store', // devtools에서 표시될 이름
    }
  )
);