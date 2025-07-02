// 몬스터 드롭 정보
export interface DropInfo {
  itemId: number;
  dropRate: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  minQuantity?: number;
  maxQuantity?: number;
  questRequired?: boolean;
  levelRequired?: number;
}

export const DROPS: Record<number, DropInfo[]> = {
  // 달팽이 (100100)
  100100: [
    { itemId: 4000019, dropRate: 'common', minQuantity: 1, maxQuantity: 1 },
    { itemId: 2000000, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { itemId: 2000001, dropRate: 'rare', minQuantity: 1, maxQuantity: 2 },
  ],

  // 파란 달팽이 (100101)
  100101: [
    { itemId: 4000000, dropRate: 'common', minQuantity: 1, maxQuantity: 1 },
    { itemId: 2000000, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000002, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
  ],

  // 빨간 달팽이 (100102)
  100102: [
    { itemId: 4000001, dropRate: 'common', minQuantity: 1, maxQuantity: 1 },
    { itemId: 2000001, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000003, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
  ],

  // 주황버섯 (100004)
  100004: [
    { itemId: 4000004, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000001, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { itemId: 2000002, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2010000, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
  ],

  // 슬라임 (100006)
  100006: [
    { itemId: 4000009, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000002, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000003, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
  ],

  // 돼지 (100007)
  100007: [
    { itemId: 4000002, dropRate: 'common', minQuantity: 1, maxQuantity: 1 },
    { itemId: 2000002, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { itemId: 2010002, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
  ],

  // 리본 돼지 (100008)
  100008: [
    { itemId: 4000002, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000003, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2010002, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2020012, dropRate: 'legendary', minQuantity: 1, maxQuantity: 1 },
  ],

  // 스텀프 (130100)
  130100: [
    { itemId: 4000003, dropRate: 'common', minQuantity: 1, maxQuantity: 3 },
    { itemId: 2000002, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2010000, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
  ],

  // 초록버섯 (1110100)
  1110100: [
    { itemId: 4000005, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000003, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { itemId: 2020001, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
  ],

  // 뿔버섯 (1110101)
  1110101: [
    { itemId: 4000006, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000003, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2020002, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
  ],

  // 옥토퍼스 (1120100)
  1120100: [
    { itemId: 4000010, dropRate: 'common', minQuantity: 1, maxQuantity: 3 },
    { itemId: 2000003, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2020004, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
  ],

  // 좀비버섯 (2220100)
  2220100: [
    { itemId: 4000008, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000004, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
    { itemId: 2020006, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
  ],

  // 와일드 보어 (2230102)
  2230102: [
    { itemId: 4000024, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000004, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2020006, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 1 },
  ],

  // 아이언 보어 (2230103)
  2230103: [
    { itemId: 4000025, dropRate: 'common', minQuantity: 1, maxQuantity: 1 },
    { itemId: 2000004, dropRate: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2020007, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
  ],

  // 스톤 골렘 (5130101)
  5130101: [
    { itemId: 4000021, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000005, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
    { itemId: 2040501, dropRate: 'legendary', minQuantity: 1, maxQuantity: 1 },
  ],

  // 다크 스톤 골렘 (5130102)
  5130102: [
    { itemId: 4000022, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2000005, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
    { itemId: 2040502, dropRate: 'legendary', minQuantity: 1, maxQuantity: 1 },
  ],

  // 머쉬맘 (6130101) - 보스
  6130101: [
    { itemId: 4000011, dropRate: 'common', minQuantity: 2, maxQuantity: 5 },
    { itemId: 2000005, dropRate: 'rare', minQuantity: 1, maxQuantity: 2 },
    { itemId: 2020013, dropRate: 'epic', minQuantity: 1, maxQuantity: 1 },
    { itemId: 1002357, dropRate: 'legendary', minQuantity: 1, maxQuantity: 1 },
  ],

  // 발록 (8220000) - 보스
  8220000: [
    { itemId: 4001017, dropRate: 'common', minQuantity: 1, maxQuantity: 3 },
    { itemId: 2022179, dropRate: 'rare', minQuantity: 1, maxQuantity: 2 },
    { itemId: 1082223, dropRate: 'epic', minQuantity: 1, maxQuantity: 1 },
    { itemId: 1072344, dropRate: 'legendary', minQuantity: 1, maxQuantity: 1 },
  ],

  // 루시드 (8880150) - 보스
  8880150: [
    { itemId: 4033356, dropRate: 'common', minQuantity: 1, maxQuantity: 2 },
    { itemId: 1132174, dropRate: 'rare', minQuantity: 1, maxQuantity: 1 },
    { itemId: 1113149, dropRate: 'legendary', minQuantity: 1, maxQuantity: 1 },
  ],
};

// osmlib.com 스타일 - 정밀한 드롭률 색상 및 표시 텍스트
export const DROP_RATE_CONFIG = {
  common: { color: '#52c41a', text: '흔함', probability: '30-80%', displayText: '흔함 (30-80%)' },
  uncommon: { color: '#1890ff', text: '보통', probability: '15-35%', displayText: '보통 (15-35%)' },
  rare: { color: '#fa8c16', text: '드물게', probability: '5-15%', displayText: '드물게 (5-15%)' },
  epic: { color: '#f5222d', text: '희귀', probability: '1-5%', displayText: '희귀 (1-5%)' },
  legendary: { color: '#722ed1', text: '매우 희귀', probability: '0.1-1%', displayText: '매우 희귀 (0.1-1%)' },
};

// 드롭률별 분류 (검색용)
export const DROPS_BY_RARITY = {
  common: Object.entries(DROPS).reduce((acc, [monsterId, drops]) => {
    const commonDrops = drops.filter(drop => drop.dropRate === 'common');
    if (commonDrops.length > 0) {
      acc[parseInt(monsterId)] = commonDrops;
    }
    return acc;
  }, {} as Record<number, DropInfo[]>),
  
  uncommon: Object.entries(DROPS).reduce((acc, [monsterId, drops]) => {
    const uncommonDrops = drops.filter(drop => drop.dropRate === 'uncommon');
    if (uncommonDrops.length > 0) {
      acc[parseInt(monsterId)] = uncommonDrops;
    }
    return acc;
  }, {} as Record<number, DropInfo[]>),
  
  rare: Object.entries(DROPS).reduce((acc, [monsterId, drops]) => {
    const rareDrops = drops.filter(drop => drop.dropRate === 'rare');
    if (rareDrops.length > 0) {
      acc[parseInt(monsterId)] = rareDrops;
    }
    return acc;
  }, {} as Record<number, DropInfo[]>),
  
  epic: Object.entries(DROPS).reduce((acc, [monsterId, drops]) => {
    const epicDrops = drops.filter(drop => drop.dropRate === 'epic');
    if (epicDrops.length > 0) {
      acc[parseInt(monsterId)] = epicDrops;
    }
    return acc;
  }, {} as Record<number, DropInfo[]>),
  
  legendary: Object.entries(DROPS).reduce((acc, [monsterId, drops]) => {
    const legendaryDrops = drops.filter(drop => drop.dropRate === 'legendary');
    if (legendaryDrops.length > 0) {
      acc[parseInt(monsterId)] = legendaryDrops;
    }
    return acc;
  }, {} as Record<number, DropInfo[]>),
};

// 아이템별 드롭하는 몬스터 목록
export const MONSTERS_BY_ITEM: Record<number, number[]> = {};

// 아이템별 드롭하는 몬스터 목록 생성
Object.entries(DROPS).forEach(([monsterId, drops]) => {
  const monsterIdNum = parseInt(monsterId);
  drops.forEach(drop => {
    if (!MONSTERS_BY_ITEM[drop.itemId]) {
      MONSTERS_BY_ITEM[drop.itemId] = [];
    }
    MONSTERS_BY_ITEM[drop.itemId].push(monsterIdNum);
  });
});