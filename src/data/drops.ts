// 몬스터 드롭 정보
export interface DropInfo {
  itemId: number;
  dropRate: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  minQuantity?: number;
  maxQuantity?: number;
}

// 드롭률 설정
export const DROP_RATE_CONFIG = {
  common: { text: '일반', displayText: '30-80%', color: '#52c41a' },
  uncommon: { text: '언커먼', displayText: '15-35%', color: '#1677ff' },
  rare: { text: '레어', displayText: '5-15%', color: '#722ed1' },
  epic: { text: '에픽', displayText: '1-5%', color: '#eb2f96' },
  legendary: { text: '레전더리', displayText: '0.1-1%', color: '#fa8c16' },
};

// 몬스터별 드롭 정보 (하드코딩된 데이터)
export const DROPS: Record<number, DropInfo[]> = {
  // 기본적으로 빈 객체, 자동 생성 드롭에 의존
};

// 아이템별 몬스터 매핑
export const MONSTERS_BY_ITEM: Record<number, number[]> = {
  // 기본적으로 빈 객체
};