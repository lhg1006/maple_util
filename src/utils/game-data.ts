// 게임 데이터 연결 및 조회 유틸리티
import { loadMonsters, loadItems, loadMaps } from '@/lib/cdn-data-loader';
import { DROPS, DropInfo, DROP_RATE_CONFIG, MONSTERS_BY_ITEM } from '@/data/drops';
import { getAutoDropsForMonster } from '@/utils/auto-drops';

// 임시 인터페이스
interface MapInfo {
  id: number;
  name: string;
  region: string;
  levelRange: string;
  description?: string;
}

interface ItemInfo {
  id: number;
  name: string;
  category: string;
  subCategory?: string;
  description?: string;
  level?: number;
  rarity?: string;
  sellPrice?: number;
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
let cachedItems: any = null;
let cachedMaps: any = null;

// 데이터 로더 함수
async function getMonsters() {
  if (!cachedMonsters) {
    cachedMonsters = await loadMonsters();
  }
  return cachedMonsters;
}

async function getItems() {
  if (!cachedItems) {
    cachedItems = await loadItems();
  }
  return cachedItems;
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
  drops: EnrichedDropInfo[];
  maps: MapInfo[];
}

export interface EnrichedDropInfo extends DropInfo {
  item: ItemInfo;
  displayRate: string;
  color: string;
  quantityText: string;
}

// 몬스터 상세 정보 (드롭, 맵 정보 포함)
export async function getMonsterDetails(monsterId: number): Promise<GameData | null> {
  // CDN에서 몬스터 데이터 로드
  const monsters = await getMonsters();
  const monsterData = monsters[monsterId];
  
  if (!monsterData) return null;
  
  const monster: MonsterInfo = {
    id: monsterData.id,
    name: monsterData.name,
    level: monsterData.level,
    hp: monsterData.hp,
    exp: monsterData.exp,
    region: monsterData.region,
    maps: monsterData.maps || [],
    attackType: monsterData.attackType as 'melee' | 'ranged' | 'magic',
    element: monsterData.element,
    description: monsterData.description,
    isBoss: monsterData.isBoss,
  };
  
  if (!monster) return null;

  // 드롭 정보 조회 및 강화
  let allDrops = DROPS[monsterId] || [];
  
  // 하드코딩된 드롭이 없으면 자동 드롭 생성
  if (allDrops.length === 0) {
    allDrops = await getAutoDropsForMonster(monsterId);
  }
  
  const items = await getItems();
  const drops = allDrops.map(drop => {
    const itemData = items[drop.itemId];
    let item: ItemInfo | undefined;
    
    if (itemData) {
      item = {
        id: itemData.id,
        name: itemData.name,
        category: itemData.typeInfo?.overallCategory || 'etc',
        subCategory: itemData.typeInfo?.subCategory,
        description: itemData.description,
        level: itemData.level,
        rarity: itemData.rarity,
        sellPrice: itemData.sellPrice,
      };
    }
    
    const rateConfig = DROP_RATE_CONFIG[drop.dropRate];
    
    let quantityText = '1개';
    if (drop.minQuantity && drop.maxQuantity) {
      if (drop.minQuantity === drop.maxQuantity) {
        quantityText = `${drop.minQuantity}개`;
      } else {
        quantityText = `${drop.minQuantity}-${drop.maxQuantity}개`;
      }
    }

    return {
      ...drop,
      item: item || { 
        id: drop.itemId, 
        name: `알 수 없는 아이템 (${drop.itemId})`,
        category: 'etc' as const,
        description: '데이터가 없는 아이템입니다.'
      },
      displayRate: rateConfig.displayText || rateConfig.text,
      color: rateConfig.color,
      quantityText,
    };
  });

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
    drops,
    maps,
  };
}

