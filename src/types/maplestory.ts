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
}

export interface MapleMob {
  id: number;
  name: string;
  level: number;
  hp: number;
  mp: number;
  exp: number;
  location?: string;
  drops?: MapleItem[];
}

export interface MapleJob {
  id: number;
  name: string;
  description?: string;
  branch?: string;
  advancement?: number;
  skills?: MapleSkill[];
}

export interface MapleSkill {
  id: number;
  name: string;
  description?: string;
  maxLevel: number;
  jobId: number;
  icon?: string;
  type?: 'active' | 'passive' | 'buff';
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