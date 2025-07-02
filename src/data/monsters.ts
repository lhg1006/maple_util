// 메이플스토리 몬스터 정보
export interface MonsterInfo {
  id: number;
  name: string;
  level: number;
  hp: number;
  exp: number;
  region: string;
  maps: number[]; // 출현 맵 ID들
  attackType: 'melee' | 'ranged' | 'magic';
  element?: 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'dark' | 'neutral';
  description?: string;
  isBoss?: boolean;
  respawnTime?: number; // 초 단위
}

export const MONSTERS: Record<number, MonsterInfo> = {
  // 초보자 몬스터
  100100: {
    id: 100100,
    name: '달팽이',
    level: 1,
    hp: 25,
    exp: 3,
    region: '초보자 섬',
    maps: [1],
    attackType: 'melee',
    element: 'neutral',
    description: '메이플 월드에서 가장 약한 몬스터',
  },
  100101: {
    id: 100101,
    name: '파란 달팽이',
    level: 3,
    hp: 50,
    exp: 8,
    region: '초보자 섬',
    maps: [1],
    attackType: 'melee',
    element: 'ice',
    description: '차가운 기운을 내뿜는 파란 달팽이',
  },
  100102: {
    id: 100102,
    name: '빨간 달팽이',
    level: 5,
    hp: 80,
    exp: 15,
    region: '초보자 섬',
    maps: [1],
    attackType: 'melee',
    element: 'fire',
    description: '뜨거운 기운을 내뿜는 빨간 달팽이',
  },
  100004: {
    id: 100004,
    name: '주황버섯',
    level: 4,
    hp: 60,
    exp: 12,
    region: '초보자 섬',
    maps: [1, 130],
    attackType: 'melee',
    element: 'neutral',
    description: '귀여운 외모의 버섯 몬스터',
  },

  // 빅토리아 아일랜드
  100006: {
    id: 100006,
    name: '슬라임',
    level: 8,
    hp: 150,
    exp: 25,
    region: '빅토리아 아일랜드',
    maps: [120],
    attackType: 'melee',
    element: 'neutral',
    description: '젤리 같은 몸을 가진 몬스터',
  },
  100007: {
    id: 100007,
    name: '돼지',
    level: 12,
    hp: 300,
    exp: 45,
    region: '빅토리아 아일랜드',
    maps: [101, 102],
    attackType: 'melee',
    element: 'neutral',
    description: '농장에서 탈출한 돼지',
  },
  100008: {
    id: 100008,
    name: '리본 돼지',
    level: 15,
    hp: 450,
    exp: 70,
    region: '빅토리아 아일랜드',
    maps: [102, 103],
    attackType: 'melee',
    element: 'neutral',
    description: '분홍 리본을 한 우아한 돼지',
  },
  130100: {
    id: 130100,
    name: '스텀프',
    level: 10,
    hp: 200,
    exp: 35,
    region: '빅토리아 아일랜드',
    maps: [130],
    attackType: 'melee',
    element: 'neutral',
    description: '나무 그루터기가 살아 움직이는 몬스터',
  },

  // 중급 몬스터
  1110100: {
    id: 1110100,
    name: '초록버섯',
    level: 25,
    hp: 800,
    exp: 120,
    region: '빅토리아 아일랜드',
    maps: [130, 301],
    attackType: 'melee',
    element: 'poison',
    description: '독성을 가진 초록색 버섯',
  },
  1110101: {
    id: 1110101,
    name: '뿔버섯',
    level: 28,
    hp: 1200,
    exp: 150,
    region: '빅토리아 아일랜드',
    maps: [130, 301],
    attackType: 'melee',
    element: 'neutral',
    description: '뾰족한 뿔을 가진 버섯 몬스터',
  },
  1120100: {
    id: 1120100,
    name: '옥토퍼스',
    level: 35,
    hp: 2000,
    exp: 250,
    region: '아쿠아리움',
    maps: [4000],
    attackType: 'ranged',
    element: 'neutral',
    description: '8개의 다리로 공격하는 문어',
  },

  // 고급 몬스터
  2220100: {
    id: 2220100,
    name: '좀비버섯',
    level: 50,
    hp: 5000,
    exp: 800,
    region: '엘나스',
    maps: [2001, 2002],
    attackType: 'melee',
    element: 'dark',
    description: '죽음의 기운이 감도는 버섯',
  },
  2230102: {
    id: 2230102,
    name: '와일드 보어',
    level: 55,
    hp: 8000,
    exp: 1200,
    region: '엘나스',
    maps: [2001],
    attackType: 'melee',
    element: 'neutral',
    description: '사나운 야생 멧돼지',
  },
  2230103: {
    id: 2230103,
    name: '아이언 보어',
    level: 65,
    hp: 15000,
    exp: 2000,
    region: '엘나스',
    maps: [2002],
    attackType: 'melee',
    element: 'neutral',
    description: '강철 갑옷을 입은 멧돼지',
  },

  // 골렘 시리즈
  5130101: {
    id: 5130101,
    name: '스톤 골렘',
    level: 80,
    hp: 25000,
    exp: 5000,
    region: '미나르 숲',
    maps: [5000],
    attackType: 'melee',
    element: 'neutral',
    description: '돌로 만들어진 거대한 골렘',
    respawnTime: 300,
  },
  5130102: {
    id: 5130102,
    name: '다크 스톤 골렘',
    level: 95,
    hp: 50000,
    exp: 10000,
    region: '미나르 숲',
    maps: [5000],
    attackType: 'melee',
    element: 'dark',
    description: '어둠의 마력이 깃든 골렘',
    respawnTime: 600,
  },

  // 보스 몬스터
  6130101: {
    id: 6130101,
    name: '머쉬맘',
    level: 40,
    hp: 20000,
    exp: 8000,
    region: '빅토리아 아일랜드',
    maps: [130],
    attackType: 'magic',
    element: 'poison',
    description: '버섯들의 어머니이자 강력한 보스',
    isBoss: true,
    respawnTime: 3600, // 1시간
  },
  8220000: {
    id: 8220000,
    name: '발록',
    level: 120,
    hp: 500000,
    exp: 100000,
    region: '보스',
    maps: [9999],
    attackType: 'magic',
    element: 'fire',
    description: '지옥에서 온 최강의 악마',
    isBoss: true,
    respawnTime: 86400, // 24시간
  },
  8880150: {
    id: 8880150,
    name: '루시드',
    level: 200,
    hp: 2000000,
    exp: 500000,
    region: '보스',
    maps: [9998],
    attackType: 'magic',
    element: 'dark',
    description: '꿈과 현실을 조작하는 환상의 마법사',
    isBoss: true,
    respawnTime: 604800, // 7일
  },
};

