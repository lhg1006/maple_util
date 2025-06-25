export interface MapleItem {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  subcategory?: string;
  cash?: boolean;
  price?: number;
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