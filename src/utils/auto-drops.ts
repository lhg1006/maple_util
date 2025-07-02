// 자동 드롭 데이터 생성 유틸리티 (osmlib.com 방식 참고)
import { loadMonsters, loadItems } from '@/lib/cdn-data-loader';
import { DropInfo } from '@/data/drops';

// 데이터 캐시
let cachedMonsters: any = null;
let cachedItems: any = null;

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

// osmlib.com 스타일의 정밀한 드롭 확률 매핑
const DROP_RATE_PERCENTAGES = {
  common: { min: 30, max: 80 },      // 30-80%
  uncommon: { min: 15, max: 35 },    // 15-35%
  rare: { min: 5, max: 15 },         // 5-15%
  epic: { min: 1, max: 5 },          // 1-5%
  legendary: { min: 0.1, max: 1 },   // 0.1-1%
};

// 몬스터 레벨별 기본 드롭 아이템 생성
export async function generateAutoDrops(monsterId: number): Promise<DropInfo[]> {
  const monsters = await getMonsters();
  const monster = monsters[monsterId];
  if (!monster) return [];

  const drops: DropInfo[] = [];
  const level = monster.level || 1;

  // osmlib.com 스타일 - 레벨별 정밀한 회복 아이템 드롭
  if (level <= 10) {
    drops.push(
      { itemId: 2000000, dropRate: 'common', minQuantity: 1, maxQuantity: 3 }, // 빨간 포션 (60%)
      { itemId: 2000003, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 }, // 파란 포션 (25%)
      { itemId: 2010000, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 1 }, // 사과 (20%)
    );
  } else if (level <= 30) {
    drops.push(
      { itemId: 2000001, dropRate: 'common', minQuantity: 1, maxQuantity: 2 }, // 주황 포션 (50%)
      { itemId: 2000002, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 }, // 흰 포션 (30%)
      { itemId: 2000003, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 1 }, // 파란 포션 (25%)
    );
  } else if (level <= 60) {
    drops.push(
      { itemId: 2000002, dropRate: 'common', minQuantity: 1, maxQuantity: 2 }, // 흰 포션 (45%)
      { itemId: 2000004, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 }, // 엘릭서 (8%)
      { itemId: 2020006, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 }, // 마나 물약 (6%)
    );
  } else if (level <= 120) {
    drops.push(
      { itemId: 2000004, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 1 }, // 엘릭서 (20%)
      { itemId: 2000005, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 }, // 파워 엘릭서 (7%)
      { itemId: 2020013, dropRate: 'epic', minQuantity: 1, maxQuantity: 1 }, // 생명의 물 (2%)
    );
  } else {
    drops.push(
      { itemId: 2000005, dropRate: 'common', minQuantity: 1, maxQuantity: 2 }, // 파워 엘릭서 (40%)
      { itemId: 2022179, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 }, // 오닉스 사과 (5%)
      { itemId: 2020013, dropRate: 'epic', minQuantity: 1, maxQuantity: 1 }, // 생명의 물 (3%)
    );
  }

  // 몬스터 타입별 재료 아이템
  const monsterName = monster.name.toLowerCase();
  
  // 달팽이 계열
  if (monsterName.includes('달팽이')) {
    drops.push({ itemId: 4000019, dropRate: 'common', minQuantity: 1, maxQuantity: 1 }); // 달팽이 껍질
  }
  
  // 버섯 계열
  else if (monsterName.includes('버섯') || monsterName.includes('스포아')) {
    if (monsterName.includes('주황')) {
      drops.push({ itemId: 4000004, dropRate: 'common', minQuantity: 1, maxQuantity: 2 }); // 주황버섯 갓
    } else if (monsterName.includes('초록')) {
      drops.push({ itemId: 4000005, dropRate: 'common', minQuantity: 1, maxQuantity: 2 }); // 초록버섯 갓
    } else if (monsterName.includes('뿔')) {
      drops.push({ itemId: 4000006, dropRate: 'common', minQuantity: 1, maxQuantity: 2 }); // 뿔버섯 갓
    } else {
      drops.push({ itemId: 4000004, dropRate: 'common', minQuantity: 1, maxQuantity: 1 }); // 기본 버섯 갓
    }
  }
  
  // 슬라임 계열
  else if (monsterName.includes('슬라임')) {
    drops.push({ itemId: 4000009, dropRate: 'common', minQuantity: 1, maxQuantity: 2 }); // 슬라임의 기포
  }
  
  // 돼지 계열
  else if (monsterName.includes('돼지')) {
    drops.push(
      { itemId: 4000002, dropRate: 'common', minQuantity: 1, maxQuantity: 1 }, // 돼지의 리본
      { itemId: 2010002, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 }, // 고기
    );
  }
  
  // 스텀프 계열
  else if (monsterName.includes('스텀프')) {
    drops.push({ itemId: 4000003, dropRate: 'common', minQuantity: 1, maxQuantity: 3 }); // 나뭇가지
  }

  // osmlib.com 스타일 - 보스 몬스터 특별 드롭 시스템
  if (monster.isBoss || level > 100 || monsterName.includes('보스') || monsterName.includes('킹')) {
    drops.push(
      { itemId: 2000005, dropRate: 'uncommon', minQuantity: 2, maxQuantity: 5 }, // 파워 엘릭서 (25%)
      { itemId: 2020013, dropRate: 'rare', minQuantity: 1, maxQuantity: 2 }, // 생명의 물 (10%)
    );
    
    // 중급 보스 (레벨 50-100)
    if (level >= 50 && level <= 100) {
      drops.push({ itemId: 2040501, dropRate: 'epic', minQuantity: 1, maxQuantity: 1 }); // 공격력 주문서 60% (3%)
    }
    
    // 고급 보스 (레벨 100-150)
    if (level > 100 && level <= 150) {
      drops.push(
        { itemId: 2040502, dropRate: 'legendary', minQuantity: 1, maxQuantity: 1 }, // 공격력 주문서 10% (0.5%)
        { itemId: 1082223, dropRate: 'epic', minQuantity: 1, maxQuantity: 1 }, // 스톰캐스터 장갑 (2%)
      );
    }
    
    // 최고급 보스 (레벨 150+)
    if (level > 150) {
      drops.push(
        { itemId: 2022179, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 }, // 오닉스 사과 (8%)
        { itemId: 1072344, dropRate: 'legendary', minQuantity: 1, maxQuantity: 1 }, // 파프니르 윈드체이서 (0.3%)
        { itemId: 1113149, dropRate: 'legendary', minQuantity: 1, maxQuantity: 1 }, // 루시드의 반지 (0.2%)
      );
    }
  }

  // 지역별 특별 아이템
  const region = monster.region;
  if (region === '엘나스' && level > 50) {
    drops.push({ itemId: 2020006, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 1 }); // 마나 물약
  }
  
  if (region === '루디브리엄' && level > 60) {
    drops.push({ itemId: 2020004, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 }); // 마력 물약
  }

  return drops;
}

// 모든 생성된 몬스터에 대한 자동 드롭 생성
export async function generateAllAutoDrops(): Promise<Record<number, DropInfo[]>> {
  const monsters = await getMonsters();
  const autoDrops: Record<number, DropInfo[]> = {};
  
  for (const monster of Object.values(monsters) as any[]) {
    const drops = await generateAutoDrops(monster.id);
    if (drops.length > 0) {
      autoDrops[monster.id] = drops;
    }
  }
  
  return autoDrops;
}

// 특정 몬스터의 자동 드롭 조회 (기존 드롭과 병합)
export async function getAutoDropsForMonster(monsterId: number): Promise<DropInfo[]> {
  return await generateAutoDrops(monsterId);
}