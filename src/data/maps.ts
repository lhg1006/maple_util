// 메이플스토리 맵 정보
export interface MapInfo {
  id: number;
  name: string;
  region: string;
  levelRange: string;
  description?: string;
}

export const MAPS: Record<number, MapInfo> = {
  // 초보자 섬
  0: { id: 0, name: '메이플 아일랜드', region: '초보자 섬', levelRange: '1-10', description: '모험의 시작점' },
  1: { id: 1, name: '남쪽 숲', region: '초보자 섬', levelRange: '1-5', description: '달팽이와 주황버섯이 서식하는 평화로운 숲' },
  2: { id: 2, name: '훈련소', region: '초보자 섬', levelRange: '5-10', description: '기본 전투 훈련을 받는 곳' },

  // 빅토리아 아일랜드
  100: { id: 100, name: '헤네시스', region: '빅토리아 아일랜드', levelRange: '10-30', description: '활잡이들의 마을' },
  101: { id: 101, name: '헤네시스 사냥터 1', region: '빅토리아 아일랜드', levelRange: '10-15' },
  102: { id: 102, name: '헤네시스 사냥터 2', region: '빅토리아 아일랜드', levelRange: '15-20' },
  103: { id: 103, name: '헤네시스 사냥터 3', region: '빅토리아 아일랜드', levelRange: '20-25' },
  
  110: { id: 110, name: '커닝시티', region: '빅토리아 아일랜드', levelRange: '10-30', description: '도적들의 마을' },
  111: { id: 111, name: '커닝시티 지하', region: '빅토리아 아일랜드', levelRange: '15-25' },
  
  120: { id: 120, name: '슬라임 나무', region: '빅토리아 아일랜드', levelRange: '15-25', description: '슬라임들이 사는 거대한 나무' },
  130: { id: 130, name: '버섯의 숲', region: '빅토리아 아일랜드', levelRange: '10-20', description: '각종 버섯 몬스터들의 서식지' },

  // 페리온
  200: { id: 200, name: '페리온', region: '빅토리아 아일랜드', levelRange: '20-40', description: '전사들의 마을' },
  201: { id: 201, name: '페리온 사냥터', region: '빅토리아 아일랜드', levelRange: '20-35' },

  // 엘리니아
  300: { id: 300, name: '엘리니아', region: '빅토리아 아일랜드', levelRange: '20-40', description: '마법사들의 마을' },
  301: { id: 301, name: '엘리니아 숲', region: '빅토리아 아일랜드', levelRange: '20-35' },

  // 리스항구
  400: { id: 400, name: '리스항구', region: '빅토리아 아일랜드', levelRange: '25-45', description: '해적들의 마을' },

  // 오르비스
  1000: { id: 1000, name: '오르비스', region: '오르비스', levelRange: '30-60', description: '하늘의 도시' },
  1001: { id: 1001, name: '구름 공원', region: '오르비스', levelRange: '35-50' },

  // 엘나스
  2000: { id: 2000, name: '엘나스', region: '엘나스', levelRange: '50-80', description: '얼음의 땅' },
  2001: { id: 2001, name: '얼음 골짜기', region: '엘나스', levelRange: '50-70' },
  2002: { id: 2002, name: '얼음 동굴', region: '엘나스', levelRange: '60-80' },

  // 루디브리엄
  3000: { id: 3000, name: '루디브리엄', region: '루디브리엄', levelRange: '60-100', description: '장난감의 도시' },
  3001: { id: 3001, name: '시계탑', region: '루디브리엄', levelRange: '70-90' },
  3002: { id: 3002, name: '장난감 공장', region: '루디브리엄', levelRange: '80-100' },

  // 아쿠아리움
  4000: { id: 4000, name: '아쿠아리움', region: '아쿠아리움', levelRange: '80-120', description: '바다 속 세계' },

  // 미나르 숲
  5000: { id: 5000, name: '미나르 숲', region: '미나르 숲', levelRange: '100-140', description: '고대의 숲' },

  // 니할 사막
  6000: { id: 6000, name: '니할 사막', region: '니할 사막', levelRange: '120-160', description: '모래바람이 부는 사막' },

  // 보스 맵
  9999: { id: 9999, name: '발록 던전', region: '보스', levelRange: '200+', description: '발록과의 최종 결전' },
  9998: { id: 9998, name: '루시드의 꿈', region: '보스', levelRange: '200+', description: '환상과 현실이 뒤섞인 공간' },
};

// 지역별 맵 분류
export const MAP_REGIONS = {
  '초보자 섬': [0, 1, 2],
  '빅토리아 아일랜드': [100, 101, 102, 103, 110, 111, 120, 130, 200, 201, 300, 301, 400],
  '오르비스': [1000, 1001],
  '엘나스': [2000, 2001, 2002],
  '루디브리엄': [3000, 3001, 3002],
  '아쿠아리움': [4000],
  '미나르 숲': [5000],
  '니할 사막': [6000],
  '보스': [9999, 9998],
};

// 레벨 범위별 맵 분류
export const MAPS_BY_LEVEL = {
  '1-10': [0, 1, 2],
  '10-30': [100, 101, 102, 103, 110, 111, 120, 130],
  '20-40': [200, 201, 300, 301],
  '25-45': [400],
  '30-60': [1000, 1001],
  '50-80': [2000, 2001, 2002],
  '60-100': [3000, 3001, 3002],
  '80-120': [4000],
  '100-140': [5000],
  '120-160': [6000],
  '200+': [9999, 9998],
};