// 장비 요구 조건
export interface ItemRequirements {
  level: number;
  str: number;
  dex: number;
  int: number;
  luk: number;
  job: number;
}

// 전투 관련 스탯
export interface ItemCombatStats {
  attack: number;
  magicAttack: number;
  defense: number;
  magicDefense: number;
  accuracy: number;
  avoidability: number;
  speed: number;
  jump: number;
  bossDamage?: number;
  ignoreDefense?: number;
}

// 기본 스탯 증가
export interface ItemStatBonus {
  str: number;
  dex: number;
  int: number;
  luk: number;
  hp: number;
  mp: number;
}

// 강화 정보
export interface ItemEnhancement {
  upgradeSlots: number;
  attackSpeed: number;
  isUnique: boolean;
  isCash: boolean;
}

// 셋 아이템 정보
export interface ItemSetInfo {
  setId: number;
  setName: string;
  completeCount: number;
}

// 특수 속성
export interface ItemSpecialProps {
  tradeable: boolean;
  sellable: boolean;
  expireOnLogout: boolean;
  accountSharable: boolean;
}

// 무기 정보
export interface ItemWeaponInfo {
  attackSpeed: number;
  weaponType: string;
  isTwoHanded: boolean;
}

// 방어구 정보
export interface ItemArmorInfo {
  slot: string;
  bodyPart: string;
}

// 장신구 정보
export interface ItemAccessoryInfo {
  type: string;
  typeKorean: string;
}

export interface MapleItem {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  subcategory?: string;
  cash?: boolean;
  price?: number;
  level?: number;
  rarity?: string;
  // 확장된 장비 정보
  requirements?: ItemRequirements;
  combat?: ItemCombatStats;
  stats?: ItemStatBonus;
  enhancement?: ItemEnhancement;
  setInfo?: ItemSetInfo;
  special?: ItemSpecialProps;
  weapon?: ItemWeaponInfo;
  armor?: ItemArmorInfo;
  accessory?: ItemAccessoryInfo;
  // 내부 필드
  _hasValidStats?: boolean;
  _noStatsAvailable?: boolean;
}

// API Response 타입
export interface MapleItemResponse {
  id: number;
  description: {
    id: number;
    name: string;
    description: string;
  };
  metaInfo: {
    only: boolean;
    cash: boolean;
    mob: number;
    icon: string;
    iconRaw: string;
    iconOrigin?: {
      hasValue: boolean;
      value: {
        x: number;
        y: number;
        isEmpty: boolean;
      };
    };
    slotMax: number;
    price: number;
  };
  typeInfo: {
    overallCategory: string;
    category: string;
    subCategory: string;
    lowItemId: number;
    highItemId: number;
  };
}

export interface MapleNPC {
  id: number;
  name: string;
  description?: string;
  location?: string;
  scripts?: string[];
  map?: {
    id: number;
    name: string;
    category?: string;
    region?: string;
  };
  func?: string;
  sprites?: any[];
}

export interface MapleMob {
  id: number;
  name: string;
  // API 최상위 필드들
  linksTo?: number;
  foundAt?: number[];
  framebooks?: {
    die1?: number;
    hit1?: number;
    move?: number;
    stand?: number;
  };
  // meta 객체에서 나오는 필드들
  level?: number;
  maxHP?: number;
  exp?: number;
  isBodyAttack?: boolean;
  speed?: number;
  physicalDamage?: number;
  magicDamage?: number;
  accuracy?: number;
  minimumPushDamage?: number;
  summonType?: number;
  revivesMonsterId?: number[];
  linksToOtherMob?: number;
  physicalDefenseRate?: number;
  magicDefenseRate?: number;
  // 기존 호환성 필드들
  hp?: number;
  mp?: number;
  location?: string;
  drops?: MapleItem[];
  description?: string;
  category?: string;
  boss?: boolean;
  undead?: boolean;
  bodyAttack?: boolean;
  firstAttack?: boolean;
  explosive?: boolean;
  publicReward?: boolean;
  pad?: number; // 물리 공격력
  mad?: number; // 마법 공격력
  pdd?: number; // 물리 방어력
  mdd?: number; // 마법 방어력
  acc?: number; // 명중률
  eva?: number; // 회피율
  pdr?: number; // 물리 데미지 감소
  mdr?: number; // 마법 데미지 감소
  hpRecovery?: number;
  mpRecovery?: number;
  link?: number;
  fs?: number;
  buff?: any;
  skill?: any;
  revive?: any;
  meta?: {
    [key: string]: any;
  };
}

export interface MapleJob {
  id: number;
  name: string;
  description?: string;
  category: string;
  advancement: number;
  stats?: {
    str: number;
    dex: number;
    int: number;
    luk: number;
    hp: number;
    mp: number;
  };
  weapon?: string[];
  skills?: MapleSkill[];
}

export interface MapleSkill {
  id: number;
  name: string;
  description: string;
  jobId: number;
  jobName: string;
  type: 'active' | 'passive' | 'buff' | 'debuff' | 'summon';
  maxLevel: number;
  preRequisite?: number | null;
  element: string;
  effect: string;
}

export interface MapleRegion {
  id: string;
  name: string;
  version: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}