// 아이템을 드롭하는 몬스터 목록 조회
export async function getMonstersByItem(itemId: number): Promise<MonsterInfo[]> {
  const monsterIds = MONSTERS_BY_ITEM[itemId] || [];
  const monsters = await getMonsters();
  return monsterIds.map(id => monsters[id]).filter(Boolean);
}

// 특정 맵의 몬스터 목록 조회
export async function getMonstersByMap(mapId: number): Promise<MonsterInfo[]> {
  const monsters = await getMonsters();
  return Object.values(monsters).filter((monster: any) => 
    monster.maps && monster.maps.includes(mapId)
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

// 드롭률별 몬스터 조회
export async function getMonstersByDropRate(dropRate: keyof typeof DROP_RATE_CONFIG): Promise<MonsterInfo[]> {
  const monsters = await getMonsters();
  const monsterIds: number[] = [];
  
  Object.entries(DROPS).forEach(([monsterId, drops]) => {
    if (drops.some(drop => drop.dropRate === dropRate)) {
      monsterIds.push(parseInt(monsterId));
    }
  });
  
  return monsterIds.map(id => monsters[id]).filter(Boolean) as MonsterInfo[];
}

// 특정 아이템 카테고리를 드롭하는 몬스터 조회
export async function getMonstersByItemCategory(category: ItemInfo['category']): Promise<MonsterInfo[]> {
  const monsters = await getMonsters();
  const items = await getItems();
  const monsterIds: number[] = [];
  
  Object.entries(DROPS).forEach(([monsterId, drops]) => {
    const hasCategory = drops.some(drop => {
      const item = items[drop.itemId];
      return item && item.typeInfo?.overallCategory === category;
    });
    
    if (hasCategory) {
      monsterIds.push(parseInt(monsterId));
    }
  });
  
  return monsterIds.map(id => monsters[id]).filter(Boolean) as MonsterInfo[];
}

// 통계 함수들
export async function getGameStats() {
  const monsters = await getMonsters();
  const items = await getItems();
  const maps = await getMaps();
  
  const monsterCount = Object.keys(monsters).length;
  const itemCount = Object.keys(items).length;
  const mapCount = Object.keys(maps).length;
  const dropCount = Object.values(DROPS).reduce((sum, drops) => sum + drops.length, 0);
  
  const bossCount = Object.values(monsters).filter((m: any) => m.isBoss).length;
  const maxLevel = Math.max(...Object.values(monsters).map((m: any) => m.level));
  const minLevel = Math.min(...Object.values(monsters).map((m: any) => m.level));
  
  return {
    monsters: monsterCount,
    items: itemCount,
    maps: mapCount,
    drops: dropCount,
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

export async function searchItems(query: string): Promise<ItemInfo[]> {
  const items = await getItems();
  const lowerQuery = query.toLowerCase();
  return Object.values(items).filter((item: any) =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.typeInfo?.overallCategory?.toLowerCase().includes(lowerQuery) ||
    item.typeInfo?.subCategory?.toLowerCase().includes(lowerQuery) ||
    item.description?.toLowerCase().includes(lowerQuery)
  ) as ItemInfo[];
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

// 아이템 획득 가이드
export async function getItemAcquisitionGuide(itemId: number) {
  const items = await getItems();
  const item = items[itemId];
  if (!item) return null;
  
  const monsters = await getMonstersByItem(itemId);
  const maps = await getMaps();
  
  const dropInfos = monsters.map(monster => {
    const drops = DROPS[monster.id] || [];
    const drop = drops.find(d => d.itemId === itemId);
    return {
      monster,
      drop,
      maps: monster.maps.map(mapId => maps[mapId]).filter(Boolean),
    };
  });
  
  // 드롭률 높은 순으로 정렬
  const rateOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
  dropInfos.sort((a, b) => {
    if (!a.drop || !b.drop) return 0;
    return rateOrder[b.drop.dropRate] - rateOrder[a.drop.dropRate];
  });
  
  return {
    item,
    sources: dropInfos,
  };
}