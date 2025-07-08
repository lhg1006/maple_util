// 게임 데이터 연결 및 조회 유틸리티
import { loadMonsters, loadMaps } from '@/lib/cdn-data-loader';

// 임시 인터페이스
interface MapInfo {
  id: number;
  name: string;
  region: string;
  levelRange: string;
  description?: string;
}


interface MonsterInfo {
  id: number;
  name: string;
  level: number;
  hp: number;
  exp: number;
  region: string;
  maps: number[];
  attackType: 'melee' | 'ranged' | 'magic';
  element?: string;
  description?: string;
  isBoss?: boolean;
}

// 데이터 캐시
let cachedMonsters: any = null;
let cachedMaps: any = null;

// 데이터 로더 함수
async function getMonsters() {
  if (!cachedMonsters) {
    cachedMonsters = await loadMonsters();
  }
  return cachedMonsters;
}

async function getMaps() {
  if (!cachedMaps) {
    cachedMaps = await loadMaps();
  }
  return cachedMaps;
}

// 통합 게임 데이터 인터페이스
export interface GameData {
  monster: MonsterInfo;
  maps: MapInfo[];
}

// 몬스터 상세 정보 (맵 정보 포함)
export async function getMonsterDetails(monsterId: number): Promise<GameData | null> {
  // CDN에서 몬스터 데이터 로드
  const monsters = await getMonsters();
  const monsterData = monsters[monsterId];
  
  if (!monsterData) return null;
  
  const monster: MonsterInfo = {
    id: monsterData.id,
    name: monsterData.name,
    level: monsterData.level || 0,
    hp: monsterData.hp || 0,
    exp: monsterData.exp || 0,
    region: monsterData.region || '알 수 없음',
    maps: monsterData.foundAt || [],
    attackType: monsterData.bodyAttack ? 'melee' : 'ranged',
    element: monsterData.element || 'neutral',
    description: monsterData.description,
    isBoss: monsterData.boss || false,
  };
  
  if (!monster) return null;

  // 맵 정보 조회
  let maps: MapInfo[] = [];
  
  const allMaps = await getMaps();
  
  // 맵 정보 찾기
  if (monster.maps && monster.maps.length > 0) {
    maps = monster.maps.map(mapId => {
      const mapData = allMaps[mapId];
      if (mapData) {
        return {
          id: mapData.id,
          name: mapData.name,
          region: mapData.streetName || mapData.region || monster.region,
          levelRange: `${monster.level}-${monster.level + 10}`,
          description: mapData.description || `${monster.name}이 출현하는 지역`
        };
      }
      return null;
    }).filter(Boolean) as MapInfo[];
  }
  
  // 맵이 없으면 기본 맵 정보 생성
  if (maps.length === 0 && monster.maps && monster.maps.length > 0) {
    maps = monster.maps.slice(0, 5).map(mapId => ({
      id: mapId,
      name: `맵 ${mapId}`,
      region: monster.region,
      levelRange: `${monster.level}-${monster.level + 10}`,
      description: `${monster.name}이 출현하는 지역`
    }));
  }

  return {
    monster,
    maps,
  };
}


// 특정 맵의 몬스터 목록 조회
export async function getMonstersByMap(mapId: number): Promise<MonsterInfo[]> {
  const monsters = await getMonsters();
  return Object.values(monsters).filter((monster: any) => 
    monster.foundAt && monster.foundAt.includes(mapId)
  ) as MonsterInfo[];
}

// 특정 지역의 몬스터 목록 조회
export async function getMonstersByRegion(region: string): Promise<MonsterInfo[]> {
  const monsters = await getMonsters();
  return Object.values(monsters).filter((monster: any) => 
    monster.region === region
  ) as MonsterInfo[];
}

// 레벨 범위별 몬스터 조회
export async function getMonstersByLevel(minLevel: number, maxLevel: number): Promise<MonsterInfo[]> {
  const monsters = await getMonsters();
  return Object.values(monsters).filter((monster: any) => 
    monster.level >= minLevel && monster.level <= maxLevel
  ) as MonsterInfo[];
}

// 보스 몬스터 목록 조회
export async function getBossMonsters(): Promise<MonsterInfo[]> {
  const monsters = await getMonsters();
  return Object.values(monsters).filter((monster: any) => monster.isBoss) as MonsterInfo[];
}


// 통계 함수들
export async function getGameStats() {
  const monsters = await getMonsters();
  const maps = await getMaps();
  
  const monsterCount = Object.keys(monsters).length;
  const mapCount = Object.keys(maps).length;
  
  const bossCount = Object.values(monsters).filter((m: any) => m.boss).length;
  const maxLevel = Math.max(...Object.values(monsters).map((m: any) => m.level));
  const minLevel = Math.min(...Object.values(monsters).map((m: any) => m.level));
  
  return {
    monsters: monsterCount,
    maps: mapCount,
    bosses: bossCount,
    levelRange: { min: minLevel, max: maxLevel },
  };
}

// 검색 함수
export async function searchMonsters(query: string): Promise<MonsterInfo[]> {
  const monsters = await getMonsters();
  const lowerQuery = query.toLowerCase();
  return Object.values(monsters).filter((monster: any) =>
    monster.name.toLowerCase().includes(lowerQuery) ||
    monster.region.toLowerCase().includes(lowerQuery) ||
    monster.description?.toLowerCase().includes(lowerQuery)
  ) as MonsterInfo[];
}


export async function searchMaps(query: string): Promise<MapInfo[]> {
  const maps = await getMaps();
  const lowerQuery = query.toLowerCase();
  return Object.values(maps).filter((map: any) =>
    map.name.toLowerCase().includes(lowerQuery) ||
    map.streetName?.toLowerCase().includes(lowerQuery) ||
    map.description?.toLowerCase().includes(lowerQuery)
  ) as MapInfo[];
}

// 추천 시스템
export async function getRecommendedMonsters(level: number, region?: string): Promise<MonsterInfo[]> {
  const monsters = await getMonsters();
  let monsterList = Object.values(monsters) as any[];
  
  // 레벨 기반 필터링 (±10 레벨)
  monsterList = monsterList.filter(monster => 
    Math.abs(monster.level - level) <= 10
  );
  
  // 지역 기반 필터링 (선택적)
  if (region) {
    monsterList = monsterList.filter(monster => monster.region === region);
  }
  
  // 레벨 차이 기준으로 정렬
  monsterList.sort((a, b) => 
    Math.abs(a.level - level) - Math.abs(b.level - level)
  );
  
  return monsterList.slice(0, 10) as MonsterInfo[]; // 상위 10개만 반환
}