// 레벨 범위별 몬스터 분류
export const MONSTERS_BY_LEVEL = {
  '1-10': [100100, 100101, 100102, 100004, 100006, 130100],
  '11-30': [100007, 100008, 1110100, 1110101],
  '31-50': [1120100, 6130101],
  '51-80': [2220100, 2230102, 2230103, 5130101],
  '81-120': [5130102, 8220000],
  '120+': [8880150],
};

// 지역별 몬스터 분류
export const MONSTERS_BY_REGION = {
  '초보자 섬': [100100, 100101, 100102, 100004],
  '빅토리아 아일랜드': [100006, 100007, 100008, 130100, 1110100, 1110101, 6130101],
  '아쿠아리움': [1120100],
  '엘나스': [2220100, 2230102, 2230103],
  '미나르 숲': [5130101, 5130102],
  '보스': [8220000, 8880150],
};

// 보스 몬스터 목록
export const BOSS_MONSTERS = [6130101, 8220000, 8880150];

// 공격 타입별 분류
export const MONSTERS_BY_ATTACK_TYPE = {
  melee: [100100, 100101, 100102, 100004, 100006, 100007, 100008, 130100, 1110100, 1110101, 2220100, 2230102, 2230103, 5130101, 5130102],
  ranged: [1120100],
  magic: [6130101, 8220000, 8880150],
};

// 속성별 분류
export const MONSTERS_BY_ELEMENT = {
  neutral: [100100, 100004, 100006, 100007, 100008, 130100, 1110101, 1120100, 2230102, 2230103, 5130101],
  fire: [100102, 8220000],
  ice: [100101],
  poison: [1110100, 6130101],
  dark: [2220100, 5130102, 8880150],
};