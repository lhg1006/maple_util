// 메이플스토리 아이템 정보
export interface ItemInfo {
  id: number;
  name: string;
  category: 'equip' | 'use' | 'setup' | 'etc' | 'cash' | 'material';
  subCategory?: string;
  description?: string;
  level?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'unique' | 'legendary';
  sellPrice?: number;
}

export const ITEMS: Record<number, ItemInfo> = {
  // 회복 아이템 (Use)
  2000000: { id: 2000000, name: '빨간 포션', category: 'use', subCategory: '회복', description: 'HP를 50 회복', sellPrice: 20 },
  2000001: { id: 2000001, name: '주황 포션', category: 'use', subCategory: '회복', description: 'HP를 150 회복', sellPrice: 50 },
  2000002: { id: 2000002, name: '흰 포션', category: 'use', subCategory: '회복', description: 'HP를 300 회복', sellPrice: 100 },
  2000003: { id: 2000003, name: '파란 포션', category: 'use', subCategory: '회복', description: 'MP를 100 회복', sellPrice: 50 },
  2000004: { id: 2000004, name: '엘릭서', category: 'use', subCategory: '회복', description: 'HP와 MP를 완전 회복', sellPrice: 500 },
  2000005: { id: 2000005, name: '파워 엘릭서', category: 'use', subCategory: '회복', description: 'HP와 MP를 완전 회복 (고급)', sellPrice: 1000 },

  // 음식 아이템 (Use)
  2010000: { id: 2010000, name: '사과', category: 'use', subCategory: '음식', description: 'HP를 30 회복', sellPrice: 16 },
  2010002: { id: 2010002, name: '고기', category: 'use', subCategory: '음식', description: 'HP를 200 회복', sellPrice: 60 },

  // 특수 포션 (Use)
  2020001: { id: 2020001, name: '붉은 약초', category: 'use', subCategory: '특수', description: '공격력 일시 증가', sellPrice: 100 },
  2020002: { id: 2020002, name: '푸른 약초', category: 'use', subCategory: '특수', description: '마법력 일시 증가', sellPrice: 100 },
  2020004: { id: 2020004, name: '마력 물약', category: 'use', subCategory: '특수', description: 'MP 회복량 증가', sellPrice: 150 },
  2020006: { id: 2020006, name: '마나 물약', category: 'use', subCategory: '특수', description: 'MP 지속 회복', sellPrice: 200 },
  2020007: { id: 2020007, name: '체력 물약', category: 'use', subCategory: '특수', description: 'HP 지속 회복', sellPrice: 200 },
  2020012: { id: 2020012, name: '마나 엘릭서', category: 'use', subCategory: '특수', description: 'MP 완전 회복', sellPrice: 800 },
  2020013: { id: 2020013, name: '생명의 물', category: 'use', subCategory: '특수', description: '최대 HP 일시 증가', sellPrice: 1500, rarity: 'rare' },

  // 고급 회복 아이템
  2022179: { id: 2022179, name: '오닉스 사과', category: 'use', subCategory: '회복', description: 'HP와 MP를 대량 회복', sellPrice: 2000, rarity: 'epic' },

  // 몬스터 재료 (Etc)
  4000000: { id: 4000000, name: '파란 달팽이 껍질', category: 'etc', subCategory: '몬스터 재료', description: '파란 달팽이에서 얻는 껍질', sellPrice: 5 },
  4000001: { id: 4000001, name: '빨간 달팽이 껍질', category: 'etc', subCategory: '몬스터 재료', description: '빨간 달팽이에서 얻는 껍질', sellPrice: 5 },
  4000002: { id: 4000002, name: '돼지의 리본', category: 'etc', subCategory: '몬스터 재료', description: '돼지가 차고 있던 리본', sellPrice: 8 },
  4000003: { id: 4000003, name: '나뭇가지', category: 'etc', subCategory: '몬스터 재료', description: '스텀프에서 얻는 단단한 가지', sellPrice: 3 },
  4000004: { id: 4000004, name: '주황버섯 갓', category: 'etc', subCategory: '몬스터 재료', description: '주황버섯의 갓 부분', sellPrice: 4 },
  4000005: { id: 4000005, name: '초록버섯 갓', category: 'etc', subCategory: '몬스터 재료', description: '초록버섯의 갓 부분', sellPrice: 6 },
  4000006: { id: 4000006, name: '뿔버섯 갓', category: 'etc', subCategory: '몬스터 재료', description: '뿔버섯의 갓 부분', sellPrice: 7 },
  4000008: { id: 4000008, name: '좀비버섯 갓', category: 'etc', subCategory: '몬스터 재료', description: '좀비버섯의 갓 부분', sellPrice: 15 },
  4000009: { id: 4000009, name: '슬라임의 기포', category: 'etc', subCategory: '몬스터 재료', description: '슬라임이 만든 기포', sellPrice: 6 },
  4000010: { id: 4000010, name: '문어 다리', category: 'etc', subCategory: '몬스터 재료', description: '옥토퍼스의 다리', sellPrice: 12 },
  4000011: { id: 4000011, name: '머쉬맘의 포자', category: 'etc', subCategory: '몬스터 재료', description: '머쉬맘이 뿌리는 독특한 포자', sellPrice: 50, rarity: 'rare' },
  4000019: { id: 4000019, name: '달팽이 껍질', category: 'etc', subCategory: '몬스터 재료', description: '일반 달팽이의 껍질', sellPrice: 3 },
  4000021: { id: 4000021, name: '스톤 골렘의 돌덩이', category: 'etc', subCategory: '몬스터 재료', description: '스톤 골렘의 단단한 돌덩이', sellPrice: 25 },
  4000022: { id: 4000022, name: '다크 스톤 골렘의 돌덩이', category: 'etc', subCategory: '몬스터 재료', description: '다크 스톤 골렘의 마력이 담긴 돌덩이', sellPrice: 40, rarity: 'rare' },
  4000024: { id: 4000024, name: '와일드 보어의 이빨', category: 'etc', subCategory: '몬스터 재료', description: '와일드 보어의 날카로운 이빨', sellPrice: 18 },
  4000025: { id: 4000025, name: '아이언 보어의 갑옷 조각', category: 'etc', subCategory: '몬스터 재료', description: '아이언 보어의 단단한 갑옷 조각', sellPrice: 30 },

  // 보스 재료
  4001017: { id: 4001017, name: '발록의 가죽', category: 'etc', subCategory: '보스 재료', description: '발록의 강인한 가죽', sellPrice: 5000, rarity: 'epic' },
  4033356: { id: 4033356, name: '꿈의 조각', category: 'etc', subCategory: '보스 재료', description: '루시드의 꿈에서 나온 신비한 조각', sellPrice: 10000, rarity: 'legendary' },

  // 장비 - 모자
  1002357: { id: 1002357, name: '스포아 모자', category: 'equip', subCategory: '모자', description: '머쉬맘의 포자로 만든 모자', level: 35, rarity: 'rare' },

  // 장비 - 장갑
  1082223: { id: 1082223, name: '스톰캐스터 장갑', category: 'equip', subCategory: '장갑', description: '폭풍을 다루는 마법사의 장갑', level: 120, rarity: 'epic' },

  // 장비 - 신발
  1072344: { id: 1072344, name: '파프니르 윈드체이서', category: 'equip', subCategory: '신발', description: '바람의 속도로 달릴 수 있는 신발', level: 150, rarity: 'legendary' },

  // 장비 - 벨트
  1132174: { id: 1132174, name: '몽환의 벨트', category: 'equip', subCategory: '벨트', description: '꿈과 현실을 잇는 신비한 벨트', level: 140, rarity: 'epic' },

  // 장비 - 반지
  1113149: { id: 1113149, name: '루시드의 반지', category: 'equip', subCategory: '반지', description: '루시드의 힘이 깃든 반지', level: 160, rarity: 'legendary' },

  // 주문서 (Setup)
  2040501: { id: 2040501, name: '전체 공격력 주문서 60%', category: 'setup', subCategory: '주문서', description: '무기의 공격력을 증가시키는 주문서 (60% 성공률)', rarity: 'rare' },
  2040502: { id: 2040502, name: '전체 공격력 주문서 10%', category: 'setup', subCategory: '주문서', description: '무기의 공격력을 크게 증가시키는 주문서 (10% 성공률)', rarity: 'epic' },
};

