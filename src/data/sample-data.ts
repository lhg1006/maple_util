// 샘플 데이터 (작동 테스트용)
export interface SampleItem {
  id: number;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  [key: string]: any;
}

export interface SampleMonster {
  id: number;
  name: string;
  level?: number;
  hp?: number;
  exp?: number;
  [key: string]: any;
}

export interface SampleMap {
  id: number;
  name: string;
  streetName?: string;
  region?: string;
  [key: string]: any;
}

// 샘플 아이템 데이터
export const SAMPLE_ITEMS: Record<number, SampleItem> = {
  2000000: {
    id: 2000000,
    name: "빨간 포션",
    category: "Use",
    subcategory: "Recovery",
    description: "HP를 50 회복시킨다.",
    originalData: {
      typeInfo: { overallCategory: "Use", category: "Recovery", subCategory: "HP Recovery" }
    }
  },
  2000001: {
    id: 2000001,
    name: "주황 포션",
    category: "Use", 
    subcategory: "Recovery",
    description: "HP를 150 회복시킨다.",
    originalData: {
      typeInfo: { overallCategory: "Use", category: "Recovery", subCategory: "HP Recovery" }
    }
  },
  1002140: {
    id: 1002140,
    name: "빨간 모자",
    category: "Equip",
    subcategory: "Hat", 
    description: "빨간색 모자",
    originalData: {
      typeInfo: { overallCategory: "Equip", category: "Armor", subCategory: "Hat" }
    }
  }
};

// 샘플 몬스터 데이터
export const SAMPLE_MONSTERS: Record<number, SampleMonster> = {
  100100: {
    id: 100100,
    name: "달팽이",
    level: 1,
    hp: 15,
    exp: 1
  },
  100200: {
    id: 100200,
    name: "파란달팽이",
    level: 2,
    hp: 25,
    exp: 2
  },
  100300: {
    id: 100300,
    name: "빨간달팽이", 
    level: 3,
    hp: 35,
    exp: 3
  }
};

// 샘플 맵 데이터
export const SAMPLE_MAPS: Record<number, SampleMap> = {
  10000: {
    id: 10000,
    name: "단풍나무 언덕",
    streetName: "메이플로드",
    region: "메이플로드"
  },
  20000: {
    id: 20000,
    name: "달팽이동산",
    streetName: "메이플로드", 
    region: "메이플로드"
  }
};