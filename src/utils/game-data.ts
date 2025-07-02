// 게임 데이터 연결 및 조회 유틸리티
import { MAPS, MapInfo } from '@/data/maps';
import { ITEMS, ItemInfo } from '@/data/items';
import { MONSTERS, MonsterInfo } from '@/data/monsters';
import { DROPS, DropInfo, DROP_RATE_CONFIG, MONSTERS_BY_ITEM } from '@/data/drops';
import { GENERATED_MONSTERS } from '@/data/generated-monsters';
import { GENERATED_ITEMS } from '@/data/generated-items';
import { GENERATED_MAPS } from '@/data/generated-maps';
import { SAMPLE_MONSTERS, SAMPLE_ITEMS, SAMPLE_MAPS } from '@/data/sample-data';
import { getAutoDropsForMonster } from '@/utils/auto-drops';

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
export function getMonsterDetails(monsterId: number): GameData | null {
  // 먼저 하드코딩된 데이터에서 찾기
  let monster = MONSTERS[monsterId];
  
  // 없으면 완전한 데이터에서 찾기
  if (!monster) {
    const completeMonster = SAMPLE_MONSTERS[monsterId];
    if (completeMonster) {
      monster = {
        id: completeMonster.id,
        name: completeMonster.name,
        level: completeMonster.level,
        hp: completeMonster.hp,
        exp: completeMonster.exp,
        region: completeMonster.region,
        maps: completeMonster.maps || [],
        attackType: completeMonster.attackType as 'melee' | 'ranged' | 'magic',
        element: completeMonster.element as any,
        description: completeMonster.description,
        isBoss: completeMonster.isBoss,
      };
    }
    // 폴백: 기존 생성된 데이터
    else {
      const generatedMonster = GENERATED_MONSTERS[monsterId];
      if (generatedMonster) {
        monster = {
          id: generatedMonster.id,
          name: generatedMonster.name,
          level: generatedMonster.level,
          hp: generatedMonster.hp,
          exp: generatedMonster.exp,
          region: generatedMonster.region,
          maps: generatedMonster.maps || [],
          attackType: generatedMonster.attackType as 'melee' | 'ranged' | 'magic',
          element: generatedMonster.element as any,
          description: generatedMonster.description,
          isBoss: generatedMonster.isBoss,
        };
      }
    }
  }
  
  if (!monster) return null;

  // 드롭 정보 조회 및 강화
  let allDrops = DROPS[monsterId] || [];
  
  // 하드코딩된 드롭이 없으면 자동 드롭 생성
  if (allDrops.length === 0) {
    allDrops = getAutoDropsForMonster(monsterId);
  }
  
  const drops = allDrops.map(drop => {
    // 먼저 하드코딩된 아이템에서 찾기
    let item = ITEMS[drop.itemId];
    
    // 없으면 완전한 아이템에서 찾기
    if (!item) {
      const completeItem = SAMPLE_ITEMS[drop.itemId];
      if (completeItem) {
        item = {
          id: completeItem.id,
          name: completeItem.name,
          category: completeItem.category as any,
          subCategory: completeItem.subCategory,
          description: completeItem.description,
          level: completeItem.level,
          rarity: completeItem.rarity as any,
          sellPrice: completeItem.sellPrice,
        };
      }
      // 폴백: 기존 생성된 아이템
      else {
        const generatedItem = GENERATED_ITEMS[drop.itemId];
        if (generatedItem) {
          item = {
            id: generatedItem.id,
            name: generatedItem.name,
            category: generatedItem.category as any,
            subCategory: generatedItem.subCategory,
            description: generatedItem.description,
            level: generatedItem.level,
            rarity: generatedItem.rarity as any,
            sellPrice: generatedItem.sellPrice,
          };
        }
      }
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
  
  // 맵 정보 찾기 (완전한 데이터 우선)
  if (monster.maps && monster.maps.length > 0) {
    maps = monster.maps.map(mapId => 
      MAPS[mapId] || SAMPLE_MAPS[mapId] || GENERATED_MAPS[mapId]
    ).filter(Boolean);
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
export function getMonstersByItem(itemId: number): MonsterInfo[] {
  const monsterIds = MONSTERS_BY_ITEM[itemId] || [];
  return monsterIds.map(id => MONSTERS[id]).filter(Boolean);
}

// 특정 맵의 몬스터 목록 조회
export function getMonstersByMap(mapId: number): MonsterInfo[] {
  return Object.values(MONSTERS).filter(monster => 
    monster.maps.includes(mapId)
  );
}

// 특정 지역의 몬스터 목록 조회
export function getMonstersByRegion(region: string): MonsterInfo[] {
  return Object.values(MONSTERS).filter(monster => 
    monster.region === region
  );
}

// 레벨 범위별 몬스터 조회
export function getMonstersByLevel(minLevel: number, maxLevel: number): MonsterInfo[] {
  return Object.values(MONSTERS).filter(monster => 
    monster.level >= minLevel && monster.level <= maxLevel
  );
}

// 보스 몬스터 목록 조회
export function getBossMonsters(): MonsterInfo[] {
  return Object.values(MONSTERS).filter(monster => monster.isBoss);
}

// 드롭률별 몬스터 조회
export function getMonstersByDropRate(dropRate: keyof typeof DROP_RATE_CONFIG): MonsterInfo[] {
  const monsterIds: number[] = [];
  
  Object.entries(DROPS).forEach(([monsterId, drops]) => {
    if (drops.some(drop => drop.dropRate === dropRate)) {
      monsterIds.push(parseInt(monsterId));
    }
  });
  
  return monsterIds.map(id => MONSTERS[id]).filter(Boolean);
}

// 특정 아이템 카테고리를 드롭하는 몬스터 조회
export function getMonstersByItemCategory(category: ItemInfo['category']): MonsterInfo[] {
  const monsterIds: number[] = [];
  
  Object.entries(DROPS).forEach(([monsterId, drops]) => {
    const hasCategory = drops.some(drop => {
      const item = ITEMS[drop.itemId];
      return item && item.category === category;
    });
    
    if (hasCategory) {
      monsterIds.push(parseInt(monsterId));
    }
  });
  
  return monsterIds.map(id => MONSTERS[id]).filter(Boolean);
}

// 통계 함수들
export function getGameStats() {
  const monsterCount = Object.keys(MONSTERS).length;
  const itemCount = Object.keys(ITEMS).length;
  const mapCount = Object.keys(MAPS).length;
  const dropCount = Object.values(DROPS).reduce((sum, drops) => sum + drops.length, 0);
  
  const bossCount = Object.values(MONSTERS).filter(m => m.isBoss).length;
  const maxLevel = Math.max(...Object.values(MONSTERS).map(m => m.level));
  const minLevel = Math.min(...Object.values(MONSTERS).map(m => m.level));
  
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
export function searchMonsters(query: string): MonsterInfo[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(MONSTERS).filter(monster =>
    monster.name.toLowerCase().includes(lowerQuery) ||
    monster.region.toLowerCase().includes(lowerQuery) ||
    monster.description?.toLowerCase().includes(lowerQuery)
  );
}

export function searchItems(query: string): ItemInfo[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(ITEMS).filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery) ||
    item.subCategory?.toLowerCase().includes(lowerQuery) ||
    item.description?.toLowerCase().includes(lowerQuery)
  );
}

export function searchMaps(query: string): MapInfo[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(MAPS).filter(map =>
    map.name.toLowerCase().includes(lowerQuery) ||
    map.region.toLowerCase().includes(lowerQuery) ||
    map.levelRange.toLowerCase().includes(lowerQuery) ||
    map.description?.toLowerCase().includes(lowerQuery)
  );
}

// 추천 시스템
export function getRecommendedMonsters(level: number, region?: string): MonsterInfo[] {
  let monsters = Object.values(MONSTERS);
  
  // 레벨 기반 필터링 (±10 레벨)
  monsters = monsters.filter(monster => 
    Math.abs(monster.level - level) <= 10
  );
  
  // 지역 기반 필터링 (선택적)
  if (region) {
    monsters = monsters.filter(monster => monster.region === region);
  }
  
  // 레벨 차이 기준으로 정렬
  monsters.sort((a, b) => 
    Math.abs(a.level - level) - Math.abs(b.level - level)
  );
  
  return monsters.slice(0, 10); // 상위 10개만 반환
}

// 아이템 획득 가이드
export function getItemAcquisitionGuide(itemId: number) {
  const item = ITEMS[itemId];
  if (!item) return null;
  
  const monsters = getMonstersByItem(itemId);
  const dropInfos = monsters.map(monster => {
    const drops = DROPS[monster.id] || [];
    const drop = drops.find(d => d.itemId === itemId);
    return {
      monster,
      drop,
      maps: monster.maps.map(mapId => MAPS[mapId]).filter(Boolean),
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