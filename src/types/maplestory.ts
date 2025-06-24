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