// 카테고리별 아이템 분류
export const ITEMS_BY_CATEGORY = {
  use: {
    '회복': [2000000, 2000001, 2000002, 2000003, 2000004, 2000005, 2022179],
    '음식': [2010000, 2010002],
    '특수': [2020001, 2020002, 2020004, 2020006, 2020007, 2020012, 2020013],
  },
  etc: {
    '몬스터 재료': [4000000, 4000001, 4000002, 4000003, 4000004, 4000005, 4000006, 4000008, 4000009, 4000010, 4000019, 4000021, 4000022, 4000024, 4000025],
    '보스 재료': [4001017, 4033356, 4000011],
  },
  equip: {
    '모자': [1002357],
    '장갑': [1082223],
    '신발': [1072344],
    '벨트': [1132174],
    '반지': [1113149],
  },
  setup: {
    '주문서': [2040501, 2040502],
  },
};

// 레어도별 아이템 분류
export const ITEMS_BY_RARITY = {
  common: [2000000, 2000001, 2000002, 2000003, 2010000, 2010002, 4000000, 4000001, 4000002, 4000003, 4000004, 4000005, 4000006, 4000008, 4000009, 4000010, 4000019, 4000021, 4000024],
  rare: [2000004, 2020013, 4000011, 4000022, 1002357, 2040501],
  epic: [2000005, 2022179, 4001017, 1082223, 1132174, 2040502],
  legendary: [4033356, 1072344, 1113149],
};